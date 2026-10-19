package main

import (
	"context"
	"net/http"
	"os/exec"
	"regexp"
	"runtime"
	"strconv"
	"strings"
	"sync"
	"time"
)

// The server room: everything the Mac serves, checked from the Mac itself, and the Mac's own
// numbers. Checked only while someone is in the room, at most once every 45 seconds.

// Service is one thing the Mac serves. OK means it answered through its tunnel like it should.
type Service struct {
	Name, Kind, URL string
	Accept          []int // codes beyond 2xx and 3xx that still mean up
	Checked, OK     bool
	Took            time.Duration
}

var roomServices = []Service{
	{Name: "captainclaw.lol", Kind: "game · claw tunnel", URL: "https://captainclaw.lol"},
	{Name: "claw multiplayer", Kind: "relay · /mp", URL: "https://captainclaw.lol/mp/healthz"},
	{Name: "stonerow.cc", Kind: "next.js · postgres", URL: "https://stonerow.cc"},
	{Name: "argus.xin", Kind: "discord bot", URL: "https://argus.xin"},
	{Name: "csstats.rohan.my", Kind: "extension api", URL: "https://csstats.rohan.my"},
	{Name: "snake.rohan.my", Kind: "laya plays snake", URL: "https://snake.rohan.my/health"},
	{Name: "chiron.rohan.my", Kind: "behind a password", URL: "https://chiron.rohan.my", Accept: []int{401}},
	{Name: "home.rohan.my", Kind: "the dashboard", URL: "https://home.rohan.my"},
	{Name: "status.rohan.my", Kind: "uptime kuma", URL: "https://status.rohan.my"},
	{Name: "budget.rohan.my", Kind: "actual budget", URL: "https://budget.rohan.my"},
	{Name: "watch.rohan.my", Kind: "changedetection", URL: "https://watch.rohan.my"},
	{Name: "tweets.rohan.my", Kind: "nitter", URL: "https://tweets.rohan.my"},
	{Name: "portainer.rohan.my", Kind: "containers", URL: "https://portainer.rohan.my"},
	{Name: "laya.rohan.my", Kind: "the assistant's api", URL: "https://laya.rohan.my/health"},
	{Name: "inbox.rohan.my", Kind: "laya's inbox", URL: "https://inbox.rohan.my/health"},
}

// Machine is the Mac under the desk. Zero values mean it could not be read (or this is not a Mac).
type Machine struct {
	Model, OS  string
	Boot       time.Time
	Tunnels    int
	Containers int // -1: Docker did not answer
}

// WantRoom says someone is in the server room: check now if the last look is stale, and keep
// checking each minute for the next five.
func (l *Live) WantRoom() {
	l.mu.Lock()
	l.wantRoom = time.Now()
	stale := time.Since(l.snap.RoomChecked) > 45*time.Second
	l.mu.Unlock()
	if stale {
		go l.checkRoom()
	}
}

func (l *Live) roomWanted() bool {
	l.mu.RLock()
	defer l.mu.RUnlock()
	return time.Since(l.wantRoom) < 5*time.Minute
}

func (l *Live) checkRoom() {
	l.mu.Lock()
	if l.roomBusy {
		l.mu.Unlock()
		return
	}
	l.roomBusy = true
	l.mu.Unlock()

	client := &http.Client{
		Timeout:       8 * time.Second,
		CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse },
	}
	out := make([]Service, len(roomServices))
	var wg sync.WaitGroup
	for i, s := range roomServices {
		wg.Add(1)
		go func(i int, s Service) {
			defer wg.Done()
			start := time.Now()
			s.Checked = true
			if res, err := client.Get(s.URL); err == nil {
				res.Body.Close()
				s.OK = res.StatusCode >= 200 && res.StatusCode < 400
				for _, c := range s.Accept {
					s.OK = s.OK || res.StatusCode == c
				}
			}
			s.Took = time.Since(start)
			out[i] = s
		}(i, s)
	}
	machine := readMachine()
	wg.Wait()

	l.mu.Lock()
	l.snap.Services, l.snap.Machine, l.snap.RoomChecked = out, machine, time.Now()
	l.roomBusy = false
	l.mu.Unlock()
}

var (
	modelOnce sync.Once
	modelName string
	bootRe    = regexp.MustCompile(`sec = (\d+)`)
)

func readMachine() *Machine {
	if runtime.GOOS != "darwin" {
		return &Machine{Containers: -1}
	}
	ctx, cancel := context.WithTimeout(context.Background(), 6*time.Second)
	defer cancel()
	sh := func(name string, args ...string) string {
		b, err := exec.CommandContext(ctx, name, args...).Output()
		if err != nil {
			return ""
		}
		return strings.TrimSpace(string(b))
	}
	count := func(s string) int {
		if s == "" {
			return 0
		}
		return len(strings.Split(s, "\n"))
	}
	modelOnce.Do(func() {
		for _, line := range strings.Split(sh("/usr/sbin/system_profiler", "SPHardwareDataType"), "\n") {
			if k, v, ok := strings.Cut(strings.TrimSpace(line), ":"); ok && k == "Model Name" {
				modelName = strings.TrimSpace(v)
			}
		}
	})
	m := &Machine{Model: modelName, OS: sh("/usr/bin/sw_vers", "-productVersion"), Tunnels: count(sh("/usr/bin/pgrep", "-x", "cloudflared")), Containers: -1}
	if g := bootRe.FindStringSubmatch(sh("/usr/sbin/sysctl", "-n", "kern.boottime")); g != nil {
		if sec, err := strconv.ParseInt(g[1], 10, 64); err == nil {
			m.Boot = time.Unix(sec, 0)
		}
	}
	if b, err := exec.CommandContext(ctx, "/usr/local/bin/docker", "ps", "-q").Output(); err == nil {
		m.Containers = count(strings.TrimSpace(string(b)))
	}
	return m
}

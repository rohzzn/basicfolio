package main

import (
	"context"
	"encoding/json"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"sync"
	"time"
)

// Probe is one way to ask whether something is up: an HTTP URL, or an address that should greet
// with an SSH banner. Probes go through the public hostnames where there are any, so a check
// covers Cloudflare and the tunnel as well as the program behind them.
type Probe struct {
	URL    string
	Accept []int // codes beyond 2xx and 3xx that still mean up
	TCP    string
}

// Target is one row on the Home page. Everything but Probes is shown; Probes never are.
type Target struct {
	ID, Name, About string
	Host, Link      string // a public link, only for things meant to be visited
	Group           string
	Probes          []Probe
}

const (
	groupSites  = "Sites"
	groupBehind = "Behind them"
)

var targets = []Target{
	{ID: "claw", Name: "Captain Claw", Host: "captainclaw.lol", Link: "https://captainclaw.lol", About: "the 1997 game, in a browser, with multiplayer", Group: groupSites,
		Probes: []Probe{{URL: "https://captainclaw.lol"}}},
	{ID: "stonerow", Name: "StoneRow", Host: "stonerow.cc", Link: "https://stonerow.cc", About: "the StoneRow site", Group: groupSites,
		Probes: []Probe{{URL: "https://stonerow.cc"}}},
	{ID: "argus", Name: "Argus", Host: "argus.xin", Link: "https://argus.xin", About: "a Discord bot", Group: groupSites,
		Probes: []Probe{{URL: "https://argus.xin"}}},
	{ID: "csstats", Name: "csstats", Host: "csstats.rohan.my", Link: "https://csstats.rohan.my", About: "CS2 stats in a browser extension", Group: groupSites,
		Probes: []Probe{{URL: "https://csstats.rohan.my"}}},
	{ID: "snake", Name: "Snake", Host: "snake.rohan.my", Link: "https://snake.rohan.my", About: "an AI playing snake, live", Group: groupSites,
		Probes: []Probe{{URL: "https://snake.rohan.my/health"}}},
	{ID: "ssh", Name: "ssh rohan.my", About: "this portfolio, in a terminal: type ssh rohan.my", Group: groupSites,
		Probes: []Probe{{TCP: "127.0.0.1:2222"}}},
	{ID: "chiron", Name: "Chiron", About: "private", Group: groupSites,
		Probes: []Probe{{URL: "https://chiron.rohan.my", Accept: []int{401}}}},

	{ID: "claw-mp", Name: "Claw multiplayer", About: "the rooms Captain Claw players meet in", Group: groupBehind,
		Probes: []Probe{{URL: "https://captainclaw.lol/mp/healthz"}}},
	{ID: "stonerow-app", Name: "StoneRow app", Host: "app.stonerow.cc", Link: "https://app.stonerow.cc", About: "sign in to StoneRow", Group: groupBehind,
		Probes: []Probe{{URL: "https://app.stonerow.cc"}}},
	{ID: "csstats-api", Name: "csstats API", About: "the lookups the extension makes", Group: groupBehind,
		Probes: []Probe{{URL: "http://127.0.0.1:3000/readyz"}}},
	{ID: "laya", Name: "Laya", About: "a personal assistant, private", Group: groupBehind,
		Probes: []Probe{{URL: "https://laya.rohan.my/health"}, {URL: "https://inbox.rohan.my/health"}}},
}

// Result is the latest answer for one target.
type Result struct {
	Up   bool
	Took time.Duration
	SSH  bool // answered with a banner rather than over HTTP
	At   time.Time
}

// The last 24 hours of checks, in half-hour slots.
const (
	slotLen  = 30 * time.Minute
	numSlots = 48
)

type Slot struct {
	Start int64 `json:"start"`
	OK    int   `json:"ok"`
	Fail  int   `json:"fail"`
}

// Store holds everything the pages show, refreshed in the background.
type Store struct {
	statePath string
	client    *http.Client

	mu      sync.RWMutex
	results map[string]Result
	history map[string][]Slot
	checked time.Time
	mac     *Mac
	docker  *Docker
	agents  map[string]Agent
	tunnels int
	weather *Weather
	now     func() time.Time
	offline bool // tests: never touch the network or the machine
}

func newStore(statePath string) *Store {
	s := &Store{
		statePath: statePath,
		client: &http.Client{
			Timeout:       8 * time.Second,
			CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse },
		},
		results: map[string]Result{},
		history: map[string][]Slot{},
		now:     time.Now,
	}
	s.load()
	return s
}

// run checks everything once a minute and the weather every 15 minutes, until ctx ends.
func (s *Store) run(ctx context.Context) {
	tick := time.NewTicker(time.Minute)
	defer tick.Stop()
	for round := 0; ; round++ {
		var wg sync.WaitGroup
		wg.Add(2)
		go func() { defer wg.Done(); s.checkAll(ctx) }()
		go func() { defer wg.Done(); s.readMachine(ctx) }()
		if round%15 == 0 {
			go s.readWeather(ctx)
		}
		wg.Wait()
		s.save()
		select {
		case <-ctx.Done():
			return
		case <-tick.C:
		}
	}
}

func (s *Store) checkAll(ctx context.Context) {
	type answer struct {
		id string
		r  Result
	}
	out := make(chan answer, len(targets))
	for _, t := range targets {
		go func(t Target) {
			r := Result{Up: true, At: time.Now()}
			for _, p := range t.Probes {
				ok, took := s.probe(ctx, p)
				r.Up = r.Up && ok
				r.Took = max(r.Took, took)
				r.SSH = p.TCP != ""
			}
			out <- answer{t.ID, r}
		}(t)
	}
	at := time.Now()
	s.mu.Lock()
	defer s.mu.Unlock()
	for range targets {
		a := <-out
		s.results[a.id] = a.r
		s.history[a.id] = record(s.history[a.id], a.r.Up, at)
	}
	s.checked = at
}

func (s *Store) probe(ctx context.Context, p Probe) (bool, time.Duration) {
	ctx, cancel := context.WithTimeout(ctx, 8*time.Second)
	defer cancel()
	start := time.Now()
	if p.TCP != "" {
		var d net.Dialer
		c, err := d.DialContext(ctx, "tcp", p.TCP)
		if err != nil {
			return false, time.Since(start)
		}
		defer c.Close()
		_ = c.SetDeadline(time.Now().Add(5 * time.Second))
		banner := make([]byte, 4)
		_, err = io.ReadFull(c, banner)
		return err == nil && string(banner) == "SSH-", time.Since(start)
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, p.URL, nil)
	if err != nil {
		return false, 0
	}
	req.Header.Set("User-Agent", "home.rohan.my")
	res, err := s.client.Do(req)
	if err != nil {
		return false, time.Since(start)
	}
	_, _ = io.Copy(io.Discard, io.LimitReader(res.Body, 64<<10))
	res.Body.Close()
	took := time.Since(start)
	ok := res.StatusCode >= 200 && res.StatusCode < 400
	for _, c := range p.Accept {
		ok = ok || res.StatusCode == c
	}
	return ok, took
}

// record adds one check to a target's slots and drops slots older than a day.
func record(h []Slot, up bool, at time.Time) []Slot {
	start := at.Truncate(slotLen).Unix()
	if n := len(h); n == 0 || h[n-1].Start != start {
		h = append(h, Slot{Start: start})
	}
	if up {
		h[len(h)-1].OK++
	} else {
		h[len(h)-1].Fail++
	}
	oldest := start - int64((numSlots-1)*slotLen/time.Second)
	for len(h) > 0 && h[0].Start < oldest {
		h = h[1:]
	}
	return h
}

type saved struct {
	History map[string][]Slot `json:"history"`
}

func (s *Store) load() {
	b, err := os.ReadFile(s.statePath)
	if err != nil {
		return
	}
	var v saved
	if json.Unmarshal(b, &v) == nil && v.History != nil {
		s.history = v.History
	}
}

func (s *Store) save() {
	if s.offline {
		return
	}
	s.mu.RLock()
	b, err := json.Marshal(saved{History: s.history})
	s.mu.RUnlock()
	if err != nil {
		return
	}
	tmp := s.statePath + ".tmp"
	if err := os.WriteFile(tmp, b, 0o644); err != nil {
		log.Printf("saving history: %v", err)
		return
	}
	_ = os.Rename(tmp, s.statePath)
}

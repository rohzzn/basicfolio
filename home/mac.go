package main

import (
	"bufio"
	"context"
	"encoding/json"
	"os/exec"
	"regexp"
	"runtime"
	"strconv"
	"strings"
	"sync"
	"time"
)

// Mac is the machine itself. Zero values mean a reading failed.
type Mac struct {
	Model, Chip      string
	Cores            int
	MemBytes         int64
	Boot             time.Time
	Busy             float64 // percent of the processor in use
	MemUsedMB        int
	Pressure         int // 1 normal, 2 warning, 4 critical
	MemFree          int // percent free, counting what compression can give back
	DiskKB, DiskUsed int64
	DiskFree         int64
	OnAC, Charged    bool
	Battery          int // percent, -1 unknown
}

// Docker is what is running in Docker Desktop's VM. Nil on a Store means Docker didn't answer.
type Docker struct {
	Cores      int
	MemBytes   int64
	Containers []Container
}

type Container struct {
	Name    string
	Project string // compose project, if any
	CPU     float64
	MemMB   float64
}

// Agent is a launchd job: running if it has a PID, and the status it last exited with.
type Agent struct {
	Running bool
	Status  int
}

var modelOnce sync.Once
var model, chip string

func (s *Store) readMachine(ctx context.Context) {
	if s.offline || runtime.GOOS != "darwin" {
		return
	}
	ctx, cancel := context.WithTimeout(ctx, 20*time.Second)
	defer cancel()
	sh := func(name string, args ...string) string {
		b, _ := exec.CommandContext(ctx, name, args...).Output()
		return string(b)
	}

	var (
		m       = &Mac{Battery: -1}
		d       *Docker
		agents  map[string]Agent
		tunnels int
		wg      sync.WaitGroup
	)
	wg.Add(3)
	go func() {
		defer wg.Done()
		m.Busy, m.MemUsedMB = parseTop(sh("/usr/bin/top", "-l", "2", "-n", "0", "-s", "1"))
	}()
	go func() {
		defer wg.Done()
		d = readDocker(ctx)
	}()
	go func() {
		defer wg.Done()
		agents = parseLaunchctl(sh("/bin/launchctl", "list"))
		tunnels = countLines(sh("/usr/bin/pgrep", "-x", "cloudflared"))
	}()

	modelOnce.Do(func() {
		for _, line := range strings.Split(sh("/usr/sbin/system_profiler", "SPHardwareDataType"), "\n") {
			k, v, ok := strings.Cut(strings.TrimSpace(line), ":")
			switch {
			case ok && k == "Model Name":
				model = strings.TrimSpace(v)
			case ok && k == "Chip":
				chip = strings.TrimSpace(v)
			}
		}
	})
	m.Model, m.Chip = model, chip
	m.Cores, _ = strconv.Atoi(strings.TrimSpace(sh("/usr/sbin/sysctl", "-n", "hw.ncpu")))
	m.MemBytes, _ = strconv.ParseInt(strings.TrimSpace(sh("/usr/sbin/sysctl", "-n", "hw.memsize")), 10, 64)
	m.Pressure, _ = strconv.Atoi(strings.TrimSpace(sh("/usr/sbin/sysctl", "-n", "kern.memorystatus_vm_pressure_level")))
	m.MemFree, _ = strconv.Atoi(strings.TrimSpace(sh("/usr/sbin/sysctl", "-n", "kern.memorystatus_level")))
	m.Boot = parseBoot(sh("/usr/sbin/sysctl", "-n", "kern.boottime"))
	m.DiskKB, m.DiskUsed, m.DiskFree = parseDF(sh("/bin/df", "-k", "/System/Volumes/Data"))
	m.OnAC, m.Charged, m.Battery = parsePmset(sh("/usr/bin/pmset", "-g", "batt"))
	wg.Wait()

	s.mu.Lock()
	s.mac, s.docker, s.agents, s.tunnels = m, d, agents, tunnels
	s.mu.Unlock()
}

func readDocker(ctx context.Context) *Docker {
	docker := "/usr/local/bin/docker"
	info, err := exec.CommandContext(ctx, docker, "info", "--format", "{{.NCPU}} {{.MemTotal}}").Output()
	if err != nil {
		return nil
	}
	d := &Docker{}
	if f := strings.Fields(string(info)); len(f) == 2 {
		d.Cores, _ = strconv.Atoi(f[0])
		d.MemBytes, _ = strconv.ParseInt(f[1], 10, 64)
	}
	ps, err := exec.CommandContext(ctx, docker, "ps", "--format", "{{json .}}").Output()
	if err != nil {
		return nil
	}
	stats, err := exec.CommandContext(ctx, docker, "stats", "--no-stream", "--format", "{{json .}}").Output()
	if err != nil {
		return nil
	}
	d.Containers = parseDocker(string(ps), string(stats))
	return d
}

var (
	idleRe    = regexp.MustCompile(`([\d.]+)% idle`)
	physRe    = regexp.MustCompile(`PhysMem: (\d+)([MG]) used`)
	bootRe    = regexp.MustCompile(`sec = (\d+)`)
	batteryRe = regexp.MustCompile(`(\d+)%; ([a-zA-Z ]+);`)
	sizeRe    = regexp.MustCompile(`^([\d.]+)\s*([a-zA-Z]*)$`)
)

// parseTop reads the second sample of top -l 2: the first one covers everything since boot.
func parseTop(out string) (busy float64, usedMB int) {
	for _, line := range strings.Split(out, "\n") {
		if g := idleRe.FindStringSubmatch(line); g != nil {
			idle, _ := strconv.ParseFloat(g[1], 64)
			busy = 100 - idle
		}
		if g := physRe.FindStringSubmatch(line); g != nil {
			n, _ := strconv.Atoi(g[1])
			if g[2] == "G" {
				n *= 1024
			}
			usedMB = n
		}
	}
	return busy, usedMB
}

func parseBoot(out string) time.Time {
	if g := bootRe.FindStringSubmatch(out); g != nil {
		if sec, err := strconv.ParseInt(g[1], 10, 64); err == nil {
			return time.Unix(sec, 0)
		}
	}
	return time.Time{}
}

// parseDF reads df -k: size, used and available, in KB.
func parseDF(out string) (size, used, free int64) {
	lines := strings.Split(strings.TrimSpace(out), "\n")
	if len(lines) < 2 {
		return
	}
	f := strings.Fields(lines[len(lines)-1])
	if len(f) < 4 {
		return
	}
	size, _ = strconv.ParseInt(f[1], 10, 64)
	used, _ = strconv.ParseInt(f[2], 10, 64)
	free, _ = strconv.ParseInt(f[3], 10, 64)
	return
}

func parsePmset(out string) (onAC, charged bool, pct int) {
	pct = -1
	onAC = strings.Contains(out, "'AC Power'")
	if g := batteryRe.FindStringSubmatch(out); g != nil {
		pct, _ = strconv.Atoi(g[1])
		charged = strings.TrimSpace(g[2]) == "charged"
	}
	return
}

// parseLaunchctl reads launchctl list: PID (or -), last exit status, label.
func parseLaunchctl(out string) map[string]Agent {
	agents := map[string]Agent{}
	sc := bufio.NewScanner(strings.NewReader(out))
	for sc.Scan() {
		f := strings.Fields(sc.Text())
		if len(f) != 3 || f[0] == "PID" {
			continue
		}
		status, _ := strconv.Atoi(f[1])
		agents[f[2]] = Agent{Running: f[0] != "-", Status: status}
	}
	return agents
}

func countLines(out string) int {
	n := 0
	for _, l := range strings.Split(out, "\n") {
		if strings.TrimSpace(l) != "" {
			n++
		}
	}
	return n
}

// parseDocker joins docker ps (names and compose projects) with docker stats (CPU and memory).
func parseDocker(ps, stats string) []Container {
	usage := map[string][2]float64{}
	for _, line := range strings.Split(stats, "\n") {
		var v struct{ Name, CPUPerc, MemUsage string }
		if json.Unmarshal([]byte(line), &v) != nil {
			continue
		}
		cpu, _ := strconv.ParseFloat(strings.TrimSuffix(v.CPUPerc, "%"), 64)
		used, _, _ := strings.Cut(v.MemUsage, "/")
		usage[v.Name] = [2]float64{cpu, toMB(strings.TrimSpace(used))}
	}
	var out []Container
	for _, line := range strings.Split(ps, "\n") {
		var v struct{ Names, Labels, State string }
		if json.Unmarshal([]byte(line), &v) != nil || v.State != "running" {
			continue
		}
		c := Container{Name: v.Names}
		for _, l := range strings.Split(v.Labels, ",") {
			if p, ok := strings.CutPrefix(l, "com.docker.compose.project="); ok {
				c.Project = p
			}
		}
		u := usage[v.Names]
		c.CPU, c.MemMB = u[0], u[1]
		out = append(out, c)
	}
	return out
}

// toMB reads sizes the way docker prints them: 185.6MiB, 1.2GiB, 900kB.
func toMB(s string) float64 {
	g := sizeRe.FindStringSubmatch(s)
	if g == nil {
		return 0
	}
	n, _ := strconv.ParseFloat(g[1], 64)
	switch strings.ToLower(g[2]) {
	case "b":
		return n / (1 << 20)
	case "kib", "kb":
		return n / 1024
	case "gib", "gb":
		return n * 1024
	case "tib", "tb":
		return n * 1024 * 1024
	}
	return n
}

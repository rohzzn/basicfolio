package main

import (
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"
	"time"
)

// Real output from the Mac, trimmed.
const (
	topOut = `CPU usage: 3.05% user, 6.10% sys, 90.84% idle
PhysMem: 7400M used (1200M wired, 3000M compressor), 200M unused.
CPU usage: 7.61% user, 6.57% sys, 85.81% idle
PhysMem: 7505M used (1223M wired, 3191M compressor), 110M unused.`
	dfOut        = "Filesystem     1024-blocks      Used Available Capacity iused ifree %iused  Mounted on\n/dev/disk3s5     239362496 156237460  52428800    75%  1.1M  528M    0%   /System/Volumes/Data\n"
	pmsetOut     = "Now drawing from 'AC Power'\n -InternalBattery-0 (id=22741091)\t100%; charged; 0:00 remaining present: true\n"
	bootOut      = "{ sec = 1792265999, usec = 535718 } Sat Oct 17 15:39:59 2026\n"
	launchctlOut = "PID\tStatus\tLabel\n-\t0\tcc.stonerow.backup\n1420\t0\tcom.laya.inbox\n55058\t0\tmy.rohan.ssh\n1424\t0\tcc.stonerow.caddy\n-\t0\tcc.stonerow.vapisync\n" +
		"1404\t0\tmy.rohan.csstats.site\n1407\t0\tcom.laya.server\n1410\t0\tcc.stonerow.app\n48066\t1\tcom.laya.tunnel\n48088\t1\tmy.rohan.claw.tunnel\n48047\t1\tcom.csstats.tunnel\n" +
		"1411\t0\tcom.zenitsubot.voice\n48094\t1\tcc.stonerow.tunnel\n-\t0\tcc.stonerow.maintenance\n1413\t0\tcom.laya.snake\n1425\t0\tmy.rohan.claw.caddy\n48106\t1\tcom.chiron.tunnel\n" +
		"1422\t0\tcc.stonerow.postgres\n1428\t0\tmy.rohan.claw.relay\n60001\t0\tmy.rohan.home\n"
)

func dockerSample() (ps, stats string) {
	type c struct {
		name, project string
		cpu, mem      string
	}
	cs := []c{
		{"zenitsubot-browserless-1", "zenitsubot", "0.42%", "354.8MiB"}, {"zenitsubot-bot-1", "zenitsubot", "0.07%", "315.1MiB"},
		{"zenitsubot-lavalink-1", "zenitsubot", "0.11%", "310.6MiB"}, {"zenitsubot-searxng-1", "zenitsubot", "0.00%", "201.9MiB"},
		{"zenitsubot-yt-cipher-1", "zenitsubot", "0.00%", "116.7MiB"}, {"zenitsubot-db-1", "zenitsubot", "0.00%", "68.99MiB"},
		{"chiron-ask-chiron-1", "chiron-ask", "0.03%", "357.6MiB"}, {"chiron-ask-db-1", "chiron-ask", "0.00%", "86.59MiB"},
		{"chiron-ask-web-1", "chiron-ask", "2.18%", "63.22MiB"}, {"chiron-ask-ask-1", "chiron-ask", "0.02%", "49.45MiB"},
		{"csstats-steam-stats", "csstats-main", "0.01%", "185.2MiB"}, {"drawio", "drawio", "0.38%", "306.5MiB"},
		{"adguard", "adguard", "0.04%", "148.7MiB"}, {"portainer", "", "0.57%", "104.8MiB"},
		{"discord-widget", "discordwidget", "0.00%", "47.2MiB"}, {"nitter", "nitter", "0.01%", "16.41MiB"},
		{"nitter-redis", "nitter", "0.22%", "22.64MiB"}, {"some-new-thing", "", "0.10%", "12MiB"},
	}
	for _, x := range cs {
		labels := "desktop.docker.io/ports.scheme=v2"
		if x.project != "" {
			labels = "com.docker.compose.oneoff=False,com.docker.compose.project=" + x.project + ",com.docker.compose.service=x"
		}
		ps += `{"Names":"` + x.name + `","Labels":"` + labels + `","State":"running","Image":"secret/image:1.2"}` + "\n"
		stats += `{"Name":"` + x.name + `","CPUPerc":"` + x.cpu + `","MemUsage":"` + x.mem + ` / 5.784GiB"}` + "\n"
	}
	return ps, stats
}

// fakeStore is the Mac as it was on 19 October, with a day of checks behind it and one outage.
func fakeStore(t *testing.T) *Store {
	now := time.Date(2026, 10, 19, 13, 41, 0, 0, cincinnati)
	s := newStore(filepath.Join(t.TempDir(), "state.json"))
	s.offline, s.now = true, func() time.Time { return now }

	ms := map[string]int{"claw": 156, "stonerow": 190, "argus": 166, "csstats": 167, "snake": 147, "ssh": 3, "chiron": 118,
		"claw-mp": 72, "stonerow-app": 150, "csstats-api": 5, "laya": 122}
	for _, tg := range targets {
		s.results[tg.ID] = Result{Up: true, Took: time.Duration(ms[tg.ID]) * time.Millisecond, SSH: tg.ID == "ssh", At: now}
		for at := now.Add(-24 * time.Hour); !at.After(now); at = at.Add(time.Minute) {
			up := !(tg.ID == "snake" && at.After(now.Add(-5*time.Hour)) && at.Before(now.Add(-4*time.Hour-40*time.Minute)))
			s.history[tg.ID] = record(s.history[tg.ID], up, at)
		}
	}
	s.checked = now.Add(-20 * time.Second)
	s.weather = &Weather{TempC: 18.3, Code: 0, At: time.Now()}

	m := &Mac{Model: "MacBook Air", Chip: "Apple M2", Cores: 8, MemBytes: 8 << 30, Pressure: 2, MemFree: 45}
	m.Busy, m.MemUsedMB = parseTop(topOut)
	m.DiskKB, m.DiskUsed, m.DiskFree = parseDF(dfOut)
	m.OnAC, m.Charged, m.Battery = parsePmset(pmsetOut)
	m.Boot = parseBoot(bootOut)
	ps, stats := dockerSample()
	s.mac = m
	s.docker = &Docker{Cores: 8, MemBytes: 6210043904, Containers: parseDocker(ps, stats)}
	s.agents = parseLaunchctl(launchctlOut)
	s.tunnels = countLines("48047\n48066\n48088\n48094\n48106\n48150\n")
	return s
}

func TestParsers(t *testing.T) {
	busy, used := parseTop(topOut)
	if int(busy+0.5) != 14 || used != 7505 {
		t.Errorf("top: busy %.2f used %d, want the second sample: 14%% and 7505 MB", busy, used)
	}
	if size, _, free := parseDF(dfOut); size != 239362496 || free != 52428800 {
		t.Errorf("df: %d %d", size, free)
	}
	if ac, charged, pct := parsePmset(pmsetOut); !ac || !charged || pct != 100 {
		t.Errorf("pmset: %v %v %d", ac, charged, pct)
	}
	if b := parseBoot(bootOut); b.Unix() != 1792265999 {
		t.Errorf("boot: %v", b)
	}
	a := parseLaunchctl(launchctlOut)
	if !a["my.rohan.ssh"].Running || a["cc.stonerow.backup"].Running || a["com.laya.tunnel"].Status != 1 {
		t.Errorf("launchctl: %+v", a)
	}
	for in, want := range map[string]float64{"185.6MiB": 185.6, "1.5GiB": 1536, "512KiB": 0.5, "900kB": 900.0 / 1024} {
		if got := toMB(in); got < want-0.01 || got > want+0.01 {
			t.Errorf("toMB(%q) = %v, want %v", in, got, want)
		}
	}
	ps, stats := dockerSample()
	cs := parseDocker(ps, stats)
	if len(cs) != 18 || cs[0].Project != "zenitsubot" || cs[0].MemMB < 354 {
		t.Errorf("docker: %d containers, first %+v", len(cs), cs[0])
	}
}

func TestHistory(t *testing.T) {
	now := time.Date(2026, 10, 19, 13, 41, 0, 0, time.UTC)
	var h []Slot
	for at := now.Add(-30 * time.Hour); !at.After(now); at = at.Add(time.Minute) {
		h = record(h, at.Minute() != 0, at)
	}
	if len(h) != numSlots {
		t.Errorf("kept %d slots, want %d", len(h), numSlots)
	}
	bs, up, _ := bars(h, now)
	if len(bs) != numSlots || bs[0].Class != "part" || up != "98.3%" {
		t.Errorf("bars: %d, first %q, uptime %s", len(bs), bs[0].Class, up)
	}
	if _, up, _ := bars(nil, now); up != "–" {
		t.Errorf("no history should read –, got %s", up)
	}
}

// leaks is everything that must never reach a public page: addresses, ports, images, launchd
// labels, compose projects, and hostnames that are private.
var leaks = regexp.MustCompile(`127\.0\.0\.1|localhost|192\.168\.|100\.\d+\.\d+\.\d+|72\.49\.|:\d{3,5}\b|` +
	`secret/image|zenitsubot|chiron-ask|csstats-main|some-new-thing|nitter|redis|postgres|portainer|adguard|lavalink|searxng|browserless|` +
	`my\.rohan\.|com\.laya|cc\.stonerow|com\.chiron|com\.csstats|launchctl|cloudflared|readyz|/health|` +
	`(laya|inbox|chiron|tweets|status|budget|watch|admin)\.(rohan\.my|stonerow\.cc)`)

func TestPages(t *testing.T) {
	s := fakeStore(t)
	srv := httptest.NewServer(s.routes())
	defer srv.Close()

	for _, path := range []string{"/", "/mac", "/containers", "/network"} {
		res, err := http.Get(srv.URL + path)
		if err != nil {
			t.Fatal(err)
		}
		body, _ := io.ReadAll(res.Body)
		res.Body.Close()
		html := string(body)
		if res.StatusCode != 200 {
			t.Fatalf("%s: %d\n%s", path, res.StatusCode, html)
		}
		if res.Header.Get("Content-Security-Policy") == "" {
			t.Errorf("%s: no CSP", path)
		}
		// fonts and the static files are the only URLs with ports or paths worth skipping
		scan := regexp.MustCompile(`https://fonts\.[^"]+`).ReplaceAllString(html, "")
		if m := leaks.FindAllString(scan, -1); m != nil {
			t.Errorf("%s leaks %q", path, m)
		}
		if os.Getenv("PREVIEW") != "" {
			dir := filepath.Join("out", "preview")
			_ = os.MkdirAll(filepath.Join(dir, "static"), 0o755)
			name := strings.Trim(path, "/")
			if name == "" {
				name = "index"
			}
			local := regexp.MustCompile(`"/static/([a-z.]+)\?v=[0-9a-f]+"`).ReplaceAllString(html, `"static/$1"`)
			_ = os.WriteFile(filepath.Join(dir, name+".html"), []byte(local), 0o644)
		}
	}
	for _, want := range []struct{ path, text string }{
		{"/", "1:41 PM"}, {"/", "18°C and clear"}, {"/", "11 of 11 up"}, {"/", "98.6%"}, {"/", "open"},
		{"/mac", "MacBook Air, Apple M2"}, {"/mac", "up 1 day 22 hours"}, {"/mac", "pressure is raised, 45% free counting compression"}, {"/mac", "18 containers · 12 services · 3 scheduled jobs · 6 tunnels"},
		{"/containers", "18 containers using 2.7 GB."}, {"/containers", "a container"}, {"/containers", "Other"},
		{"/network", "captainclaw.lol"},
	} {
		res, _ := http.Get(srv.URL + want.path)
		b, _ := io.ReadAll(res.Body)
		res.Body.Close()
		if !strings.Contains(string(b), want.text) {
			t.Errorf("%s should say %q", want.path, want.text)
		}
	}
	for _, path := range []string{"/nope", "/static/../main.go", "/mac/"} {
		res, _ := http.Get(srv.URL + path)
		res.Body.Close()
		if res.StatusCode != 404 {
			t.Errorf("%s: %d, want 404", path, res.StatusCode)
		}
	}
}

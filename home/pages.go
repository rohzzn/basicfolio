package main

import (
	"bytes"
	"fmt"
	"html/template"
	"log"
	"math"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"
)

type pageID int

const (
	pageHome pageID = iota
	pageMac
	pageContainers
	pageNetwork
)

var navItems = []struct {
	id         pageID
	name, href string
	title      string
	tmpl       string
}{
	{pageHome, "Home", "/", "home.rohan.my", "home.html"},
	{pageMac, "Mac", "/mac", "The Mac · home.rohan.my", "mac.html"},
	{pageContainers, "Containers", "/containers", "Containers · home.rohan.my", "containers.html"},
	{pageNetwork, "Network", "/network", "Network · home.rohan.my", "network.html"},
}

var (
	cincinnati, india *time.Location
	cssURL            = version("style.css")
	jsURL             = version("app.js")
)

func init() {
	cincinnati, _ = time.LoadLocation("America/New_York")
	india, _ = time.LoadLocation("Asia/Kolkata")
}

var templates = func() map[pageID]*template.Template {
	m := map[pageID]*template.Template{}
	for _, n := range navItems {
		m[n.id] = template.Must(template.ParseFS(files, "templates/layout.html", "templates/"+n.tmpl))
	}
	return m
}()

type nav struct {
	Name, Href string
	Current    bool
}

type layout struct {
	Title, CSS, JS string
	Nav            []nav
	Up, Total      int
	Data           any
}

func (s *Store) page(id pageID) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		body, err := s.render(id)
		if err != nil {
			log.Printf("rendering page %d: %v", id, err)
			http.Error(w, "Something broke. Try again in a minute.", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Header().Set("Cache-Control", "no-store")
		w.Write(body)
	}
}

func (s *Store) render(id pageID) ([]byte, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	l := layout{CSS: cssURL, JS: jsURL, Total: len(targets)}
	for _, n := range navItems {
		l.Nav = append(l.Nav, nav{n.name, n.href, n.id == id})
		if n.id == id {
			l.Title = n.title
		}
	}
	for _, t := range targets {
		if s.results[t.ID].Up {
			l.Up++
		}
	}
	switch id {
	case pageHome:
		l.Data = s.homeData()
	case pageMac:
		l.Data = s.macData()
	case pageContainers:
		l.Data = s.containersData()
	case pageNetwork:
		l.Data = s.networkData()
	}
	var b bytes.Buffer
	err := templates[id].ExecuteTemplate(&b, "layout", l)
	return b.Bytes(), err
}

// ── Home ──

type homeData struct {
	Date, Time, India, Weather, Summary, Checked string
	Groups                                       []rowGroup
}

type rowGroup struct {
	Title string
	Rows  []row
}

type row struct {
	Name, About, Host, Link string
	Dot, Answer, Uptime     string
	Up                      bool
	Bars                    []bar
	HistLabel               string
}

type bar struct{ Class, Title string }

func (s *Store) homeData() homeData {
	now := s.now()
	h := homeData{
		Date:    now.In(cincinnati).Format("Monday, 2 January"),
		Time:    now.In(cincinnati).Format("3:04 PM"),
		India:   now.In(india).Format("3:04 PM"),
		Weather: s.weather.phrase(),
	}
	up := 0
	for _, t := range targets {
		if s.results[t.ID].Up {
			up++
		}
	}
	switch {
	case s.checked.IsZero():
		h.Summary = "the first checks are running now"
	case up == len(targets):
		h.Summary = "it all answered " + ago(now, s.checked)
	default:
		h.Summary = fmt.Sprintf("%d of %d answered %s", up, len(targets), ago(now, s.checked))
	}
	if !s.checked.IsZero() {
		h.Checked = ago(now, s.checked)
	}
	for _, g := range []string{groupSites, groupBehind} {
		rg := rowGroup{Title: g}
		for _, t := range targets {
			if t.Group != g {
				continue
			}
			res, seen := s.results[t.ID]
			r := row{Name: t.Name, About: t.About, Host: t.Host, Link: t.Link, Up: res.Up, Dot: "wait", Answer: "…"}
			if seen {
				r.Dot, r.Answer = "ok", fmt.Sprintf("%d ms", res.Took.Milliseconds())
				if res.SSH {
					r.Answer = "open"
				}
				if !res.Up {
					r.Dot, r.Answer = "down", "down"
				}
			}
			r.Bars, r.Uptime, r.HistLabel = bars(s.history[t.ID], now)
			rg.Rows = append(rg.Rows, r)
		}
		h.Groups = append(h.Groups, rg)
	}
	return h
}

// bars turns a day of slots into 48 bars, oldest first, and the uptime across them.
func bars(h []Slot, now time.Time) ([]bar, string, string) {
	bySlot := map[int64]Slot{}
	ok, total := 0, 0
	for _, sl := range h {
		bySlot[sl.Start] = sl
	}
	cur := now.Truncate(slotLen)
	out := make([]bar, 0, numSlots)
	for i := numSlots - 1; i >= 0; i-- {
		start := cur.Add(-time.Duration(i) * slotLen)
		sl, has := bySlot[start.Unix()]
		when := start.In(cincinnati).Format("3:04") + " to " + start.Add(slotLen).In(cincinnati).Format("3:04 PM")
		b := bar{Class: "none", Title: when + ": not checked"}
		if has && sl.OK+sl.Fail > 0 {
			ok += sl.OK
			total += sl.OK + sl.Fail
			switch {
			case sl.Fail == 0:
				b = bar{"ok", fmt.Sprintf("%s: up for all %d checks", when, sl.OK)}
			case sl.OK == 0:
				b = bar{"down", fmt.Sprintf("%s: down for all %d checks", when, sl.Fail)}
			default:
				b = bar{"part", fmt.Sprintf("%s: down for %d of %d checks", when, sl.Fail, sl.OK+sl.Fail)}
			}
		}
		out = append(out, b)
	}
	if total == 0 {
		return out, "–", "no checks yet"
	}
	pct := 100 * float64(ok) / float64(total)
	up := "100%"
	if ok < total {
		up = strconv.FormatFloat(math.Floor(pct*10)/10, 'f', 1, 64) + "%"
	}
	return out, up, fmt.Sprintf("up for %s of the checks in the last 24 hours", up)
}

// ── Mac ──

type macData struct {
	Known        bool
	Model, Specs string
	Meters       []meter
	Counts       string
	Projects     []project
}

type meter struct {
	Label, Value, Note string
	Pct                int
}

type project struct {
	Name, About, State string
	OK                 bool
}

// projectDef is what each project should have running. Labels are launchd jobs; none are shown.
type projectDef struct {
	Name, About string
	Compose     string // compose project whose containers belong here
	Containers  []string
	Services    []string // should always be running
	Tunnels     []string // launchd jobs that run a tunnel
	Jobs        []string // run on a schedule; fine when the last run exited 0
}

var projects = []projectDef{
	{Name: "Argus", About: "6 containers and a voice service", Compose: "zenitsubot", Services: []string{"com.zenitsubot.voice"}},
	{Name: "StoneRow", About: "3 services, 3 scheduled jobs, its own tunnel",
		Services: []string{"cc.stonerow.app", "cc.stonerow.caddy", "cc.stonerow.postgres"}, Tunnels: []string{"cc.stonerow.tunnel"},
		Jobs: []string{"cc.stonerow.vapisync", "cc.stonerow.backup", "cc.stonerow.maintenance"}},
	{Name: "Captain Claw", About: "a web server and the multiplayer relay, its own tunnel",
		Services: []string{"my.rohan.claw.caddy", "my.rohan.claw.relay"}, Tunnels: []string{"my.rohan.claw.tunnel"}},
	{Name: "Laya", About: "3 services, its own tunnel",
		Services: []string{"com.laya.server", "com.laya.snake", "com.laya.inbox"}, Tunnels: []string{"com.laya.tunnel"}},
	{Name: "Chiron", About: "4 containers, its own tunnel", Compose: "chiron-ask", Tunnels: []string{"com.chiron.tunnel"}},
	{Name: "csstats", About: "a container and a web server, its own tunnel", Compose: "csstats-main",
		Services: []string{"my.rohan.csstats.site"}, Tunnels: []string{"com.csstats.tunnel"}},
	{Name: "ssh rohan.my", About: "one small Go program", Services: []string{"my.rohan.ssh"}},
	{Name: "home.rohan.my", About: "this page, another small Go program", Services: []string{"my.rohan.home"}},
	{Name: "The house", About: "6 containers: the DNS filter and the tools",
		Containers: []string{"adguard", "portainer", "drawio", "discord-widget", "nitter", "nitter-redis"}},
}

// composeSizes is how many containers each compose project should have.
var composeSizes = map[string]int{"zenitsubot": 6, "chiron-ask": 4, "csstats-main": 1}

func (s *Store) macData() macData {
	m := s.mac
	if m == nil {
		return macData{}
	}
	now := s.now()
	d := macData{Known: true, Model: strings.TrimSpace(m.Model + ", " + m.Chip)}
	d.Model = strings.Trim(d.Model, ", ")
	if d.Model == "" {
		d.Model = "The Mac"
	}

	var specs []string
	if m.Cores > 0 {
		specs = append(specs, fmt.Sprintf("%d cores", m.Cores))
	}
	if m.MemBytes > 0 {
		specs = append(specs, fmt.Sprintf("%d GB of memory", m.MemBytes>>30))
	}
	if !m.Boot.IsZero() {
		specs = append(specs, "up "+span(now.Sub(m.Boot)))
	}
	switch {
	case m.OnAC && m.Charged:
		specs = append(specs, "plugged in, battery full")
	case m.OnAC && m.Battery >= 0:
		specs = append(specs, fmt.Sprintf("plugged in, battery at %d%%", m.Battery))
	case m.Battery >= 0:
		specs = append(specs, fmt.Sprintf("on battery, %d%%", m.Battery))
	}
	d.Specs = strings.Join(specs, " · ")

	if m.Cores > 0 {
		d.Meters = append(d.Meters, meter{"Processor", fmt.Sprintf("%.0f%% busy", m.Busy), fmt.Sprintf("across %d cores", m.Cores), pct(m.Busy, 100)})
	}
	if m.MemBytes > 0 && m.MemUsedMB > 0 {
		total := float64(m.MemBytes) / (1 << 30)
		used := float64(m.MemUsedMB) / 1024
		note := map[int]string{1: "pressure is normal", 2: "pressure is raised", 4: "pressure is critical"}[m.Pressure]
		if m.MemFree > 0 {
			note = strings.TrimPrefix(note+fmt.Sprintf(", %d%% free counting compression", m.MemFree), ", ")
		}
		d.Meters = append(d.Meters, meter{"Memory", fmt.Sprintf("%.1f of %.0f GB", used, total), note, pct(used, total)})
	}
	if m.DiskKB > 0 {
		gb := func(kb int64) float64 { return float64(kb) / (1 << 20) }
		d.Meters = append(d.Meters, meter{"Disk", fmt.Sprintf("%.0f of %.0f GB", gb(m.DiskKB-m.DiskFree), gb(m.DiskKB)),
			fmt.Sprintf("%.0f GB free", gb(m.DiskFree)), pct(gb(m.DiskKB-m.DiskFree), gb(m.DiskKB))})
	}
	if dk := s.docker; dk != nil && dk.MemBytes > 0 {
		used := 0.0
		for _, c := range dk.Containers {
			used += c.MemMB
		}
		total := float64(dk.MemBytes) / (1 << 30)
		d.Meters = append(d.Meters, meter{"Docker", fmt.Sprintf("%.1f of %.1f GB", used/1024, total),
			fmt.Sprintf("%d containers, in their own small VM", len(dk.Containers)), pct(used/1024, total)})
	} else {
		d.Meters = append(d.Meters, meter{"Docker", "not answering", "the containers below can't be read", 0})
	}

	running := map[string]bool{}
	byProject := map[string]int{}
	if s.docker != nil {
		for _, c := range s.docker.Containers {
			running[c.Name] = true
			byProject[c.Project]++
		}
	}
	services := 0
	for _, p := range projects {
		want, have := 0, 0
		if p.Compose != "" {
			want += composeSizes[p.Compose]
			have += min(byProject[p.Compose], composeSizes[p.Compose])
		}
		for _, c := range p.Containers {
			want++
			if running[c] {
				have++
			}
		}
		for _, l := range append(append([]string{}, p.Services...), p.Tunnels...) {
			want++
			if s.agents[l].Running {
				have++
			}
		}
		for _, l := range p.Services {
			if s.agents[l].Running {
				services++
			}
		}
		jobsFailed := 0
		for _, l := range p.Jobs {
			if a, ok := s.agents[l]; !ok || a.Status != 0 {
				jobsFailed++
			}
		}
		pr := project{Name: p.Name, About: p.About, State: "running", OK: true}
		switch {
		case have < want:
			pr.State, pr.OK = fmt.Sprintf("%d of %d down", want-have, want), false
		case jobsFailed > 0:
			pr.State, pr.OK = "a job failed", false
		}
		d.Projects = append(d.Projects, pr)
	}
	containers := 0
	if s.docker != nil {
		containers = len(s.docker.Containers)
	}
	jobs := 0
	for _, p := range projects {
		jobs += len(p.Jobs)
	}
	d.Counts = fmt.Sprintf("%s · %s · %d scheduled jobs · %s", plural(containers, "container"), plural(services, "service"), jobs, plural(s.tunnels, "tunnel"))
	return d
}

// ── Containers ──

type containersData struct {
	Known         bool
	Headline, Sub string
	Groups        []cgroup
}

type cgroup struct {
	Title, About, Total string
	Rows                []crow
}

type crow struct {
	Role, CPU, Mem string
	Pct            int
}

// containerRoles says which group each container belongs to and what it does, in plain words.
// A container not listed here still counts, as "a container", so nothing new leaks its name.
var containerRoles = map[string][2]string{
	"zenitsubot-browserless-1": {"Argus", "headless browser"},
	"zenitsubot-bot-1":         {"Argus", "the bot and its site"},
	"zenitsubot-lavalink-1":    {"Argus", "music"},
	"zenitsubot-searxng-1":     {"Argus", "search"},
	"zenitsubot-yt-cipher-1":   {"Argus", "video helper"},
	"zenitsubot-db-1":          {"Argus", "database"},
	"chiron-ask-chiron-1":      {"Chiron", "chiron"},
	"chiron-ask-db-1":          {"Chiron", "database"},
	"chiron-ask-web-1":         {"Chiron", "web"},
	"chiron-ask-ask-1":         {"Chiron", "ask"},
	"csstats-steam-stats":      {"csstats", "stats lookups"},
	"drawio":                   {"The house", "diagrams"},
	"adguard":                  {"The house", "DNS filter"},
	"portainer":                {"The house", "container manager"},
	"discord-widget":           {"The house", "Discord presence"},
	"nitter":                   {"The house", "a Twitter reader"},
	"nitter-redis":             {"The house", "its cache"},
}

var containerGroups = []struct{ name, about string }{
	{"Argus", "the Discord bot"},
	{"Chiron", "private"},
	{"csstats", "stats for the extension"},
	{"The house", "what keeps the Mac going"},
	{"Other", ""},
}

func (s *Store) containersData() containersData {
	dk := s.docker
	if dk == nil {
		return containersData{}
	}
	d := containersData{Known: true}
	total := 0.0
	rows := map[string][]crow{}
	sums := map[string]float64{}
	sorted := append([]Container{}, dk.Containers...)
	sort.Slice(sorted, func(i, j int) bool { return sorted[i].MemMB > sorted[j].MemMB })
	for _, c := range sorted {
		role, ok := containerRoles[c.Name]
		if !ok {
			role = [2]string{"Other", "a container"}
		}
		total += c.MemMB
		sums[role[0]] += c.MemMB
		rows[role[0]] = append(rows[role[0]], crow{Role: role[1], CPU: fmt.Sprintf("%.1f%%", c.CPU), Mem: fmt.Sprintf("%.0f MB", c.MemMB), Pct: pct(c.MemMB, 360)})
	}
	d.Headline = fmt.Sprintf("%s using %s.", plural(len(dk.Containers), "container"), size(total))
	if dk.Cores > 0 && dk.MemBytes > 0 {
		d.Sub = fmt.Sprintf("They share a small VM with %d cores and %.1f GB of memory.", dk.Cores, float64(dk.MemBytes)/(1<<30))
	}
	for _, g := range containerGroups {
		if len(rows[g.name]) == 0 {
			continue
		}
		d.Groups = append(d.Groups, cgroup{Title: g.name, About: g.about, Total: size(sums[g.name]), Rows: rows[g.name]})
	}
	return d
}

// ── Network ──

type networkData struct {
	Tunnels []tunnelRow
}

type tunnelRow struct {
	Name, Private string
	Hosts         []string
	Up, Known     bool
}

// tunnels are the six Cloudflare tunnels, by the public hostnames they carry. Whether each is up
// comes from the Home checks that go through it.
var tunnels = []struct {
	name, private string
	hosts         []string
	via           []string // target IDs checked through this tunnel
}{
	{"claw", "", []string{"captainclaw.lol", "claw.rohan.my"}, []string{"claw", "claw-mp"}},
	{"stonerow", "and 1 private", []string{"stonerow.cc", "app.stonerow.cc"}, []string{"stonerow", "stonerow-app"}},
	{"csstats", "", []string{"csstats.rohan.my", "stats-api.rohan.my"}, []string{"csstats"}},
	{"laya", "and 2 private", []string{"snake.rohan.my"}, []string{"snake", "laya"}},
	{"home", "and the tools", []string{"home.rohan.my", "argus.xin"}, []string{"argus"}},
	{"chiron", "1 private", nil, []string{"chiron"}},
}

func (s *Store) networkData() networkData {
	var d networkData
	for _, t := range tunnels {
		r := tunnelRow{Name: t.name, Private: t.private, Hosts: t.hosts, Up: true}
		for _, id := range t.via {
			res, ok := s.results[id]
			r.Known = r.Known || ok
			r.Up = r.Up && res.Up
		}
		d.Tunnels = append(d.Tunnels, r)
	}
	return d
}

// ── words ──

func ago(now, t time.Time) string {
	d := now.Sub(t)
	switch {
	case d < 45*time.Second:
		return "just now"
	case d < 90*time.Second:
		return "a minute ago"
	case d < time.Hour:
		return fmt.Sprintf("%d minutes ago", int(d.Minutes()+0.5))
	}
	return "over an hour ago"
}

// span is a stretch of time in its two largest units: "1 day 22 hours", "5 hours 12 minutes".
func span(d time.Duration) string {
	days, hrs, mins := int(d.Hours())/24, int(d.Hours())%24, int(d.Minutes())%60
	if days > 0 {
		return plural(days, "day") + " " + plural(hrs, "hour")
	}
	return plural(hrs, "hour") + " " + plural(mins, "minute")
}

func plural(n int, word string) string {
	if n == 1 {
		return "1 " + word
	}
	return fmt.Sprintf("%d %ss", n, word)
}

func size(mb float64) string {
	if mb >= 1024 {
		return fmt.Sprintf("%.1f GB", mb/1024)
	}
	return fmt.Sprintf("%.0f MB", mb)
}

func pct(v, of float64) int {
	if of <= 0 {
		return 0
	}
	return max(0, min(100, int(math.Round(100*v/of))))
}

func itoa(n int) string { return strconv.Itoa(n) }

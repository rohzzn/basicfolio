package main

import (
	"fmt"
	"math"
	"strings"
	"time"

	"github.com/charmbracelet/bubbles/viewport"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	"github.com/charmbracelet/ssh"
	bm "github.com/charmbracelet/wish/bubbletea"
	"github.com/charmbracelet/x/ansi"
)

type page int

const (
	pageHome page = iota
	pageProjects
	pageWriting
	pageHobbies
	pageLinks
	pageCount
)

var tabNames = [pageCount]string{"Home", "Projects", "Writing", "Hobbies", "Links"}

// The column the app is laid out in, centred in whatever terminal it lands in.
const maxWidth = 80

type styles struct {
	bold, dim, text, accent, sel, head, tabOn, tabOff, green, blue, gold lipgloss.Style
}

func newStyles(r *lipgloss.Renderer) styles {
	c := func(code string) lipgloss.Style { return r.NewStyle().Foreground(lipgloss.Color(code)) }
	soft := lipgloss.AdaptiveColor{Light: "244", Dark: "245"}
	return styles{
		bold:   r.NewStyle().Bold(true),
		dim:    r.NewStyle().Foreground(soft),
		text:   r.NewStyle(),
		accent: c("215"),
		sel:    c("215").Bold(true),
		head:   r.NewStyle().Bold(true),
		tabOn:  c("215").Bold(true).Underline(true),
		tabOff: r.NewStyle().Foreground(soft),
		green:  c("114"),
		blue:   c("110"),
		gold:   c("180"),
	}
}

type model struct {
	st     styles
	live   *Live
	snap   Snapshot
	w, h   int
	cw     int // content width
	page   page
	cursor [pageCount]int
	open   bool // a project or a post is open
	vp     viewport.Model
}

type tickMsg struct{}
type pulledMsg struct{}

func tick() tea.Cmd { return tea.Tick(20*time.Second, func(time.Time) tea.Msg { return tickMsg{} }) }

func newModel(s ssh.Session, live *Live) *model {
	pty, _, _ := s.Pty()
	w, h := pty.Window.Width, pty.Window.Height
	if w == 0 || h == 0 { // a client that has not said how big it is yet
		w, h = 80, 24
	}
	return newModelWith(bm.MakeRenderer(s), live, w, h)
}

func newModelWith(r *lipgloss.Renderer, live *Live, w, h int) *model {
	m := &model{st: newStyles(r), live: live, snap: live.Snapshot(), vp: viewport.New(0, 0)}
	m.vp.MouseWheelEnabled = true
	m.resize(w, h)
	return m
}

func (m *model) Init() tea.Cmd { return tick() }

func (m *model) resize(w, h int) {
	m.w, m.h = w, h
	m.cw = max(20, min(maxWidth, w-4))
	m.vp.Width = m.cw
	m.vp.Height = max(1, h-7)
	m.refresh()
}

func (m *model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		if msg.Width > 0 && msg.Height > 0 { // 0 x 0 is a client that has not said yet
			m.resize(msg.Width, msg.Height)
		}
	case tickMsg:
		m.snap = m.live.Snapshot()
		m.refresh()
		return m, tick()
	case pulledMsg:
		m.snap = m.live.Snapshot()
		m.refresh()
	case tea.MouseMsg:
		var cmd tea.Cmd
		m.vp, cmd = m.vp.Update(msg)
		return m, cmd
	case tea.KeyMsg:
		return m.key(msg.String())
	}
	return m, nil
}

func (m *model) key(k string) (tea.Model, tea.Cmd) {
	switch k {
	case "q", "ctrl+c":
		return m, tea.Quit
	case "right", "l", "tab":
		m.goTo((m.page + 1) % pageCount)
	case "left", "h", "shift+tab":
		m.goTo((m.page + pageCount - 1) % pageCount)
	case "1", "2", "3", "4", "5":
		m.goTo(page(k[0] - '1'))
	case "up", "k":
		if m.listing() {
			m.move(-1)
		} else {
			m.vp.ScrollUp(1)
		}
	case "down", "j":
		if m.listing() {
			m.move(1)
		} else {
			m.vp.ScrollDown(1)
		}
	case "pgup", "b":
		if m.listing() {
			m.move(-m.vp.Height)
		} else {
			m.vp.PageUp()
		}
	case "pgdown", "f", " ":
		if m.listing() {
			m.move(m.vp.Height)
		} else {
			m.vp.PageDown()
		}
	case "home", "g":
		if m.listing() {
			m.move(-1 << 20)
		} else {
			m.vp.GotoTop()
		}
	case "end", "G":
		if m.listing() {
			m.move(1 << 20)
		} else {
			m.vp.GotoBottom()
		}
	case "enter":
		if m.listing() {
			m.open = true
			m.vp.SetYOffset(0)
			m.refresh()
		}
	case "esc", "backspace":
		if m.open {
			m.open = false
			m.refresh()
		}
	case "r":
		m.live.PullSoon()
		return m, tea.Tick(3*time.Second, func(time.Time) tea.Msg { return pulledMsg{} })
	}
	return m, nil
}

// listing is a page of rows to choose from, rather than one to scroll through.
func (m *model) listing() bool {
	return !m.open && (m.page == pageProjects || m.page == pageWriting)
}

func (m *model) goTo(p page) {
	m.page, m.open = p, false
	m.vp.SetYOffset(0)
	m.refresh()
}

func (m *model) move(d int) {
	n := len(projectList)
	if m.page == pageWriting {
		n = len(site.Writing)
	}
	m.cursor[m.page] = max(0, min(n-1, m.cursor[m.page]+d))
	m.refresh()
}

// refresh redraws the body and keeps the chosen row on screen.
func (m *model) refresh() {
	content, at := m.body()
	m.vp.SetContent(content)
	if at < 0 {
		return
	}
	if at <= m.vp.YOffset {
		m.vp.SetYOffset(max(0, at-1)) // one line of room for a group heading above
	} else if at >= m.vp.YOffset+m.vp.Height {
		m.vp.SetYOffset(at - m.vp.Height + 1)
	}
}

func (m *model) body() (string, int) {
	switch m.page {
	case pageProjects:
		if m.open {
			return m.projectView(projectList[m.cursor[pageProjects]]), -1
		}
		return m.projectsList()
	case pageWriting:
		if m.open {
			return m.postView(site.Writing[m.cursor[pageWriting]]), -1
		}
		return m.postsList()
	case pageHobbies:
		return m.hobbiesView(), -1
	case pageLinks:
		return m.linksView(), -1
	}
	return m.homeView(), -1
}

// ── chrome ──

func (m *model) View() string {
	if m.w < 44 || m.h < 14 {
		return "\n  ssh rohan.my needs a slightly bigger window.\n  q to quit\n"
	}
	rule := m.st.dim.Render(strings.Repeat("─", m.cw))
	out := strings.Join([]string{"", m.header(), m.tabs(), rule, m.vp.View(), rule, m.footer()}, "\n")
	margin := strings.Repeat(" ", max(0, (m.w-m.cw)/2))
	return margin + strings.ReplaceAll(out, "\n", "\n"+margin)
}

func (m *model) header() string {
	st := m.st
	name := st.bold.Render("rohan")
	var status string
	switch {
	case m.snap.Updated.IsZero():
		status = st.dim.Render("■ looking around")
	case m.snap.Track != nil:
		room := m.cw - lipgloss.Width(name) - 16
		status = st.green.Render("■") + " " + st.dim.Render("Listening ") + trunc(m.snap.Track.Name+" · "+m.snap.Track.Artists, room)
	default:
		status = st.gold.Render("■") + " " + st.dim.Render("Idle")
	}
	return spread(name, status, m.cw)
}

func (m *model) tabs() string {
	var parts []string
	for i, name := range tabNames {
		if page(i) == m.page {
			parts = append(parts, m.st.tabOn.Render(name))
		} else {
			parts = append(parts, m.st.tabOff.Render(name))
		}
	}
	return strings.Join(parts, "   ")
}

func (m *model) footer() string {
	keys := "←→ page  ↑↓ scroll  r refresh  q quit"
	switch {
	case m.listing():
		keys = "←→ page  ↑↓ choose  enter open  q quit"
	case m.open:
		keys = "esc back  ↑↓ scroll  ←→ page  q quit"
	}
	where := ""
	if !m.vp.AtTop() || !m.vp.AtBottom() {
		where = fmt.Sprintf("%3.0f%%", m.vp.ScrollPercent()*100)
	}
	return spread(m.st.dim.Render(keys), m.st.dim.Render(where), m.cw)
}

// ── Home ──

func (m *model) homeView() string {
	st, w := m.st, m.cw
	var b strings.Builder
	b.WriteString(wrap("Software engineer and CS grad student who loves building things that matter. Doing my Masters at the University of Cincinnati while working part-time in healthcare tech.", w))
	b.WriteString("\n\n")
	b.WriteString(st.dim.Render(wrap("When I'm not coding you'll find me taking photos, gaming with friends, or working on random design projects. I also spend way too much time tweaking my setup.", w)))
	b.WriteString("\n\n" + st.head.Render("Right now") + "\n")

	s := m.snap
	if s.Updated.IsZero() {
		b.WriteString(st.dim.Render("looking around...") + "\n")
	} else {
		if s.Track != nil {
			b.WriteString(m.nowRow(st.green, "Listening", s.Track.Name, s.Track.Artists) + "\n")
		} else {
			b.WriteString(m.nowRow(st.green, "Listening", st.dim.Render("nothing right now"), "") + "\n")
		}
		if len(s.Games) > 0 {
			b.WriteString(m.nowRow(st.blue, "Playing", s.Games[0].Name, hours(s.Games[0].Minutes)+" in the last 2 weeks") + "\n")
		}
		for _, a := range s.Anime {
			if a.Status == "watching" {
				b.WriteString(m.nowRow(st.gold, "Watching", a.Title, "") + "\n")
				break
			}
		}
		if len(s.Workouts) > 0 {
			wk := s.Workouts[0]
			b.WriteString(m.nowRow(st.accent, "Lifted", wk.Title, ago(wk.Start)) + "\n")
		}
	}

	if len(site.Writing) > 0 {
		p := site.Writing[0]
		b.WriteString("\n" + st.head.Render("Latest writing") + "\n")
		b.WriteString(spread(trunc(p.Title, w-12), st.dim.Render(p.Date), w) + "\n")
	}
	b.WriteString("\n" + st.dim.Render("rohan.run") + st.accent.Render("  /  ") + st.dim.Render("github.com/rohzzn") + st.accent.Render("  /  ") + st.dim.Render("ssh rohan.my"))
	return b.String()
}

func (m *model) nowRow(mark lipgloss.Style, label, value, detail string) string {
	left := mark.Render("■") + " " + m.st.dim.Render(fmt.Sprintf("%-10s", label)) + " "
	room := m.cw - lipgloss.Width(left)
	if detail != "" {
		d := m.st.dim.Render(detail)
		return left + spread(trunc(value, room-lipgloss.Width(d)-2), d, room)
	}
	return left + trunc(value, room)
}

// ── Projects ──

func (m *model) projectsList() (string, int) {
	st, w := m.st, m.cw
	var b strings.Builder
	line, at, group := 0, -1, ""
	const tw = 18
	dw := w - 2 - tw - 2 - 6
	for i, p := range projectList {
		if p.Group != group {
			if group != "" {
				b.WriteString("\n")
				line++
			}
			group = p.Group
			b.WriteString(st.head.Render(group) + "\n")
			line++
		}
		mark, title, desc := "  ", st.text.Render(fit(p.Title, tw)), st.dim.Render(fit(p.Description, dw))
		if i == m.cursor[pageProjects] {
			mark, title, desc, at = st.sel.Render("› "), st.sel.Render(fit(p.Title, tw)), st.text.Render(fit(p.Description, dw)), line
		}
		year := ""
		if p.Year > 0 {
			year = fmt.Sprint(p.Year)
		}
		row := mark + title + "  "
		if dw >= 10 {
			row += desc + "  "
		}
		b.WriteString(row + st.dim.Render(year) + "\n")
		line++
	}
	return strings.TrimRight(b.String(), "\n"), at
}

func (m *model) projectView(p Project) string {
	st, w := m.st, m.cw
	var b strings.Builder
	b.WriteString(st.dim.Render("‹ "+p.Group) + "\n\n")
	year := ""
	if p.Year > 0 {
		year = st.dim.Render(fmt.Sprint(p.Year))
	}
	b.WriteString(spread(st.sel.Render(p.Title), year, w) + "\n")
	b.WriteString(st.dim.Render(wrap(p.Description, w)) + "\n\n")
	if len(p.Tech) > 0 {
		b.WriteString(m.fact("Built with", strings.Join(p.Tech, " · ")) + "\n")
	}
	for i, l := range p.Links {
		label := ""
		if i == 0 {
			label = "Links"
		}
		b.WriteString(m.fact(label, m.link(l.URL, w-12)) + "\n")
	}
	if p.Install != "" {
		b.WriteString(m.fact("Install", p.Install) + "\n")
	}
	if p.Story != "" {
		for _, para := range strings.Split(p.Story, "\n\n") {
			b.WriteString("\n" + wrap(para, w) + "\n")
		}
	}
	b.WriteString("\n" + st.dim.Render("rohan.run/projects/"+p.Slug))
	return b.String()
}

// fact is a label in a column of its own, the value wrapping beside it.
func (m *model) fact(label, value string) string {
	const lw = 12
	lines := strings.Split(wrap(value, m.cw-lw), "\n")
	for i := range lines {
		if i == 0 {
			lines[i] = m.st.dim.Render(fmt.Sprintf("%-*s", lw, label)) + lines[i]
		} else {
			lines[i] = strings.Repeat(" ", lw) + lines[i]
		}
	}
	return strings.Join(lines, "\n")
}

// ── Writing ──

func (m *model) postsList() (string, int) {
	st, w := m.st, m.cw
	var b strings.Builder
	line, at := 0, -1
	for i, p := range site.Writing {
		date := st.dim.Render(p.Date)
		if i == m.cursor[pageWriting] {
			at = line
			b.WriteString(spread(st.sel.Render("› "+trunc(p.Title, w-14)), date, w) + "\n")
			for _, l := range strings.Split(wrap(p.Description, w-4), "\n") {
				b.WriteString("  " + st.dim.Render(l) + "\n")
				line++
			}
		} else {
			b.WriteString(spread("  "+trunc(p.Title, w-14), date, w) + "\n")
		}
		line++
	}
	return strings.TrimRight(b.String(), "\n"), at
}

func (m *model) postView(p Post) string {
	st, w := m.st, m.cw
	var b strings.Builder
	b.WriteString(st.dim.Render("‹ Writing") + "\n\n")
	b.WriteString(st.sel.Render(wrap(p.Title, w)) + "\n")
	b.WriteString(st.dim.Render(p.Date+" · "+p.Category) + "\n\n")
	b.WriteString(wrap(p.Description, w) + "\n\n")
	b.WriteString(st.dim.Render("Read it at ") + m.link("https://rohan.run/writing/"+p.Slug, w-11))
	return b.String()
}

// ── Hobbies ──

func (m *model) hobbiesView() string {
	st, w := m.st, m.cw
	s := m.snap
	var b strings.Builder
	section := func(title, note string) {
		if b.Len() > 0 {
			b.WriteString("\n")
		}
		b.WriteString(st.head.Render(title) + "  " + st.dim.Render(note) + "\n")
	}
	row := func(left, right string) {
		b.WriteString(spread("  "+trunc(left, w-16), st.dim.Render(right), w) + "\n")
	}

	section("Games", "last two weeks on Steam")
	if len(s.Games) == 0 {
		b.WriteString(st.dim.Render("  nothing lately") + "\n")
	}
	for i, g := range s.Games {
		if i == 6 || g.Minutes < 6 {
			break
		}
		row(g.Name, hours(g.Minutes))
	}

	section("Films", "the newest ones I've rated")
	for i, f := range s.Films {
		if i == 8 {
			break
		}
		name := f.Title
		if f.Year > 0 {
			name += fmt.Sprintf(" (%d)", f.Year)
		}
		row(name, stars(f.Rating))
	}

	var watching, best []Anime
	for _, a := range s.Anime {
		switch {
		case a.Status == "watching":
			watching = append(watching, a)
		case a.Status == "completed" && a.Score >= 9:
			best = append(best, a)
		}
	}
	if len(watching)+len(best) > 0 {
		section("Anime", "on MyAnimeList")
		for _, a := range watching {
			row(a.Title, "watching")
		}
		for i, a := range best {
			if i == 6 {
				break
			}
			row(a.Title, fmt.Sprintf("%d/10", a.Score))
		}
	}

	section("Books", "favourites")
	for _, bk := range site.Books {
		b.WriteString("  " + bk.Title + "\n")
		if bk.Review != "" {
			b.WriteString("  " + st.dim.Render(trunc(bk.Review, w-2)) + "\n")
		}
	}

	if len(s.Workouts) > 0 {
		section("Gym", "latest on Hevy")
		for i, wk := range s.Workouts {
			if i == 5 {
				break
			}
			row(wk.Title, wk.Start.Format("Jan 2")+" · "+fmt.Sprintf("%d min", int(wk.Duration.Minutes())))
		}
	}
	return strings.TrimRight(b.String(), "\n")
}

// ── Links ──

func (m *model) linksView() string {
	st, w := m.st, m.cw
	var b strings.Builder
	for gi, g := range site.LinkGroups {
		if gi > 0 {
			b.WriteString("\n")
		}
		b.WriteString(st.head.Render(g.Label) + "\n")
		for _, l := range g.Links {
			left := "  " + fit(l.Title, 16)
			if w >= 70 {
				left += st.dim.Render(fit(l.Description, 26))
			}
			b.WriteString(left + m.link(l.URL, w-lipgloss.Width(left)) + "\n")
		}
	}
	return strings.TrimRight(b.String(), "\n")
}

// ── text helpers ──

// link shows a URL without its scheme, as a real hyperlink in terminals that support them.
func (m *model) link(url string, w int) string {
	text := strings.TrimSuffix(strings.TrimPrefix(strings.TrimPrefix(url, "https://"), "http://"), "/")
	return ansi.SetHyperlink(url) + m.st.accent.Render(trunc(text, w)) + ansi.ResetHyperlink()
}

func wrap(s string, w int) string { return lipgloss.NewStyle().Width(max(1, w)).Render(s) }

func trunc(s string, w int) string { return ansi.Truncate(s, max(1, w), "…") }

// fit truncates s to w cells and pads it out to exactly w.
func fit(s string, w int) string {
	s = trunc(s, w)
	return s + strings.Repeat(" ", max(0, w-lipgloss.Width(s)))
}

// spread puts left at the start of a w-cell line and right at its end.
func spread(left, right string, w int) string {
	gap := w - lipgloss.Width(left) - lipgloss.Width(right)
	if gap < 1 {
		return left + " " + right
	}
	return left + strings.Repeat(" ", gap) + right
}

func hours(minutes int) string { return fmt.Sprintf("%.1f h", float64(minutes)/60) }

func stars(r float64) string {
	if r <= 0 {
		return ""
	}
	full := int(math.Floor(r))
	s := strings.Repeat("★", full)
	if r-float64(full) >= .5 {
		s += "½"
	}
	return s
}

func ago(t time.Time) string {
	d := time.Since(t)
	switch {
	case d < time.Hour:
		return "just now"
	case d < 24*time.Hour:
		return fmt.Sprintf("%d h ago", int(d.Hours()))
	case d < 60*24*time.Hour:
		return fmt.Sprintf("%d days ago", int(d.Hours()/24))
	}
	return t.Format("Jan 2")
}

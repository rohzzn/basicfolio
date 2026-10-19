package main

import (
	"fmt"
	"io"
	"math"
	"sort"
	"strings"
	"time"

	osc52 "github.com/aymanbagabas/go-osc52/v2"
	"github.com/charmbracelet/bubbles/viewport"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	"github.com/charmbracelet/ssh"
	"github.com/charmbracelet/x/ansi"
	"github.com/muesli/termenv"
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
const maxWidth = 96

var wordmark = []string{
	"██████╗  ██████╗ ██╗  ██╗ █████╗ ███╗   ██╗",
	"██╔══██╗██╔═══██╗██║  ██║██╔══██╗████╗  ██║",
	"██████╔╝██║   ██║███████║███████║██╔██╗ ██║",
	"██╔══██╗██║   ██║██╔══██║██╔══██║██║╚██╗██║",
	"██║  ██║╚██████╔╝██║  ██║██║  ██║██║ ╚████║",
	"╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝",
}

var cincinnati = func() *time.Location {
	if loc, err := time.LoadLocation("America/New_York"); err == nil {
		return loc
	}
	return time.Local
}()

type styles struct {
	text, bold, dim, faint, accent, sel, green, blue, gold, red, cursor lipgloss.Style
	pillOn, pillOff, chip, chipOn                                       lipgloss.Style
	row, rowSel, rowDim                                                 lipgloss.Style
	bar, barDim, barGreen, barAccent, mode                              lipgloss.Style
}

func newStyles(r *lipgloss.Renderer) styles {
	accent := lipgloss.AdaptiveColor{Light: "#b25f17", Dark: "#e9a35b"}
	dim := lipgloss.AdaptiveColor{Light: "#6f6b62", Dark: "#7c786f"}
	faint := lipgloss.AdaptiveColor{Light: "#b3aea3", Dark: "#4a4741"}
	green := lipgloss.AdaptiveColor{Light: "#3f8a3a", Dark: "#9fcb98"}
	ink := lipgloss.Color("#101114")
	barBg := lipgloss.AdaptiveColor{Light: "#e6e2d8", Dark: "#1a1b1f"}
	selBg := lipgloss.AdaptiveColor{Light: "#ece8de", Dark: "#1d1f24"}
	chipBg := lipgloss.AdaptiveColor{Light: "#e6e2d8", Dark: "#25272c"}
	n := r.NewStyle
	return styles{
		text:      n(),
		bold:      n().Bold(true),
		dim:       n().Foreground(dim),
		faint:     n().Foreground(faint),
		accent:    n().Foreground(accent),
		sel:       n().Foreground(accent).Bold(true),
		green:     n().Foreground(green),
		blue:      n().Foreground(lipgloss.AdaptiveColor{Light: "#2f6ea3", Dark: "#8ab4d8"}),
		gold:      n().Foreground(lipgloss.AdaptiveColor{Light: "#a8801c", Dark: "#e6c36a"}),
		red:       n().Foreground(lipgloss.AdaptiveColor{Light: "#b4412f", Dark: "#e07a6a"}),
		cursor:    n().Background(accent),
		pillOn:    n().Background(accent).Foreground(ink).Bold(true).Padding(0, 1),
		pillOff:   n().Foreground(dim).Padding(0, 1),
		chip:      n().Background(chipBg).Padding(0, 1),
		chipOn:    n().Foreground(accent).Bold(true).Underline(true),
		row:       n().Background(selBg),
		rowSel:    n().Background(selBg).Foreground(accent).Bold(true),
		rowDim:    n().Background(selBg).Foreground(dim),
		bar:       n().Background(barBg),
		barDim:    n().Background(barBg).Foreground(dim),
		barGreen:  n().Background(barBg).Foreground(green),
		barAccent: n().Background(barBg).Foreground(accent),
		mode:      n().Background(accent).Foreground(ink).Bold(true).Padding(0, 1),
	}
}

type model struct {
	st   styles
	live *Live
	out  io.Writer // the session, for copying a link to the visitor's clipboard
	snap Snapshot
	w, h int
	cw   int // content width

	splash bool
	page   page
	open   bool // a project's story or a post is open
	room   bool // in the server room
	code   []codeKey

	filter    int // Projects: 0 is all, then each group
	query     string
	searching bool
	pcur      int
	ptop      int
	wcur      int
	lcur      int
	note      string
	noteUntil time.Time

	vp viewport.Model
}

type tickMsg struct{}
type pulledMsg struct{}

func tick() tea.Cmd { return tea.Tick(5*time.Second, func(time.Time) tea.Msg { return tickMsg{} }) }

func newModel(s ssh.Session, live *Live) *model {
	pty, _, _ := s.Pty()
	w, h := pty.Window.Width, pty.Window.Height
	if w == 0 || h == 0 { // a client that has not said how big it is yet
		w, h = 80, 24
	}
	return newModelWith(sessionRenderer(s), live, s, w, h)
}

// sessionRenderer styles for the visitor's terminal. It is wish's MakeRenderer without its
// background-colour query: on macOS that query reads the session itself, and when a terminal never
// answers, the reader it leaves behind swallows every key after the first. Dark is assumed.
func sessionRenderer(s ssh.Session) *lipgloss.Renderer {
	pty, _, _ := s.Pty()
	env := sshEnviron(append(s.Environ(), "TERM="+pty.Term))
	r := lipgloss.NewRenderer(s, termenv.WithEnvironment(env), termenv.WithUnsafe(), termenv.WithColorCache(true))
	r.SetHasDarkBackground(true)
	return r
}

type sshEnviron []string

func (e sshEnviron) Environ() []string { return e }

func (e sshEnviron) Getenv(k string) string {
	for _, v := range e {
		if strings.HasPrefix(v, k+"=") {
			return v[len(k)+1:]
		}
	}
	return ""
}

func newModelWith(r *lipgloss.Renderer, live *Live, out io.Writer, w, h int) *model {
	m := &model{st: newStyles(r), live: live, out: out, snap: live.Snapshot(), vp: viewport.New(0, 0), splash: true}
	m.vp.MouseWheelEnabled = true
	m.resize(w, h)
	return m
}

func (m *model) Init() tea.Cmd { return tick() }

func (m *model) resize(w, h int) {
	m.w, m.h = w, h
	m.cw = max(40, min(maxWidth, w-4))
	m.refresh()
}

func (m *model) bodyH() int { return max(1, m.h-4) }

func (m *model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		if msg.Width > 0 && msg.Height > 0 { // 0 x 0 is a client that has not said yet
			m.resize(msg.Width, msg.Height)
		}
	case tickMsg:
		if m.room {
			m.live.WantRoom()
		}
		m.snap = m.live.Snapshot()
		m.refresh()
		return m, tick()
	case pulledMsg:
		m.snap = m.live.Snapshot()
		m.refresh()
	case tea.MouseMsg:
		if !m.splash {
			var cmd tea.Cmd
			m.vp, cmd = m.vp.Update(msg)
			return m, cmd
		}
	case tea.KeyMsg:
		return m.key(msg)
	}
	return m, nil
}

func (m *model) key(msg tea.KeyMsg) (tea.Model, tea.Cmd) {
	k := msg.String()
	if k == "ctrl+c" {
		return m, tea.Quit
	}
	if m.splash {
		m.splash = false
		m.refresh()
		return m, nil
	}
	if m.searching {
		switch msg.Type {
		case tea.KeyEsc:
			m.searching, m.query = false, ""
		case tea.KeyEnter:
			m.searching = false
		case tea.KeyBackspace:
			if r := []rune(m.query); len(r) > 0 {
				m.query = string(r[:len(r)-1])
			}
		case tea.KeySpace:
			m.query += " "
		case tea.KeyRunes:
			m.query += string(msg.Runes)
		}
		m.pcur, m.ptop = 0, 0
		m.refresh()
		return m, nil
	}
	if m.konami(k) {
		m.room = true
		m.live.WantRoom()
		m.vp.SetYOffset(0)
		m.refresh()
		return m, tea.Tick(3*time.Second, func(time.Time) tea.Msg { return pulledMsg{} })
	}
	listingProjects := m.page == pageProjects && !m.open && !m.room
	switch k {
	case "q":
		return m, tea.Quit
	case "1", "2", "3", "4", "5":
		m.goTo(page(k[0] - '1'))
	case "right", "l":
		m.goTo((m.page + 1) % pageCount)
	case "left", "h":
		m.goTo((m.page + pageCount - 1) % pageCount)
	case "tab":
		if listingProjects {
			m.filter, m.pcur, m.ptop = (m.filter+1)%(len(site.ProjectGroups)+1), 0, 0
			m.refresh()
		} else {
			m.goTo((m.page + 1) % pageCount)
		}
	case "shift+tab":
		if listingProjects {
			n := len(site.ProjectGroups) + 1
			m.filter, m.pcur, m.ptop = (m.filter+n-1)%n, 0, 0
			m.refresh()
		} else {
			m.goTo((m.page + pageCount - 1) % pageCount)
		}
	case "/":
		if listingProjects {
			m.searching = true
			m.refresh()
		}
	case "up", "k":
		m.move(-1)
	case "down", "j":
		m.move(1)
	case "pgup", "b":
		m.move(-m.bodyH())
	case "pgdown", "f", " ":
		m.move(m.bodyH())
	case "home", "g":
		m.move(-1 << 20)
	case "end", "G":
		m.move(1 << 20)
	case "enter":
		if (m.page == pageProjects && len(m.projects()) > 0 || m.page == pageWriting) && !m.open {
			m.open = true
			m.vp.SetYOffset(0)
			m.refresh()
		}
	case "esc", "backspace":
		if m.room {
			m.room = false
			m.refresh()
		} else if m.open {
			m.open = false
			m.refresh()
		} else if listingProjects && m.query != "" {
			m.query, m.pcur, m.ptop = "", 0, 0
			m.refresh()
		}
	case "n", "p":
		if m.page == pageWriting && m.open {
			d := 1
			if k == "p" {
				d = -1
			}
			m.wcur = (m.wcur + d + len(site.Writing)) % len(site.Writing)
			m.vp.SetYOffset(0)
			m.refresh()
		}
	case "r":
		m.live.PullSoon()
		return m, tea.Tick(3*time.Second, func(time.Time) tea.Msg { return pulledMsg{} })
	case "c":
		if m.page == pageLinks {
			url := m.selectedLink()
			if url != "" && m.out != nil {
				_, _ = osc52.New(url).WriteTo(m.out)
				m.note, m.noteUntil = "copied "+short(url), time.Now().Add(4*time.Second)
			}
		}
	}
	return m, nil
}

// selecting is a page of rows to choose from, rather than one to scroll through.
func (m *model) selecting() bool {
	if m.room {
		return false
	}
	return !m.open && (m.page == pageProjects || m.page == pageWriting) || m.page == pageLinks
}

func (m *model) goTo(p page) {
	m.page, m.open, m.room = p, false, false
	m.vp.SetYOffset(0)
	m.refresh()
}

func (m *model) move(d int) {
	if !m.selecting() {
		switch {
		case d <= -1<<20:
			m.vp.GotoTop()
		case d >= 1<<20:
			m.vp.GotoBottom()
		case d < 0:
			m.vp.ScrollUp(-d)
		default:
			m.vp.ScrollDown(d)
		}
		return
	}
	clamp := func(v, n int) int { return max(0, min(n-1, v+d)) }
	switch m.page {
	case pageProjects:
		m.pcur = clamp(m.pcur, len(m.projects()))
	case pageWriting:
		m.wcur = clamp(m.wcur, len(site.Writing))
	case pageLinks:
		m.lcur = clamp(m.lcur, len(m.linkOrder()))
	}
	m.refresh()
}

// refresh redraws the scrolling body and keeps the chosen row on screen.
func (m *model) refresh() {
	if m.splash {
		return
	}
	m.vp.Width, m.vp.Height = m.cw, m.bodyH()
	if m.reading() {
		m.vp.Width = m.cw - 2
	}
	if m.page == pageProjects && !m.open && !m.room {
		ph := m.bodyH() - 2
		if m.pcur < m.ptop {
			m.ptop = m.pcur
		} else if m.pcur >= m.ptop+ph {
			m.ptop = m.pcur - ph + 1
		}
		return // drawn at a fixed height, not through the viewport
	}
	content, at := m.body()
	m.vp.SetContent(content)
	if at < 0 {
		return
	}
	if at <= m.vp.YOffset {
		m.vp.SetYOffset(max(0, at-1))
	} else if at >= m.vp.YOffset+m.vp.Height {
		m.vp.SetYOffset(at - m.vp.Height + 2)
	}
}

func (m *model) reading() bool { return m.page == pageWriting && m.open }

func (m *model) body() (string, int) {
	if m.room {
		return m.roomView(), -1
	}
	switch m.page {
	case pageProjects:
		list := m.projects()
		if len(list) > 0 {
			return m.projectView(list[min(m.pcur, len(list)-1)]), -1
		}
	case pageWriting:
		if m.open {
			return m.readingView(), -1
		}
		return m.postsList()
	case pageHobbies:
		return m.hobbiesView(), -1
	case pageLinks:
		return m.linksView()
	case pageHome:
		return m.homeView(), -1
	}
	return "", -1
}

// ── frame ──

func (m *model) View() string {
	if m.w < 50 || m.h < 16 {
		return "\n  ssh rohan.my needs a slightly bigger window.\n  ctrl+c to leave\n"
	}
	if m.splash {
		return m.splashView()
	}
	var body string
	switch {
	case m.page == pageProjects && !m.open && !m.room:
		body = m.projectsPane()
	case m.reading():
		body = m.withGutter(m.vp.View())
	default:
		body = m.vp.View()
	}
	lines := strings.Split(body, "\n")
	for len(lines) < m.bodyH() {
		lines = append(lines, "")
	}
	margin := strings.Repeat(" ", max(0, (m.w-m.cw)/2))
	for i := range lines {
		lines[i] = margin + lines[i]
	}
	return "\n" + margin + m.header() + "\n\n" + strings.Join(lines[:m.bodyH()], "\n") + "\n" + m.statusBar()
}

func (m *model) header() string {
	st := m.st
	var pills []string
	for i, name := range tabNames {
		label := fmt.Sprintf("%d %s", i+1, name)
		if page(i) == m.page {
			pills = append(pills, st.pillOn.Render(label))
		} else {
			pills = append(pills, st.pillOff.Render(label))
		}
	}
	right := strings.Join(pills, " ")
	left := st.bold.Render("rohan")
	if m.cw-lipgloss.Width(right) >= 40 {
		left += st.dim.Render("  software engineer, cincinnati")
	}
	return spread(left, right, m.cw)
}

func (m *model) statusBar() string {
	st := m.st
	mode, hints, right := m.statusParts()
	left := st.mode.Render(mode)
	r := right + st.bar.Render("  ")
	if gap := m.w - lipgloss.Width(left) - lipgloss.Width(r) - 2; lipgloss.Width(hints) <= gap {
		left += st.barDim.Render("  " + hints)
	}
	gap := m.w - lipgloss.Width(left) - lipgloss.Width(r)
	if gap < 1 {
		return left + st.bar.Render(strings.Repeat(" ", max(0, m.w-lipgloss.Width(left))))
	}
	return left + st.bar.Render(strings.Repeat(" ", gap)) + r
}

func (m *model) statusParts() (mode, hints, right string) {
	st := m.st
	pct := ""
	if !m.vp.AtTop() || !m.vp.AtBottom() {
		pct = st.barDim.Render(fmt.Sprintf("%.0f%%", m.vp.ScrollPercent()*100))
	}
	if m.room {
		checked := st.barDim.Render("checking")
		if !m.snap.RoomChecked.IsZero() {
			checked = st.barDim.Render("checked " + since(m.snap.RoomChecked))
		}
		return "SERVER ROOM", "↑↓ look around   esc leave quietly", checked
	}
	switch m.page {
	case pageProjects:
		if m.open {
			return "PROJECT", "esc back   ↑↓ scroll   1-5 pages", pct
		}
		n := len(m.projects())
		pos := "none"
		if n > 0 {
			pos = fmt.Sprintf("%d of %d", m.pcur+1, n)
		}
		return "PROJECTS", "↑↓ choose   tab filter   / search   enter more", st.barDim.Render(pos)
	case pageWriting:
		if m.open {
			return "READING", "↑↓ scroll   n next   p previous   esc back", pct
		}
		return "WRITING", "↑↓ choose   enter read   1-5 pages", st.barDim.Render(fmt.Sprintf("%d of %d", m.wcur+1, len(site.Writing)))
	case pageHobbies:
		return "HOBBIES", "1-5 pages   ↑↓ scroll   r refresh", st.barGreen.Render("●") + st.bar.Render(" live") + st.barDim.Render("   │   updated "+since(m.snap.Updated))
	case pageLinks:
		if m.note != "" && time.Now().Before(m.noteUntil) {
			return "LINKS", "↑↓ choose   c copy   1-5 pages", st.barGreen.Render("✓ ") + st.bar.Render(m.note)
		}
		url := m.selectedLink()
		return "LINKS", "↑↓ choose   c copy   1-5 pages", ansi.SetHyperlink(url) + st.barAccent.Render(short(url)) + ansi.ResetHyperlink()
	}
	right = st.barDim.Render(time.Now().In(cincinnati).Format("3:04 PM") + " in Cincinnati")
	if p := m.presence(true); p != "" {
		right = p + st.barDim.Render("   │   ") + right
	}
	return "HOME", "1-5 pages   r refresh   q quit", right
}

// ── the front door ──

var discordColors = map[string]string{"online": "#22C55E", "idle": "#F59E0B", "dnd": "#EF4444", "offline": "#6B7280"}
var discordWords = map[string]string{"online": "online", "idle": "idle", "dnd": "do not disturb", "offline": "offline"}

// presence is the Discord dot in its colour, the status in words and what he is doing. Empty until
// Lanyard has answered once, rather than a guess.
func (m *model) presence(onBar bool) string {
	d := m.snap.Discord
	if d == nil {
		return ""
	}
	base, dim := m.st.text, m.st.dim
	if onBar {
		base, dim = m.st.bar, m.st.barDim
	}
	col, ok := discordColors[d.Status]
	if !ok {
		col = discordColors["offline"]
	}
	word, ok := discordWords[d.Status]
	if !ok {
		word = d.Status
	}
	s := base.Foreground(lipgloss.Color(col)).Render("●") + base.Render(" "+word)
	if d.Activity != "" {
		s += dim.Render(" · ") + base.Render(trunc(d.Activity, 40))
	}
	return s
}

func (m *model) splashView() string {
	st := m.st
	var block []string
	if m.w >= 50 {
		for _, l := range wordmark {
			block = append(block, st.accent.Render(l))
		}
	} else {
		block = append(block, st.bold.Render("rohan"))
	}
	status := m.listening(m.w - 8)
	if p := m.presence(false); p != "" {
		status = p + "      " + m.listening(m.w-lipgloss.Width(p)-12)
	}
	block = append(block, "", "", status, "", "", "")
	block = append(block, st.bold.Render("press any key to come in")+" "+st.cursor.Render(" "))

	var out []string
	for i := 0; i < max(0, (m.h-len(block))/2); i++ {
		out = append(out, "")
	}
	for _, l := range block {
		out = append(out, strings.Repeat(" ", max(0, (m.w-lipgloss.Width(l))/2))+l)
	}
	return strings.Join(out, "\n")
}

func (m *model) listening(w int) string {
	st := m.st
	t := m.snap.Track
	if t == nil {
		return st.green.Render("♪ ") + st.dim.Render("nothing playing right now")
	}
	return st.green.Render("♪ ") + trunc(t.Name+st.dim.Render(" · "+t.Artists), max(10, w-2))
}

// ── Home ──

func (m *model) homeView() string {
	st, cw := m.st, m.cw
	two := cw >= 86
	lw := cw
	if two {
		lw = 48
	}
	var left []string
	add := func(s string) { left = append(left, strings.Split(s, "\n")...) }
	add(wrap("Software engineer and CS grad student who loves building things that matter. Doing my Masters at the University of Cincinnati while working part-time in healthcare tech.", lw))
	add("")
	add(st.dim.Render(wrap("When I'm not coding you'll find me taking photos, gaming with friends, or working on random design projects. I also spend way too much time tweaking my setup.", lw)))
	add("")
	add(st.bold.Render("Latest"))
	if len(site.Writing) > 0 {
		p := site.Writing[0]
		add(spread(st.accent.Render("✎ ")+trunc(p.Title, lw-12), st.dim.Render(p.Date), lw))
	}
	for _, slug := range site.LatestProjects {
		if p, ok := projectBySlug(slug); ok {
			tag := st.dim.Render(strings.ToLower(p.Group))
			add(spread(st.accent.Render("◆ ")+trunc(p.Title+st.dim.Render(" · "+p.Description), lw-lipgloss.Width(tag)-4), tag, lw))
		}
	}
	add("")
	add(st.dim.Render("rohan.run") + st.faint.Render("  ·  ") + st.dim.Render("github.com/rohzzn") + st.faint.Render("  ·  ") + st.dim.Render("ssh rohan.my"))

	if !two {
		return strings.Join(left, "\n") + "\n\n" + m.nowBox(cw)
	}
	return joinCols([]string{strings.Join(left, "\n"), m.nowBox(cw - lw - 4)}, []int{lw, cw - lw - 4}, 4)
}

func (m *model) nowBox(width int) string {
	st := m.st
	iw := width - 4
	s := m.snap
	l := []string{""}
	if s.Updated.IsZero() {
		l = append(l, st.dim.Render("looking around…"), "")
		return m.box("Right now", l, width, false)
	}
	l = append(l, st.green.Render("♪ ")+st.dim.Render("Listening"))
	if t := s.Track; t != nil {
		l = append(l, "  "+trunc(t.Name, iw-2), "  "+st.dim.Render(trunc(t.Artists, iw-2)))
		el := t.Elapsed()
		clock := mmss(el)
		bw := iw - 3 - len(clock)
		fill := 0
		if t.Duration > 0 {
			fill = int(math.Round(float64(el) / float64(t.Duration) * float64(bw)))
		}
		l = append(l, "  "+st.green.Render(strings.Repeat("━", fill))+st.faint.Render(strings.Repeat("━", max(0, bw-fill)))+" "+st.dim.Render(clock))
	} else {
		l = append(l, "  "+st.dim.Render("nothing right now"))
	}
	if len(s.Games) > 0 {
		l = append(l, "", st.blue.Render("▶ ")+st.dim.Render("Playing, last two weeks"))
		top := float64(s.Games[0].Minutes)
		for i, g := range s.Games {
			if i == 2 || g.Minutes < 6 {
				break
			}
			h := hours(g.Minutes)
			l = append(l, "  "+spread(trunc(g.Name, iw-4-len(h)), st.dim.Render(h), iw-2))
			l = append(l, "  "+st.blue.Render(blocks(float64(g.Minutes)/top, iw-2)))
		}
	}
	l = append(l, "")
	for _, a := range s.Anime {
		if a.Status == "watching" {
			l = append(l, st.gold.Render("◆ ")+st.dim.Render("Watching  ")+trunc(a.Title, iw-12))
			break
		}
	}
	if len(s.Workouts) > 0 {
		wk := s.Workouts[0]
		detail := st.dim.Render(fmt.Sprintf(" · %s · %d min", wk.Start.Format("Jan 2"), int(wk.Duration.Minutes())))
		l = append(l, st.accent.Render("▲ ")+st.dim.Render("Lifted    ")+trunc(wk.Title+detail, iw-12))
	}
	l = append(l, "")
	return m.box("Right now", l, width, false)
}

// ── Projects ──

func (m *model) projects() []Project {
	q := strings.ToLower(strings.TrimSpace(m.query))
	var out []Project
	for _, p := range projectList {
		if m.filter > 0 && p.Group != site.ProjectGroups[m.filter-1].Label {
			continue
		}
		if q != "" && !strings.Contains(strings.ToLower(p.Title+" "+p.Description+" "+strings.Join(p.Tech, " ")), q) {
			continue
		}
		out = append(out, p)
	}
	return out
}

func (m *model) projectsPane() string {
	st, cw := m.st, m.cw
	list := m.projects()

	var chips []string
	for i := 0; i <= len(site.ProjectGroups); i++ {
		label, n := "All", len(projectList)
		if i > 0 {
			label, n = site.ProjectGroups[i-1].Label, len(site.ProjectGroups[i-1].Projects)
		}
		c := fmt.Sprintf("%s %d", label, n)
		if i == m.filter {
			chips = append(chips, st.chipOn.Render(c))
		} else {
			chips = append(chips, st.dim.Render(c))
		}
	}
	search := st.faint.Render("/ search")
	switch {
	case m.searching:
		search = st.accent.Render("/ ") + m.query + st.cursor.Render(" ")
	case m.query != "":
		search = st.accent.Render("/ "+m.query) + st.dim.Render("  esc clears")
	}
	lines := []string{spread(strings.Join(chips, "   "), search, cw), ""}

	ph := m.bodyH() - 2
	preview := cw >= 84
	lw := cw
	if preview {
		lw = 30
	}
	var rows []string
	if len(list) == 0 {
		rows = append(rows, st.dim.Render("  nothing matches"))
	}
	for i := m.ptop; i < len(list) && i < m.ptop+ph; i++ {
		p := list[i]
		year := ""
		if p.Year > 0 {
			year = fmt.Sprint(p.Year)
		}
		if i == m.pcur {
			rows = append(rows, m.selRow("› "+trunc(p.Title, lw-8), year, lw))
		} else {
			rows = append(rows, spread("  "+trunc(p.Title, lw-8), st.dim.Render(year), lw))
		}
	}
	var right []string
	if preview && len(list) > 0 {
		right = m.projectPreview(list[min(m.pcur, len(list)-1)], cw-lw-4, ph)
	}
	for i := 0; i < ph; i++ {
		l, r := "", ""
		if i < len(rows) {
			l = rows[i]
		}
		if !preview {
			lines = append(lines, l)
			continue
		}
		if i < len(right) {
			r = right[i]
		}
		lines = append(lines, fit(l, lw)+" "+st.faint.Render("│")+"  "+r)
	}
	return strings.Join(lines, "\n")
}

func (m *model) projectPreview(p Project, pw, ph int) []string {
	st := m.st
	var l []string
	meta := strings.TrimSuffix(p.Group, "s")
	if p.Year > 0 {
		meta += fmt.Sprintf(" · %d", p.Year)
	}
	l = append(l, spread(st.bold.Render(trunc(p.Title, pw-lipgloss.Width(meta)-2)), st.dim.Render(meta), pw))
	l = append(l, lines(st.dim, p.Description, pw)...)
	l = append(l, "")
	l = append(l, flow(mapStr(p.Tech, func(t string) string { return st.chip.Render(t) }), " ", pw)...)
	if len(p.Links) > 0 {
		l = append(l, "")
		var ls []string
		for _, ln := range p.Links {
			ls = append(ls, m.link(ln.URL, pw-2)+st.accent.Render(" ↗"))
		}
		l = append(l, flow(ls, "   ", pw)...)
	}
	for i, para := range strings.Split(p.Story, "\n\n") {
		if strings.TrimSpace(para) == "" {
			continue
		}
		style := st.text
		if i > 0 {
			style = st.dim
		}
		l = append(l, "")
		l = append(l, lines(style, para, pw)...)
	}
	hint := st.faint.Render("enter  the whole story")
	if len(l) > ph-2 {
		l = l[:max(0, ph-2)]
		if len(l) > 0 {
			l[len(l)-1] = trunc(l[len(l)-1], pw-1) + st.dim.Render("…")
		}
	}
	return append(l, "", hint)
}

func (m *model) projectView(p Project) string {
	st, w := m.st, min(m.cw, 84)
	var b []string
	b = append(b, st.dim.Render("‹ "+p.Group), "")
	meta := strings.TrimSuffix(p.Group, "s")
	if p.Year > 0 {
		meta += fmt.Sprintf(" · %d", p.Year)
	}
	b = append(b, spread(st.sel.Render(p.Title), st.dim.Render(meta), w))
	b = append(b, lines(st.dim, p.Description, w)...)
	b = append(b, "")
	b = append(b, flow(mapStr(p.Tech, func(t string) string { return st.chip.Render(t) }), " ", w)...)
	for i, ln := range p.Links {
		if i == 0 {
			b = append(b, "")
		}
		b = append(b, m.link(ln.URL, w-2)+st.accent.Render(" ↗"))
	}
	if p.Install != "" {
		b = append(b, "", st.dim.Render("install  ")+p.Install)
	}
	for _, para := range strings.Split(p.Story, "\n\n") {
		if strings.TrimSpace(para) != "" {
			b = append(b, "")
			b = append(b, lines(st.text, para, w)...)
		}
	}
	b = append(b, "", st.dim.Render("rohan.run/projects/"+p.Slug))
	return strings.Join(b, "\n")
}

// ── Writing ──

func (m *model) postsList() (string, int) {
	st, w := m.st, m.cw
	var b []string
	at := -1
	for i, p := range site.Writing {
		if i == m.wcur {
			at = len(b)
			b = append(b, m.selRow("› "+trunc(p.Title, w-14), p.Date, w))
			for _, l := range lines(st.dim, p.Description, w-4) {
				b = append(b, "  "+l)
			}
			continue
		}
		b = append(b, spread("  "+trunc(p.Title, w-14), st.dim.Render(p.Date), w))
	}
	return strings.Join(b, "\n"), at
}

func (m *model) readingView() string {
	st := m.st
	p := site.Writing[m.wcur]
	vw := m.cw - 2
	rw := min(72, vw)
	pad := strings.Repeat(" ", max(0, (vw-rw)/2))
	var out []string
	add := func(ls ...string) {
		for _, l := range ls {
			out = append(out, pad+l)
		}
	}
	url := "https://rohan.run/writing/" + p.Slug
	add(st.dim.Render("‹ Writing"), "")
	add(lines(st.bold, p.Title, rw)...)
	mins := max(1, (p.Words+199)/200)
	add(st.dim.Render(fmt.Sprintf("%s  ·  %s  ·  %d min read", p.Date, p.Category, mins)), "")
	if len(p.Body) == 0 {
		add(lines(st.text, p.Description, rw)...)
		add("")
	}
	for i, b := range p.Body {
		switch b.T {
		case "h":
			if i > 0 && len(out) > 0 && strings.TrimSpace(out[len(out)-1]) != "" {
				add("")
			}
			add(lines(st.bold, b.Text, rw)...)
		case "li":
			for j, l := range strings.Split(wrap(b.Text, rw-2), "\n") {
				lead := "  "
				if j == 0 {
					lead = st.accent.Render("• ")
				}
				add(lead + l)
			}
			if i+1 >= len(p.Body) || p.Body[i+1].T != "li" {
				add("")
			}
			continue
		case "pre":
			for _, l := range strings.Split(b.Text, "\n") {
				add(st.blue.Render(trunc("  "+l, rw)))
			}
		case "embed":
			what := st.accent.Render("◆ ") + "Something interactive is here, on the website"
			if strings.HasPrefix(b.Text, "A video") {
				what = st.accent.Render("▶ ") + "A video plays here, on the website"
			}
			add(strings.Split(m.box("", []string{what, m.link(url, rw-6)}, rw, false), "\n")...)
		default:
			add(lines(st.text, b.Text, rw)...)
		}
		add("")
	}
	add(st.dim.Render("With pictures, at ") + m.link(url, rw-18))
	return strings.Join(out, "\n")
}

// withGutter puts a scrollbar down the right edge of the reader.
func (m *model) withGutter(view string) string {
	st := m.st
	ls := strings.Split(view, "\n")
	total, vis := m.vp.TotalLineCount(), m.vp.Height
	thumbH, thumbTop := vis, 0
	if total > vis {
		thumbH = max(1, vis*vis/total)
		thumbTop = int(math.Round(float64(vis-thumbH) * m.vp.ScrollPercent()))
	}
	for i := range ls {
		g := st.faint.Render("│")
		if i >= thumbTop && i < thumbTop+thumbH {
			g = st.accent.Render("┃")
		}
		ls[i] = fit(ls[i], m.cw-2) + " " + g
	}
	return strings.Join(ls, "\n")
}

// ── Hobbies ──

// Five of each, newest first.
const hobbyCount = 5

func (m *model) hobbiesView() string {
	st, cw := m.st, m.cw
	s := m.snap
	two := cw >= 86
	lw, rw := cw, cw
	if two {
		lw = 46
		rw = cw - lw - 5
	}
	head := func(title, note string) string { return st.bold.Render(title) + st.dim.Render("  "+note) }

	var left []string
	left = append(left, head("Games", "last played on Steam"))
	recent := s.Recent[:min(hobbyCount, len(s.Recent))]
	most := 0
	for _, g := range recent {
		most = max(most, g.Minutes)
	}
	if len(recent) == 0 {
		left = append(left, st.dim.Render("nothing lately"))
	}
	for _, g := range recent {
		// the bar and the number are the last two weeks; a game not played in them shows its date
		label := g.LastPlayed.In(cincinnati).Format("Jan 2")
		switch {
		case g.Minutes >= 6:
			label = hours(g.Minutes)
		case g.Minutes > 0:
			label = fmt.Sprintf("%d min", g.Minutes)
		}
		bw := lw - 18 - 1 - 7
		bar := ""
		if most > 0 {
			bar = blocks(float64(g.Minutes)/float64(most), bw)
		}
		left = append(left, fit(trunc(g.Name, 17), 18)+fit(st.blue.Render(bar), bw+1)+st.dim.Render(fmt.Sprintf("%7s", label)))
	}

	left = append(left, "", head("Films", "newest I've rated"))
	for i, f := range s.Films {
		if i == hobbyCount {
			break
		}
		left = append(left, spread(trunc(f.Title, lw-8), st.gold.Render(stars(f.Rating)), lw))
	}

	if len(s.Workouts) > 0 {
		left = append(left, "", head("Gym", "last workouts on Hevy"))
		for i, wk := range s.Workouts {
			if i == hobbyCount {
				break
			}
			left = append(left, spread(trunc(wk.Title, lw-18), st.dim.Render(fmt.Sprintf("%s · %d min", wk.Start.Format("Jan 2"), int(wk.Duration.Minutes()))), lw))
		}
	}

	var right []string
	if anime := latestAnime(s.Anime); len(anime) > 0 {
		right = append(right, head("Anime", "watching, then the latest finished"))
		for _, a := range anime {
			label := "finished"
			switch {
			case a.Status == "watching":
				label = st.gold.Render("watching")
			case a.Score > 0:
				label = st.dim.Render(fmt.Sprintf("%d/10", a.Score))
			default:
				label = st.dim.Render(label)
			}
			right = append(right, spread(trunc(a.Title, rw-11), label, rw))
		}
		right = append(right, "")
	}
	right = append(right, head("Books", "the latest five"))
	for i := len(site.Books) - 1; i >= 0 && i >= len(site.Books)-hobbyCount; i-- {
		b := site.Books[i]
		dots := st.accent.Render(strings.Repeat("●", b.Score)) + st.faint.Render(strings.Repeat("●", max(0, 5-b.Score)))
		right = append(right, spread(trunc(b.Title, rw-7), dots, rw))
		if b.Review != "" {
			right = append(right, st.dim.Render(trunc(b.Review, rw)))
		}
	}

	if !two {
		return strings.Join(left, "\n") + "\n\n" + strings.Join(right, "\n")
	}
	return joinCols([]string{strings.Join(left, "\n"), strings.Join(right, "\n")}, []int{lw, rw}, 5)
}

// latestAnime is what is being watched, then the most recently finished, five in all. Without the
// dates the site's API sends once it is deployed, the finished ones fall back to the best scored.
func latestAnime(all []Anime) []Anime {
	var watching, done []Anime
	for _, a := range all {
		switch a.Status {
		case "watching":
			watching = append(watching, a)
		case "watched", "completed":
			done = append(done, a)
		}
	}
	newest := func(xs []Anime) func(i, j int) bool {
		return func(i, j int) bool {
			if !xs[i].Updated.Equal(xs[j].Updated) {
				return xs[i].Updated.After(xs[j].Updated)
			}
			return xs[i].Score > xs[j].Score
		}
	}
	sort.SliceStable(watching, newest(watching))
	sort.SliceStable(done, newest(done))
	out := append(watching, done...)
	return out[:min(hobbyCount, len(out))]
}

// ── Links ──

type linkRef struct{ g, i int }

func (m *model) linkCols() [][]int {
	cols := 3
	if m.cw < 90 {
		cols = 2
	}
	if m.cw < 60 {
		cols = 1
	}
	groups, heights := make([][]int, cols), make([]int, cols)
	for gi, g := range site.LinkGroups {
		c := 0
		for k := range heights {
			if heights[k] < heights[c] {
				c = k
			}
		}
		groups[c] = append(groups[c], gi)
		heights[c] += len(g.Links) + 3
	}
	return groups
}

// linkOrder is the order ↑↓ walks the links: down each column of cards in turn.
func (m *model) linkOrder() []linkRef {
	var order []linkRef
	for _, col := range m.linkCols() {
		for _, gi := range col {
			for i := range site.LinkGroups[gi].Links {
				order = append(order, linkRef{gi, i})
			}
		}
	}
	return order
}

func (m *model) selectedLink() string {
	order := m.linkOrder()
	if len(order) == 0 {
		return ""
	}
	r := order[min(m.lcur, len(order)-1)]
	return site.LinkGroups[r.g].Links[r.i].URL
}

func (m *model) linksView() (string, int) {
	st := m.st
	cols := m.linkCols()
	cwid := (m.cw - (len(cols)-1)*2) / len(cols)
	order := m.linkOrder()
	sel := order[min(m.lcur, len(order)-1)]
	at := -1
	var colStrs []string
	var widths []int
	for _, gis := range cols {
		var out []string
		for _, gi := range gis {
			g := site.LinkGroups[gi]
			if len(out) > 0 {
				out = append(out, "")
			}
			base := len(out)
			var rows []string
			here := false
			// the name column is as wide as this card's longest name, so descriptions get the rest
			nw := 0
			for _, ln := range g.Links {
				nw = max(nw, lipgloss.Width(ln.Title)+2)
			}
			nw = min(nw, 14)
			dw := cwid - 4 - 2 - nw
			for i, ln := range g.Links {
				name := fit(trunc(ln.Title, nw-2), nw)
				if sel.g == gi && sel.i == i {
					here, at = true, base+1+i
					rows = append(rows, m.selRow("› "+name+trunc(ln.Description, dw), "", cwid-4))
					continue
				}
				rows = append(rows, "  "+name+st.dim.Render(trunc(ln.Description, dw)))
			}
			out = append(out, strings.Split(m.box(g.Label, rows, cwid, here), "\n")...)
		}
		colStrs = append(colStrs, strings.Join(out, "\n"))
		widths = append(widths, cwid)
	}
	return joinCols(colStrs, widths, 2), at
}

// ── the server room ──

var konamiCode = [...]string{"up", "up", "down", "down", "left", "right", "left", "right", "b", "a"}

type codeKey struct {
	k string
	p page // the page the visitor was on when this key went in
}

// konami notes a key and says whether it finished the Konami code. The arrows in it have already
// moved things by the time it completes, so the room opens on the page the code began on.
func (m *model) konami(k string) bool {
	m.code = append(m.code, codeKey{k, m.page})
	if len(m.code) > len(konamiCode) {
		m.code = m.code[len(m.code)-len(konamiCode):]
	}
	if len(m.code) < len(konamiCode) {
		return false
	}
	for i, c := range m.code {
		if c.k != konamiCode[i] {
			return false
		}
	}
	m.page, m.open = m.code[0].p, false
	m.code = nil
	return true
}

func (m *model) roomView() string {
	st, cw := m.st, m.cw
	s := m.snap
	up, checked := 0, 0
	for _, sv := range s.Services {
		if sv.Checked {
			checked++
			if sv.OK {
				up++
			}
		}
	}
	state := st.faint.Render("●") + st.dim.Render(" checking")
	switch {
	case checked > 0 && up == checked:
		state = st.green.Render("●") + " all green"
	case checked > 0:
		state = st.red.Render("●") + fmt.Sprintf(" %d down", checked-up)
	}
	head := spread(st.sel.Render("↑ ↑ ↓ ↓ ← → ← → b a")+st.dim.Render("   you found the server room"), state, cw)

	two := cw >= 86
	rw := cw
	if two {
		rw = cw - 38
	}
	list := s.Services
	if len(list) == 0 {
		list = roomServices
	}
	inner := rw - 4
	var units []string
	for _, sv := range list {
		led, word, took := st.faint.Render("●"), st.dim.Render("…"), ""
		if sv.Checked {
			took = st.dim.Render(fmt.Sprintf("%dms", sv.Took.Milliseconds()))
			led, word = st.green.Render("●"), st.green.Render("up")
			if !sv.OK {
				led, word = st.red.Render("●"), st.red.Render("down")
			}
		}
		right := took + "  " + fit(word, 4)
		left := led + " " + fit(trunc(sv.Name, 19), 20) + st.dim.Render(trunc(sv.Kind, max(4, inner-24-lipgloss.Width(right))))
		units = append(units, spread(left, right, inner))
	}
	units = append(units, spread(st.accent.Render("●")+" "+st.sel.Render(fit("ssh rohan.my", 20))+st.dim.Render("you are here · :2222"), fit(st.accent.Render("up"), 4), inner))
	rack := m.box("Rack", units, rw, false)

	card := m.macCard(34, up, checked)
	if !two {
		return head + "\n\n" + rack + "\n\n" + card
	}
	return head + "\n\n" + joinCols([]string{rack, card}, []int{rw, 34}, 4)
}

func (m *model) macCard(width, up, checked int) string {
	st, s := m.st, m.snap
	row := func(k, v string) string { return spread(st.dim.Render(k), v, width-4) }
	or := func(v string) string {
		if v == "" {
			return st.dim.Render("n/a")
		}
		return v
	}
	var l []string
	if mc := s.Machine; mc == nil {
		l = append(l, st.dim.Render("reading the Mac…"))
	} else {
		uptime := ""
		if !mc.Boot.IsZero() {
			uptime = span(time.Since(mc.Boot))
		}
		containers := st.red.Render("docker is off")
		if mc.Containers >= 0 {
			containers = fmt.Sprint(mc.Containers)
		}
		checks := st.green.Render(fmt.Sprintf("%d green", up))
		if up < checked {
			checks = st.red.Render(fmt.Sprintf("%d of %d green", up, checked))
		}
		l = append(l,
			row("machine", or(mc.Model)),
			row("macOS", or(mc.OS)),
			row("up for", or(uptime)),
			row("tunnels", fmt.Sprint(mc.Tunnels)),
			row("containers", containers),
			row("checks", checks),
		)
	}
	out := m.box("The Mac under the desk", l, width, false)
	for _, line := range lines(st.dim, "No ports open but this one. Everything else leaves through Cloudflare tunnels, outbound only.", width) {
		out += "\n" + line
	}
	return out
}

// span is a stretch of time in its two largest units: "3 days 4 h", "5 h 12 m".
func span(d time.Duration) string {
	days, hrs, mins := int(d.Hours())/24, int(d.Hours())%24, int(d.Minutes())%60
	switch {
	case days > 1:
		return fmt.Sprintf("%d days %d h", days, hrs)
	case days == 1:
		return fmt.Sprintf("1 day %d h", hrs)
	}
	return fmt.Sprintf("%d h %d m", hrs, mins)
}

// ── drawing helpers ──

// box is a rounded frame with an optional title set into its top edge.
func (m *model) box(title string, body []string, width int, lit bool) string {
	bs, ts := m.st.faint, m.st.bold
	if lit {
		bs, ts = m.st.accent, m.st.sel
	}
	inner := width - 4
	top := bs.Render("╭" + strings.Repeat("─", width-2) + "╮")
	if title != "" {
		top = bs.Render("╭─") + " " + ts.Render(title) + " " + bs.Render(strings.Repeat("─", max(0, width-5-lipgloss.Width(title)))+"╮")
	}
	out := []string{top}
	for _, l := range body {
		out = append(out, bs.Render("│")+" "+fit(l, inner)+" "+bs.Render("│"))
	}
	out = append(out, bs.Render("╰"+strings.Repeat("─", width-2)+"╯"))
	return strings.Join(out, "\n")
}

// selRow is a chosen row: the whole width on a soft background, left text lit, right text quiet.
func (m *model) selRow(left, right string, width int) string {
	st := m.st
	gap := width - lipgloss.Width(left) - lipgloss.Width(right)
	if gap < 1 {
		left = trunc(left, width-lipgloss.Width(right)-1)
		gap = width - lipgloss.Width(left) - lipgloss.Width(right)
	}
	return st.rowSel.Render(left) + st.row.Render(strings.Repeat(" ", max(0, gap))) + st.rowDim.Render(right)
}

// link shows a URL without its scheme, as a real hyperlink in terminals that support them.
func (m *model) link(url string, w int) string {
	return ansi.SetHyperlink(url) + m.st.accent.Render(trunc(short(url), w)) + ansi.ResetHyperlink()
}

// joinCols sets blocks of lines side by side, each padded to its width.
func joinCols(blocksIn []string, widths []int, gap int) string {
	var cols [][]string
	n := 0
	for _, b := range blocksIn {
		ls := strings.Split(b, "\n")
		cols = append(cols, ls)
		n = max(n, len(ls))
	}
	out := make([]string, n)
	for i := 0; i < n; i++ {
		var row strings.Builder
		for c, ls := range cols {
			cell := ""
			if i < len(ls) {
				cell = ls[i]
			}
			if c < len(cols)-1 {
				row.WriteString(fit(cell, widths[c]) + strings.Repeat(" ", gap))
			} else {
				row.WriteString(cell)
			}
		}
		out[i] = row.String()
	}
	return strings.Join(out, "\n")
}

// flow lays items out left to right, starting a new line when the next one would not fit.
func flow(items []string, sep string, w int) []string {
	var out []string
	line := ""
	for _, it := range items {
		if line != "" && lipgloss.Width(line)+lipgloss.Width(sep)+lipgloss.Width(it) > w {
			out = append(out, line)
			line = ""
		}
		if line != "" {
			line += sep
		}
		line += it
	}
	if line != "" {
		out = append(out, line)
	}
	return out
}

func mapStr(xs []string, f func(string) string) []string {
	out := make([]string, len(xs))
	for i, x := range xs {
		out[i] = f(x)
	}
	return out
}

// lines wraps text to w and styles each line.
func lines(style lipgloss.Style, text string, w int) []string {
	ls := strings.Split(wrap(text, w), "\n")
	for i, l := range ls {
		ls[i] = style.Render(strings.TrimRight(l, " "))
	}
	return ls
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
		return trunc(left, max(1, w-lipgloss.Width(right)-1)) + " " + right
	}
	return left + strings.Repeat(" ", gap) + right
}

func short(url string) string {
	return strings.TrimSuffix(strings.TrimPrefix(strings.TrimPrefix(url, "https://"), "http://"), "/")
}

// blocks is a bar frac of w cells long, in eighths.
func blocks(frac float64, w int) string {
	eighths := []string{"", "▏", "▎", "▍", "▌", "▋", "▊", "▉"}
	n := int(math.Round(frac * float64(w) * 8))
	s := strings.Repeat("█", n/8) + eighths[n%8]
	if s == "" && frac > 0 {
		s = "▏"
	}
	return s
}

func hours(minutes int) string { return fmt.Sprintf("%.1f h", float64(minutes)/60) }

func mmss(d time.Duration) string {
	s := int(d.Seconds())
	return fmt.Sprintf("%d:%02d", s/60, s%60)
}

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

func since(t time.Time) string {
	if t.IsZero() {
		return "not yet"
	}
	d := time.Since(t)
	if d < time.Minute {
		return "just now"
	}
	return fmt.Sprintf("%d min ago", int(d.Minutes()))
}

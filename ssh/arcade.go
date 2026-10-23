package main

import (
	"fmt"
	"strconv"
	"strings"
	"sync/atomic"
	"time"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	"github.com/charmbracelet/ssh"
)

// The Arcade tab: four games played right in the terminal, with high scores kept for everyone who
// connects. While a game is open it has the whole body of the screen and every key but ctrl+c; esc
// hands the visitor back to the list, and going back into a game carries on where it was.

type Arcade struct {
	scores *Scores
	races  *RaceHub
	online atomic.Int32 // sessions connected right now
}

func NewArcade(scoresPath string) *Arcade {
	return &Arcade{scores: OpenScores(scoresPath), races: NewRaceHub()}
}

// Count is a middleware that keeps track of how many people are connected.
func (a *Arcade) Count(next ssh.Handler) ssh.Handler {
	return func(s ssh.Session) {
		a.online.Add(1)
		defer a.online.Add(-1)
		next(s)
	}
}

// game is one of the Arcade's games, open in a session.
type game interface {
	// enter runs each time the visitor opens the game: the first time, and on coming back to it.
	enter(m *model) tea.Cmd
	// update gets every key but ctrl+c, mouse events with x and y counted from the body's top left,
	// the game's own frames, and anything else the game sent itself.
	update(m *model, msg tea.Msg) tea.Cmd
	// view is the body: m.cw wide and at most m.bodyH() tall.
	view(m *model) string
	status(m *model) (mode, hints, right string)
	// leave runs when the visitor goes back to the list.
	leave(m *model)
}

type gameInfo struct {
	id, name, icon, kind, about string
	color                       func(styles) lipgloss.Style
}

var gameList = []gameInfo{
	{"snake", "Snake", "●", "solo", "Eat, grow, and don't run into yourself. It gets faster as you get longer.",
		func(s styles) lipgloss.Style { return s.green }},
	{"2048", "2048", "■", "solo", "Slide the tiles. Two of the same make one twice as big. Get one to 2048.",
		func(s styles) lipgloss.Style { return s.gold }},
	{"chess", "Chess", "♞", "vs the Mac", "Play the Mac under my desk, on easy, medium or hard. Hard thinks for a second and a half a move.",
		func(s styles) lipgloss.Style { return s.blue }},
	{"race", "Typing race", "»", "live", "Race everyone connected, and my 115 wpm, through a paragraph from one of my posts.",
		func(s styles) lipgloss.Style { return s.accent }},
}

func newGame(id string) game {
	switch id {
	case "snake":
		return newSnake()
	case "2048":
		return newTiles()
	case "chess":
		return newChess()
	case "race":
		return &raceGame{}
	}
	return nil
}

func (m *model) openGame(id string) tea.Cmd {
	if m.games == nil {
		m.games = map[string]game{}
	}
	g := m.games[id]
	if g == nil {
		g = newGame(id)
		m.games[id] = g
	}
	m.game = g
	m.gameGen++
	return g.enter(m)
}

func (m *model) closeGame() {
	if m.game == nil {
		return
	}
	m.game.leave(m)
	m.game = nil
	m.gameGen++
	m.refresh()
}

// owned is a message meant for one opening of a game; anything from an earlier one is dropped.
type owned interface{ owner() int }

// frameMsg is a game's clock. seq ties it to one run of the game's clock, so restarting the clock
// leaves the old ticks to fall on the floor.
type frameMsg struct{ gen, seq int }

func (f frameMsg) owner() int { return f.gen }

func (m *model) frameIn(d time.Duration, seq int) tea.Cmd {
	gen := m.gameGen
	return tea.Tick(d, func(time.Time) tea.Msg { return frameMsg{gen, seq} })
}

// ── the list ──

// arcadeRows is where the first game's row sits in the list, for clicks.
const arcadeRows = 2

func (m *model) arcadeView() (string, int) {
	st, cw := m.st, m.cw
	rw := 30
	two := cw >= 72
	lw := cw
	if two {
		lw = cw - rw - 4
	}
	g := gameList[m.acur]

	var left []string
	add := func(ls ...string) { left = append(left, ls...) }
	add(st.bold.Render("Arcade")+st.dim.Render("  ·  four games, played here"), "")
	at := -1
	for i, gi := range gameList {
		note := m.gameNote(gi)
		if i == m.acur {
			at = len(left)
			add(m.selRow("› "+gi.icon+" "+gi.name, note+" ", lw))
			continue
		}
		add(spread("  "+gi.color(st).Render(gi.icon)+" "+gi.name, st.dim.Render(note+" "), lw))
	}
	add("")
	add(lines(st.dim, g.about, lw)...)
	add("", st.accent.Render("enter")+st.dim.Render(" to play, ")+st.accent.Render("esc")+st.dim.Render(" to come back"))

	var right []string
	right = append(right, strings.Split(m.box("Best · "+g.name, m.scoreLines(g.id, 8, rw-4), rw, false), "\n")...)
	right = append(right, "", st.dim.Render("You're playing as ")+st.sel.Render(m.name)+st.dim.Render("."))
	if n := m.arc.online.Load(); n > 1 {
		right = append(right, st.dim.Render(fmt.Sprintf("%d people are connected right now.", n)))
	}

	if !two {
		return strings.Join(left, "\n") + "\n\n" + strings.Join(right, "\n"), at
	}
	return joinCols([]string{strings.Join(left, "\n"), strings.Join(right, "\n")}, []int{lw, rw}, 4), at
}

// gameNote is the short line beside a game in the list.
func (m *model) gameNote(gi gameInfo) string {
	if gi.id == "race" {
		if n := m.arc.races.Racing(); n > 0 {
			return fmt.Sprintf("%d racing now", n)
		}
		return "with whoever's here"
	}
	if mine, place := m.arc.scores.Best(gi.id, m.name); place > 0 {
		return "your best " + scoreText(gi.id, mine)
	}
	if top := m.arc.scores.Top(gi.id, 1); len(top) > 0 {
		if gi.id == "chess" {
			return fmt.Sprintf("beaten by %d", m.arc.scores.Count(gi.id))
		}
		return "best " + scoreText(gi.id, top[0])
	}
	return gi.kind
}

// scoreLines is a game's board, the visitor's own name lit, and their place underneath if they are
// further down than the list goes.
func (m *model) scoreLines(id string, n, width int) []string {
	st := m.st
	top := m.arc.scores.Top(id, n)
	if len(top) == 0 {
		return []string{st.dim.Render("nobody yet. be the first.")}
	}
	row := func(place int, sc Score) string {
		val := scoreText(id, sc)
		nw := max(4, min(14, width-5-lipgloss.Width(val)))
		name := st.text.Render(fit(sc.Name, nw))
		if sc.Name == m.name {
			name = st.sel.Render(fit(sc.Name, nw))
		}
		return spread(st.dim.Render(fmt.Sprintf("%2d  ", place))+name, val, width)
	}
	var l []string
	for i, sc := range top {
		l = append(l, row(i+1, sc))
	}
	if mine, place := m.arc.scores.Best(id, m.name); place > n {
		l = append(l, st.faint.Render("   ⋮"), row(place, mine))
	}
	return l
}

func scoreText(id string, sc Score) string {
	switch id {
	case "2048":
		return commas(sc.Value)
	case "chess":
		return sc.Note
	case "race":
		return fmt.Sprintf("%d wpm", sc.Value)
	}
	return strconv.Itoa(sc.Value)
}

func commas(n int) string {
	s := strconv.Itoa(n)
	for i := len(s) - 3; i > 0; i -= 3 {
		s = s[:i] + "," + s[i:]
	}
	return s
}

// tooSmall stands in for a game whose board does not fit the window.
func tooSmall(m *model, w, h int) string {
	msg := fmt.Sprintf("This one needs a window of at least %d × %d. Make it a little bigger,", w+4, h+4)
	return "\n" + m.st.dim.Render(msg) + "\n" + m.st.dim.Render("or press esc to go back.")
}

// card is a small box of centred lines drawn over a game, centred on (cx, cy).
type cardLine struct {
	text, fg string
	bold     bool
}

func (c *canvas) card(cx, cy int, ls []cardLine) {
	w := 0
	for _, l := range ls {
		w = max(w, len([]rune(l.text)))
	}
	w += 6
	h := len(ls) + 2
	x, y := cx-w/2, cy-h/2
	c.frame(x, y, w, h, cFaint, cPanel, "", "")
	for i, l := range ls {
		c.center(x, y+1+i, w, l.text, l.fg, cPanel, l.bold)
	}
}

// panel sets a game's side panel beside its board, when there is room for one.
func (m *model) withPanel(board []string, bw int, panel []string) string {
	pw := m.cw - bw - 4
	if pw < 20 {
		return strings.Join(board, "\n")
	}
	for i := range panel {
		panel[i] = trunc(panel[i], pw)
	}
	return joinCols([]string{strings.Join(board, "\n"), strings.Join(panel, "\n")}, []int{bw, pw}, 4)
}

// keyHelp lines up a game's keys for its side panel.
func (m *model) keyHelp(pairs ...string) []string {
	var out []string
	for i := 0; i+1 < len(pairs); i += 2 {
		out = append(out, m.st.accent.Render(fit(pairs[i], 7))+m.st.dim.Render(pairs[i+1]))
	}
	return out
}

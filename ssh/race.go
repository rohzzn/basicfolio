package main

import (
	"fmt"
	"math"
	"math/rand/v2"
	"sort"
	"strings"
	"sync"
	"time"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

// The typing race. Everyone who opens it within a few seconds of each other races the same paragraph,
// one of mine, alongside a ghost of me typing at my best, 115 wpm. Races live in the RaceHub, shared
// by every session, and each racer's screen looks at theirs a dozen times a second.

const (
	rohanWPM  = 115
	raceReady = 3 * time.Second // the least anyone joining gets before the start
	raceMax   = 6
	raceLimit = 3 * time.Minute
	raceSlack = 6   // wrong characters allowed before the rest have to be fixed
	raceHuman = 250 // past this many wpm it is a script, not a person, and stays off the board
)

type RaceHub struct {
	mu    sync.Mutex
	open  *Race // the race still taking racers, nil if there is none
	races []*Race
	rng   *rand.Rand
}

type Race struct {
	text   []rune
	from   string // the post the paragraph is from
	start  time.Time
	racers []*Racer
}

type Racer struct {
	Name  string
	Ghost bool
	Done  int           // characters typed correctly
	Took  time.Duration // from the start to the last character, 0 until then
	WPM   int
	Acc   int // percent of keys that were right
	Left  bool
}

func NewRaceHub() *RaceHub {
	return &RaceHub{rng: rand.New(rand.NewPCG(uint64(time.Now().UnixNano()), 5))}
}

// Join puts a racer in the race that is about to start, or starts a new one that waits for others
// to join for as long as wait.
func (h *RaceHub) Join(name string, wait time.Duration) (*Race, *Racer) {
	h.mu.Lock()
	defer h.mu.Unlock()
	now := time.Now()
	r := h.open
	if r == nil || now.After(r.start.Add(-time.Second)) || r.humans() >= raceMax {
		ps := racePassages()
		p := ps[h.rng.IntN(len(ps))]
		r = &Race{text: []rune(p.text), from: p.from, start: now.Add(wait)}
		r.racers = []*Racer{{Name: "rohan", Ghost: true}}
		h.open = r
		h.races = append(h.races, r)
	}
	if r.start.Sub(now) < raceReady {
		r.start = now.Add(raceReady)
	}
	me := &Racer{Name: r.unique(name)}
	r.racers = append(r.racers, me)
	return r, me
}

func (r *Race) humans() int {
	n := 0
	for _, x := range r.racers {
		if !x.Ghost && !x.Left {
			n++
		}
	}
	return n
}

// unique gives a second "alex" in the same race the name "alex2".
func (r *Race) unique(name string) string {
	taken := map[string]bool{}
	for _, x := range r.racers {
		taken[x.Name] = true
	}
	out := name
	for i := 2; taken[out]; i++ {
		out = fmt.Sprintf("%s%d", name, i)
	}
	return out
}

// over: everyone has finished or gone, or it has run three minutes.
func (r *Race) over(now time.Time) bool {
	if now.Before(r.start) {
		return false
	}
	if now.Sub(r.start) > raceLimit {
		return true
	}
	for _, x := range r.racers {
		if !x.Ghost && !x.Left && x.Took == 0 {
			return false
		}
	}
	return true
}

// The ghost types at 115 wpm with a little rhythm to it, never going backwards.
const ghostRate = rohanWPM * 5.0 / 60 // characters a second

func ghostDone(t float64) float64 {
	if t <= 0 {
		return 0
	}
	return ghostRate * (t + .35*math.Sin(1.7*t))
}

func ghostTook(n int) time.Duration {
	lo, hi := 0.0, float64(n)/ghostRate*2+2
	for i := 0; i < 40; i++ {
		if mid := (lo + hi) / 2; ghostDone(mid) >= float64(n) {
			hi = mid
		} else {
			lo = mid
		}
	}
	return time.Duration(hi * float64(time.Second))
}

type raceLook struct {
	text   []rune
	from   string
	start  time.Time
	racers []Racer
	over   bool
}

// Look is a copy of a race as it stands, the ghost's progress worked out for now.
func (h *RaceHub) Look(r *Race) raceLook {
	h.mu.Lock()
	defer h.mu.Unlock()
	now := time.Now()
	l := raceLook{text: r.text, from: r.from, start: r.start, over: r.over(now)}
	for _, x := range r.racers {
		c := *x
		if c.Ghost {
			c.Done = min(len(r.text), int(ghostDone(now.Sub(r.start).Seconds())))
			if c.Done == len(r.text) {
				c.Took, c.WPM, c.Acc = ghostTook(len(r.text)), rohanWPM, 100
			}
		}
		l.racers = append(l.racers, c)
	}
	return l
}

func (h *RaceHub) Progress(me *Racer, done int) {
	h.mu.Lock()
	me.Done = done
	h.mu.Unlock()
}

func (h *RaceHub) Finish(me *Racer, took time.Duration, wpm, acc int) {
	h.mu.Lock()
	me.Took, me.WPM, me.Acc = took, wpm, acc
	h.mu.Unlock()
}

func (h *RaceHub) Leave(r *Race, me *Racer) {
	if r == nil || me == nil {
		return
	}
	h.mu.Lock()
	defer h.mu.Unlock()
	me.Left = true
	if r == h.open && r.humans() == 0 {
		h.open = nil // nobody is waiting in it, so the next one in gets a fresh paragraph
	}
}

// Racing is how many people are in a race or waiting for one to start.
func (h *RaceHub) Racing() int {
	h.mu.Lock()
	defer h.mu.Unlock()
	now := time.Now()
	n := 0
	keep := h.races[:0]
	for _, r := range h.races {
		if r.over(now) || r.humans() == 0 {
			continue
		}
		keep = append(keep, r)
		for _, x := range r.racers {
			if !x.Ghost && !x.Left && x.Took == 0 {
				n++
			}
		}
	}
	h.races = keep
	return n
}

// ── the paragraphs ──

type passage struct{ text, from string }

var (
	passagesOnce sync.Once
	passages     []passage
)

// racePassages is every paragraph of my posts that makes a good race: plain text, one to two and a
// half hundred characters, ending a sentence.
func racePassages() []passage {
	passagesOnce.Do(func() {
		for _, p := range site.Writing {
			for _, b := range p.Body {
				if b.T != "p" {
					continue
				}
				t := plainText(b.Text)
				if len(t) >= 140 && len(t) <= 300 && strings.HasSuffix(t, ".") && !strings.Contains(t, "http") {
					passages = append(passages, passage{t, p.Title})
				}
			}
		}
		if len(passages) == 0 {
			passages = []passage{{"I build things for the web and for the terminal, and I spend way too much time tweaking my setup. This paragraph is here because the posts did not load.", "rohan.run"}}
		}
	})
	return passages
}

// plainText swaps typographic quotes and dashes for the ones on a keyboard, and gives up (returning
// "") on anything else that is not plain ASCII.
func plainText(s string) string {
	s = strings.NewReplacer("’", "'", "‘", "'", "“", "\"", "”", "\"", " — ", " - ", "—", " - ", "–", "-", "…", "...", " ", " ").Replace(s)
	s = strings.Join(strings.Fields(s), " ")
	for _, r := range s {
		if r < 32 || r > 126 {
			return ""
		}
	}
	return s
}

// ── the screen ──

type raceGame struct {
	race   *Race
	me     *Racer
	look   raceLook
	typed  []rune
	keys   int
	misses int
	done   bool
	place  int // on the board, after finishing
	seq    int
}

func (g *raceGame) join(m *model) {
	wait := 5 * time.Second // alone, just long enough to get ready
	if m.arc.online.Load() > 1 {
		wait = 10 * time.Second // others are connected; give them a moment to come
	}
	g.race, g.me = m.arc.races.Join(m.name, wait)
	g.typed, g.keys, g.misses, g.done, g.place = nil, 0, 0, false, 0
	g.look = m.arc.races.Look(g.race)
}

func (g *raceGame) enter(m *model) tea.Cmd {
	g.join(m)
	g.seq++
	return m.frameIn(80*time.Millisecond, g.seq)
}

func (g *raceGame) leave(m *model) {
	m.arc.races.Leave(g.race, g.me)
	g.seq++
}

// right is how many characters from the start the visitor has typed correctly.
func (g *raceGame) right() int {
	n := 0
	for n < len(g.typed) && n < len(g.look.text) && g.typed[n] == g.look.text[n] {
		n++
	}
	return n
}

func (g *raceGame) racing() bool {
	return !g.done && !g.look.over && !time.Now().Before(g.look.start)
}

func (g *raceGame) key(m *model, r rune) {
	if !g.racing() || len(g.typed)-g.right() >= raceSlack || len(g.typed) >= len(g.look.text) {
		return
	}
	g.typed = append(g.typed, r)
	g.keys++
	if r != g.look.text[len(g.typed)-1] {
		g.misses++
	}
	g.progress(m)
}

func (g *raceGame) progress(m *model) {
	ok := g.right()
	m.arc.races.Progress(g.me, ok)
	if ok < len(g.look.text) {
		return
	}
	took := time.Since(g.look.start)
	wpm := int(math.Round(float64(len(g.look.text)) / 5 / took.Minutes()))
	acc := int(math.Round(100 * float64(g.keys-g.misses) / float64(max(1, g.keys))))
	g.done = true
	m.arc.races.Finish(g.me, took, wpm, acc)
	if wpm <= raceHuman {
		g.place = m.arc.scores.Add("race", Score{Name: m.name, Value: wpm, Note: fmt.Sprintf("%d%%", acc), At: time.Now()})
	}
	g.look = m.arc.races.Look(g.race)
}

func (g *raceGame) update(m *model, msg tea.Msg) tea.Cmd {
	switch msg := msg.(type) {
	case frameMsg:
		if msg.seq != g.seq {
			return nil
		}
		g.look = m.arc.races.Look(g.race)
		return m.frameIn(80*time.Millisecond, g.seq)
	case tea.KeyMsg:
		switch msg.Type {
		case tea.KeyEsc:
			m.closeGame()
		case tea.KeyEnter:
			if g.done || g.look.over {
				m.arc.races.Leave(g.race, g.me)
				g.join(m)
			}
		case tea.KeyBackspace:
			if g.racing() && len(g.typed) > 0 {
				g.typed = g.typed[:len(g.typed)-1]
				g.progress(m)
			}
		case tea.KeyCtrlW:
			if g.racing() {
				n := len(g.typed)
				for n > 0 && g.typed[n-1] == ' ' {
					n--
				}
				for n > 0 && g.typed[n-1] != ' ' {
					n--
				}
				g.typed = g.typed[:n]
				g.progress(m)
			}
		case tea.KeySpace:
			g.key(m, ' ')
		case tea.KeyRunes:
			if msg.Paste {
				return nil // no pasting your way to first
			}
			for _, r := range msg.Runes {
				g.key(m, r)
			}
		}
	}
	return nil
}

// standings is everyone in finishing order: finished by time, then the rest by how far they are.
func (l raceLook) standings() []Racer {
	out := append([]Racer(nil), l.racers...)
	sort.SliceStable(out, func(i, j int) bool {
		a, b := out[i], out[j]
		switch {
		case a.Took > 0 && b.Took > 0:
			return a.Took < b.Took
		case a.Took > 0 || b.Took > 0:
			return a.Took > 0
		}
		return a.Done > b.Done
	})
	return out
}

func ordinal(n int) string {
	suffix := "th"
	if n%100 < 11 || n%100 > 13 {
		switch n % 10 {
		case 1:
			suffix = "st"
		case 2:
			suffix = "nd"
		case 3:
			suffix = "rd"
		}
	}
	return fmt.Sprint(n) + suffix
}

func (g *raceGame) view(m *model) string {
	st, cw := m.st, m.cw
	l := g.look
	now := time.Now()
	var out []string
	add := func(ls ...string) { out = append(out, ls...) }
	add(spread(st.bold.Render("Typing race"), st.dim.Render(trunc("from “"+l.from+"”", cw-16)), cw), "")

	places := map[string]int{}
	for i, x := range l.standings() {
		places[x.Name] = i + 1
	}
	elapsed := now.Sub(l.start)
	for _, x := range l.racers {
		if x.Left && x.Took == 0 {
			continue
		}
		name, tag, col := x.Name, "", st.blue
		switch {
		case x.Ghost:
			tag, col = "ghost", st.gold
		case x.Name == g.me.Name:
			tag, col = "you", st.accent
		}
		wpm := ""
		switch {
		case x.Took > 0:
			wpm = fmt.Sprintf("%s · %d wpm", ordinal(places[x.Name]), x.WPM)
		case elapsed > time.Second && x.Done > 0:
			wpm = fmt.Sprintf("%d wpm", int(float64(x.Done)/5/elapsed.Minutes()))
		}
		tw := cw - 14 - 7 - 15
		frac := float64(x.Done) / float64(max(1, len(l.text)))
		at := int(math.Round(frac * float64(tw-1)))
		track := col.Render(strings.Repeat("━", at)+"●") + st.faint.Render(strings.Repeat("─", max(0, tw-1-at)))
		left := fit(name, 13) + " " + st.dim.Render(fit(tag, 6)) + " " + track
		add(spread(left, st.dim.Render(wpm), cw))
	}
	add("")

	// the paragraph: what is right in full colour, mistakes in red, the cursor, and the rest dim
	inner := cw - 4
	var rows []string
	ok := g.right()
	wrong := m.ren.NewStyle().Background(lipgloss.Color("#7a2e25")).Foreground(lipgloss.Color("#ffd9d2"))
	for _, span := range wrapRunes(l.text, inner) {
		var b strings.Builder
		for i := span[0]; i < span[1]; {
			class := func(i int) int {
				switch {
				case i < ok:
					return 0
				case i < len(g.typed):
					return 1
				case i == len(g.typed) && g.racing():
					return 2
				}
				return 3
			}
			c := class(i)
			j := i
			for j < span[1] && class(j) == c {
				j++
			}
			s := string(l.text[i:j])
			switch c {
			case 0:
				b.WriteString(st.text.Render(s))
			case 1:
				b.WriteString(wrong.Render(s))
			case 2:
				b.WriteString(st.cursor.Render(s))
			default:
				b.WriteString(st.dim.Render(s))
			}
			i = j
		}
		rows = append(rows, b.String())
	}
	add(strings.Split(m.box("", rows, cw, g.racing()), "\n")...)
	add("")

	switch {
	case now.Before(l.start):
		left := int(math.Ceil(l.start.Sub(now).Seconds()))
		others := 0
		for _, x := range l.racers {
			if !x.Ghost && !x.Left && x.Name != g.me.Name {
				others++
			}
		}
		who := "waiting a moment for anyone else connected to join"
		if others > 0 {
			who = fmt.Sprintf("racing %d other%s and the ghost of my 115 wpm", others, map[bool]string{true: "", false: "s"}[others == 1])
		}
		add(st.sel.Render(fmt.Sprintf("starting in %d", left)) + st.dim.Render("  ·  "+who))
	case g.done:
		line := st.sel.Render(fmt.Sprintf("you came %s", ordinal(places[g.me.Name]))) +
			st.dim.Render(fmt.Sprintf("  ·  %d wpm  ·  %d%% accurate", g.mine().WPM, g.mine().Acc))
		if g.place > 0 {
			line += st.accent.Render(fmt.Sprintf("  ·  a new best, #%d", g.place))
		}
		add(line)
		if l.over {
			add(st.dim.Render("everyone's in. ") + st.accent.Render("enter") + st.dim.Render(" to race again"))
		} else {
			add(st.dim.Render("waiting for the others. ") + st.accent.Render("enter") + st.dim.Render(" to start a new race"))
		}
	case l.over:
		add(st.dim.Render("time's up. ") + st.accent.Render("enter") + st.dim.Render(" to race again"))
	default:
		secs := elapsed.Seconds()
		wpm := 0
		if secs > 1 {
			wpm = int(float64(ok) / 5 / (secs / 60))
		}
		acc := 100
		if g.keys > 0 {
			acc = int(math.Round(100 * float64(g.keys-g.misses) / float64(g.keys)))
		}
		line := st.accent.Render("go!") + st.dim.Render(fmt.Sprintf("  ·  %d wpm  ·  %d%%  ·  %.0f s", wpm, acc, secs))
		if len(g.typed)-ok >= raceSlack {
			line += st.red.Render("  ·  fix the red first")
		}
		add(line)
	}
	add("", st.bold.Render("Fastest"))
	add(m.scoreLines("race", max(1, m.bodyH()-len(out)-1), cw)...)
	return strings.Join(out[:min(len(out), m.bodyH())], "\n")
}

func (g *raceGame) mine() Racer {
	for _, x := range g.look.racers {
		if x.Name == g.me.Name && !x.Ghost {
			return x
		}
	}
	return Racer{}
}

func (g *raceGame) status(m *model) (string, string, string) {
	right := m.st.barDim.Render(fmt.Sprintf("%d of %d", g.right(), len(g.look.text)))
	if g.done || g.look.over {
		return "TYPING RACE", "enter race again   esc back", right
	}
	return "TYPING RACE", "type the paragraph   backspace fix   ctrl+w a word   esc back", right
}

// wrapRunes breaks text into lines of at most w characters at spaces, as [start, end) spans that keep
// each line's trailing space, so every character, spaces too, has a place to be coloured.
func wrapRunes(text []rune, w int) [][2]int {
	var out [][2]int
	start := 0
	for start < len(text) {
		end := min(len(text), start+w)
		if end < len(text) {
			cut := end
			for cut > start && text[cut-1] != ' ' {
				cut--
			}
			if cut > start {
				end = cut
			}
		}
		out = append(out, [2]int{start, end})
		start = end
	}
	return out
}

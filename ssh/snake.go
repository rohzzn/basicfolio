package main

import (
	"fmt"
	"math/rand/v2"
	"strings"
	"time"

	tea "github.com/charmbracelet/bubbletea"
)

// Snake on a 24 × 16 board, each cell two characters wide so it comes out square. Turns are queued,
// so a quick up-then-left between two steps lands both instead of losing one. It starts at a step
// every 115 ms and gets 2 ms quicker for each thing eaten, down to 55.

const snakeW, snakeH = 24, 16

type pt struct{ x, y int }

type snakeState int

const (
	snakeReady snakeState = iota
	snakeRunning
	snakePaused
	snakeDying
	snakeOver
)

type snakeGame struct {
	body    []pt // head first
	dir     pt
	turns   []pt // queued, at most three
	food    pt
	score   int
	state   snakeState
	seq     int
	flash   int  // frames of the death flash still to show
	place   int  // where the last game landed on the board, 0 if it did not
	newBest bool // the last game beat the visitor's own best
	rng     *rand.Rand
}

func newSnake() *snakeGame {
	g := &snakeGame{rng: rand.New(rand.NewPCG(uint64(time.Now().UnixNano()), 1))}
	g.reset()
	return g
}

func (g *snakeGame) reset() {
	g.body = []pt{{9, 8}, {8, 8}, {7, 8}, {6, 8}}
	g.dir, g.turns, g.score, g.state = pt{1, 0}, nil, 0, snakeReady
	g.place, g.newBest = 0, false
	g.placeFood()
}

func (g *snakeGame) placeFood() {
	taken := map[pt]bool{}
	for _, p := range g.body {
		taken[p] = true
	}
	var free []pt
	for y := 0; y < snakeH; y++ {
		for x := 0; x < snakeW; x++ {
			if !taken[pt{x, y}] {
				free = append(free, pt{x, y})
			}
		}
	}
	if len(free) > 0 {
		g.food = free[g.rng.IntN(len(free))]
	}
}

func (g *snakeGame) interval() time.Duration {
	return time.Duration(max(55, 115-g.score*2)) * time.Millisecond
}

// queue adds a turn, unless it is the way the snake is already going or straight back on itself.
func (g *snakeGame) queue(d pt) {
	last := g.dir
	if n := len(g.turns); n > 0 {
		last = g.turns[n-1]
	}
	if d == last || d.x == -last.x && d.y == -last.y || len(g.turns) >= 3 {
		return
	}
	g.turns = append(g.turns, d)
}

func (g *snakeGame) step(m *model) {
	if len(g.turns) > 0 {
		g.dir, g.turns = g.turns[0], g.turns[1:]
	}
	head := pt{g.body[0].x + g.dir.x, g.body[0].y + g.dir.y}
	grow := head == g.food
	hit := head.x < 0 || head.y < 0 || head.x >= snakeW || head.y >= snakeH
	rest := g.body
	if !grow {
		rest = rest[:len(rest)-1] // the tail moves out of the way as the head moves in
	}
	for _, p := range rest {
		hit = hit || p == head
	}
	if hit {
		g.state, g.flash = snakeDying, 7
		g.place = m.arc.scores.Add("snake", Score{Name: m.name, Value: g.score, At: time.Now()})
		g.newBest = g.place > 0
		return
	}
	g.body = append([]pt{head}, rest...)
	if grow {
		g.score++
		g.placeFood()
	}
}

var snakeDirs = map[string]pt{"up": {0, -1}, "down": {0, 1}, "left": {-1, 0}, "right": {1, 0}}

func (g *snakeGame) enter(m *model) tea.Cmd {
	if g.state == snakeDying {
		g.state = snakeOver
	}
	return nil
}

func (g *snakeGame) leave(m *model) {
	switch g.state {
	case snakeRunning:
		g.state = snakePaused
	case snakeDying:
		g.state = snakeOver
	}
	g.seq++
}

func (g *snakeGame) update(m *model, msg tea.Msg) tea.Cmd {
	switch msg := msg.(type) {
	case frameMsg:
		if msg.seq != g.seq {
			return nil
		}
		switch g.state {
		case snakeRunning:
			g.step(m)
			if g.state == snakeDying {
				return m.frameIn(70*time.Millisecond, g.seq)
			}
			return m.frameIn(g.interval(), g.seq)
		case snakeDying:
			if g.flash--; g.flash <= 0 {
				g.state = snakeOver
				return nil
			}
			return m.frameIn(70*time.Millisecond, g.seq)
		}
	case tea.KeyMsg:
		k := wasd(msg.String())
		if d, ok := snakeDirs[k]; ok {
			switch g.state {
			case snakeRunning:
				g.queue(d)
			case snakeReady, snakePaused:
				g.queue(d)
				g.state = snakeRunning
				g.seq++
				return m.frameIn(g.interval(), g.seq)
			}
			return nil
		}
		switch k {
		case "esc", "q":
			m.closeGame()
		case " ", "p":
			switch g.state {
			case snakeRunning:
				g.state = snakePaused
				g.seq++
			case snakePaused:
				g.state = snakeRunning
				g.seq++
				return m.frameIn(g.interval(), g.seq)
			}
		case "enter", "r":
			if g.state == snakeOver {
				g.reset()
			}
		}
	}
	return nil
}

func (g *snakeGame) view(m *model) string {
	bw, bh := snakeW*2+2, snakeH+2
	if m.cw < bw || m.bodyH() < bh {
		return tooSmall(m, bw, bh)
	}
	c := newCanvas(bw, bh)
	c.frame(0, 0, bw, bh, cFaint, cBoard, "Snake", cText)
	for y := 0; y < snakeH; y++ {
		for x := 0; x < snakeW; x++ {
			if (x+y)%2 == 1 {
				c.fill(1+x*2, 1+y, 2, 1, cBoard2)
			}
		}
	}
	if g.state != snakeOver {
		c.put(1+g.food.x*2, 1+g.food.y, "▐▌", cRed, "", false)
	}
	n := len(g.body)
	for i := n - 1; i >= 0; i-- {
		p := g.body[i]
		t := float64(i) / float64(max(1, n-1))
		col := lerpHex("#b8e3ae", "#3b6a37", t)
		switch {
		case g.state == snakeDying && g.flash%2 == 1:
			col = cRed
		case g.state == snakeOver:
			col = lerpHex("#5c5852", "#33312d", t)
		case i == 0:
			col = "#dff5d8"
		}
		c.put(1+p.x*2, 1+p.y, "██", col, "", false)
	}
	cx, cy := bw/2, bh/2
	switch g.state {
	case snakeReady:
		c.card(cx, cy, []cardLine{{"press an arrow to start", cText, false}})
	case snakePaused:
		c.card(cx, cy, []cardLine{{"paused", cText, true}, {"an arrow or space to go on", cDim, false}})
	case snakeOver:
		ls := []cardLine{{"game over", cText, true}, {"", "", false}, {fmt.Sprintf("you ate %d", g.score), cText, false}}
		if g.newBest {
			ls = append(ls, cardLine{fmt.Sprintf("a new best · #%d on the board", g.place), cAccent, true})
		}
		ls = append(ls, cardLine{"", "", false}, cardLine{"enter to play again", cDim, false})
		c.card(cx, cy, ls)
	}

	st := m.st
	best := st.dim.Render("no best yet")
	if mine, place := m.arc.scores.Best("snake", m.name); place > 0 {
		best = st.dim.Render(fmt.Sprintf("your best %d · #%d", mine.Value, place))
	}
	speed := (115 - int(g.interval()/time.Millisecond)) / 10 // 0 to 6
	panel := []string{
		st.dim.Render("Score"),
		st.bold.Render(fmt.Sprint(g.score)),
		best,
		"",
		st.dim.Render("Speed  ") + st.green.Render(strings.Repeat("▮", speed+1)) + st.faint.Render(strings.Repeat("▯", 6-speed)),
		"",
		st.bold.Render("Best"),
	}
	panel = append(panel, m.scoreLines("snake", 5, m.cw-bw-4)...)
	panel = append(panel, "")
	panel = append(panel, m.keyHelp("↑↓←→", "steer", "space", "pause", "esc", "back")...)
	return m.withPanel(c.lines(m.ren), bw, panel)
}

func (g *snakeGame) status(m *model) (string, string, string) {
	right := m.st.barDim.Render(fmt.Sprintf("length %d", len(g.body)))
	return "SNAKE", "↑↓←→ wasd steer   space pause   esc back", right
}

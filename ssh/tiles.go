package main

import (
	"fmt"
	"math"
	"math/rand/v2"
	"strconv"
	"time"

	tea "github.com/charmbracelet/bubbletea"
)

// 2048. A move takes effect at once; what follows is only the drawing of it: the tiles slide over
// six frames, then the merged ones swell for a moment and the new one grows in. A key pressed
// mid-slide finishes the slide on the spot, so fast play never waits on the animation.

const (
	tileW, tileH = 7, 3
	tileGapX     = 2
	tileGapY     = 1
	tilesW       = 4*tileW + 5*tileGapX
	tilesH       = 4*tileH + 5*tileGapY
	slideFrames  = 6
	settleFrames = 3
)

type tilesGame struct {
	grid   [4][4]int
	score  int
	gained int // points from the last move
	won    bool
	keep   bool // made 2048 and chose to carry on
	over   bool
	place  int
	rng    *rand.Rand

	// the last move, for drawing it
	slides []slide
	merged []pt // x is the column, y the row
	spawn  pt
	frame  int // 0 when nothing is moving
	seq    int
}

type slide struct {
	v                      int
	fromR, fromC, toR, toC int
}

func newTiles() *tilesGame {
	g := &tilesGame{rng: rand.New(rand.NewPCG(uint64(time.Now().UnixNano()), 2))}
	g.reset()
	return g
}

func (g *tilesGame) reset() {
	*g = tilesGame{rng: g.rng, seq: g.seq + 1}
	g.addTile()
	g.addTile()
	g.slides = nil
}

func (g *tilesGame) addTile() {
	var free []pt
	for r := 0; r < 4; r++ {
		for c := 0; c < 4; c++ {
			if g.grid[r][c] == 0 {
				free = append(free, pt{c, r})
			}
		}
	}
	if len(free) == 0 {
		return
	}
	p := free[g.rng.IntN(len(free))]
	g.grid[p.y][p.x] = 2
	if g.rng.IntN(10) == 0 {
		g.grid[p.y][p.x] = 4
	}
	g.spawn = p
}

// shift moves every tile as far as it goes toward dir, merging pairs, and says whether anything moved.
func (g *tilesGame) shift(dir string) bool {
	var next [4][4]int
	var slides []slide
	var merged []pt
	moved, gained := false, 0
	for line := 0; line < 4; line++ {
		// this line's cells, starting from the wall the tiles move toward
		var cells [4]pt
		for i := 0; i < 4; i++ {
			switch dir {
			case "left":
				cells[i] = pt{i, line}
			case "right":
				cells[i] = pt{3 - i, line}
			case "up":
				cells[i] = pt{line, i}
			case "down":
				cells[i] = pt{line, 3 - i}
			}
		}
		pos, open := 0, -1 // open: the cell whose tile can still take a merge this move
		for _, c := range cells {
			v := g.grid[c.y][c.x]
			if v == 0 {
				continue
			}
			if open >= 0 && next[cells[open].y][cells[open].x] == v {
				t := cells[open]
				next[t.y][t.x] = v * 2
				gained += v * 2
				merged = append(merged, t)
				slides = append(slides, slide{v, c.y, c.x, t.y, t.x})
				open, moved = -1, true
				continue
			}
			t := cells[pos]
			next[t.y][t.x] = v
			slides = append(slides, slide{v, c.y, c.x, t.y, t.x})
			moved = moved || t != c
			open = pos
			pos++
		}
	}
	if !moved {
		return false
	}
	g.grid, g.slides, g.merged, g.gained = next, slides, merged, gained
	g.score += gained
	return true
}

func (g *tilesGame) canMove() bool {
	for r := 0; r < 4; r++ {
		for c := 0; c < 4; c++ {
			v := g.grid[r][c]
			if v == 0 || c < 3 && g.grid[r][c+1] == v || r < 3 && g.grid[r+1][c] == v {
				return true
			}
		}
	}
	return false
}

func (g *tilesGame) has(v int) bool {
	for _, row := range g.grid {
		for _, x := range row {
			if x >= v {
				return true
			}
		}
	}
	return false
}

// submit puts the score on the board. Only the visitor's best stays there, so it is safe to call
// more than once a game.
func (g *tilesGame) submit(m *model) {
	if p := m.arc.scores.Add("2048", Score{Name: m.name, Value: g.score, At: time.Now()}); p > 0 {
		g.place = p
	}
}

func (g *tilesGame) enter(m *model) tea.Cmd { g.frame = 0; return nil }

func (g *tilesGame) leave(m *model) {
	if !g.over {
		g.submit(m)
	}
}

func (g *tilesGame) update(m *model, msg tea.Msg) tea.Cmd {
	switch msg := msg.(type) {
	case frameMsg:
		if msg.seq != g.seq || g.frame == 0 {
			return nil
		}
		if g.frame++; g.frame > slideFrames+settleFrames {
			g.frame = 0
			return nil
		}
		return m.frameIn(16*time.Millisecond, g.seq)
	case tea.KeyMsg:
		k := wasd(msg.String())
		switch k {
		case "up", "down", "left", "right":
			if g.over || g.won && !g.keep {
				return nil
			}
			if !g.shift(k) {
				return nil
			}
			g.addTile()
			if !g.keep && g.has(2048) {
				g.won = true
			}
			if !g.canMove() {
				g.over = true
				g.submit(m)
			}
			g.frame, g.seq = 1, g.seq+1
			return m.frameIn(16*time.Millisecond, g.seq)
		case "enter":
			switch {
			case g.over:
				g.reset()
			case g.won && !g.keep:
				g.keep = true
			}
		case "n":
			if !g.over {
				g.submit(m)
			}
			g.reset()
		case "esc", "q":
			m.closeGame()
		}
	}
	return nil
}

// tileColors is a tile's background and number colour: warm greys, then oranges and reds, then gold
// from 128 up, and a violet past 2048.
func tileColors(v int) (bg, fg string) {
	switch v {
	case 2:
		return "#3b3731", "#e8e2d6"
	case 4:
		return "#4a4237", "#f0e6d2"
	case 8:
		return "#b9692c", "#fff8ef"
	case 16:
		return "#c95a2b", "#fff8ef"
	case 32:
		return "#d24b36", "#fff8ef"
	case 64:
		return "#d9392c", "#fff8ef"
	case 128:
		return "#cfa443", cInk
	case 256:
		return "#d6a634", cInk
	case 512:
		return "#dca826", cInk
	case 1024:
		return "#e2aa18", cInk
	case 2048:
		return "#ecb30c", cInk
	}
	return "#7c5fd4", "#ffffff"
}

func tileXY(r, c int) (int, int) {
	return tileGapX + c*(tileW+tileGapX), tileGapY + r*(tileH+tileGapY)
}

func drawTile(cv *canvas, x, y, w, h, v int) {
	bg, fg := tileColors(v)
	cv.fill(x, y, w, h, bg)
	cv.center(x, y+h/2, w, strconv.Itoa(v), fg, bg, true)
}

func (g *tilesGame) board() *canvas {
	const boardBg, slotBg = "#211f1c", "#2d2a26"
	cv := newCanvas(tilesW, tilesH)
	cv.fill(0, 0, tilesW, tilesH, boardBg)
	for r := 0; r < 4; r++ {
		for c := 0; c < 4; c++ {
			x, y := tileXY(r, c)
			cv.fill(x, y, tileW, tileH, slotBg)
		}
	}
	if g.frame >= 1 && g.frame <= slideFrames {
		// sliding: every tile from where it was toward where it goes, still showing its old value
		t := easeOut(float64(g.frame) / slideFrames)
		for _, s := range g.slides {
			fx, fy := tileXY(s.fromR, s.fromC)
			tx, ty := tileXY(s.toR, s.toC)
			x := int(math.Round(float64(fx) + float64(tx-fx)*t))
			y := int(math.Round(float64(fy) + float64(ty-fy)*t))
			drawTile(cv, x, y, tileW, tileH, s.v)
		}
		return cv
	}
	settle := 0 // 1 to settleFrames while the merged tiles swell and the new one grows
	if g.frame > slideFrames {
		settle = g.frame - slideFrames
	}
	for r := 0; r < 4; r++ {
		for c := 0; c < 4; c++ {
			v := g.grid[r][c]
			if v == 0 || settle > 0 && (pt{c, r}) == g.spawn {
				continue
			}
			x, y := tileXY(r, c)
			drawTile(cv, x, y, tileW, tileH, v)
		}
	}
	if settle > 0 {
		for _, p := range g.merged {
			if settle < settleFrames {
				x, y := tileXY(p.y, p.x)
				drawTile(cv, x-1, y, tileW+2, tileH, g.grid[p.y][p.x])
			}
		}
		if v := g.grid[g.spawn.y][g.spawn.x]; v > 0 {
			x, y := tileXY(g.spawn.y, g.spawn.x)
			switch settle {
			case 1:
				drawTile(cv, x+2, y+1, 3, 1, v)
			case 2:
				drawTile(cv, x+1, y, 5, tileH, v)
			default:
				drawTile(cv, x, y, tileW, tileH, v)
			}
		}
	}
	return cv
}

func (g *tilesGame) view(m *model) string {
	bw, bh := tilesW+2, tilesH+2
	if m.cw < bw || m.bodyH() < bh {
		return tooSmall(m, bw, bh)
	}
	c := newCanvas(bw, bh)
	c.frame(0, 0, bw, bh, cFaint, "", "2048", cText)
	inner := g.board()
	for y := 0; y < inner.h; y++ {
		for x := 0; x < inner.w; x++ {
			*c.at(x+1, y+1) = *inner.at(x, y)
		}
	}
	if g.frame == 0 {
		cx, cy := bw/2, bh/2
		switch {
		case g.over:
			ls := []cardLine{{"no moves left", cText, true}, {"", "", false}, {"score " + commas(g.score), cText, false}}
			if g.place > 0 {
				ls = append(ls, cardLine{fmt.Sprintf("a new best · #%d", g.place), cAccent, true})
			}
			ls = append(ls, cardLine{"", "", false}, cardLine{"enter to play again", cDim, false})
			c.card(cx, cy, ls)
		case g.won && !g.keep:
			c.card(cx, cy, []cardLine{{"you made 2048!", cGold, true}, {"", "", false}, {"enter to keep going", cDim, false}, {"n for a new game", cDim, false}})
		}
	}

	st := m.st
	score := st.bold.Render(commas(g.score))
	if g.gained > 0 && !g.over {
		score += st.accent.Render(fmt.Sprintf("  +%d", g.gained))
	}
	best := st.dim.Render("no best yet")
	if mine, place := m.arc.scores.Best("2048", m.name); place > 0 {
		best = st.dim.Render(fmt.Sprintf("your best %s · #%d", commas(max(mine.Value, g.score)), place))
	}
	biggest := 0
	for _, row := range g.grid {
		for _, v := range row {
			biggest = max(biggest, v)
		}
	}
	panel := []string{
		st.dim.Render("Score"),
		score,
		best,
		"",
		st.dim.Render("Biggest tile  ") + st.gold.Render(strconv.Itoa(biggest)),
		"",
		st.bold.Render("Best"),
	}
	panel = append(panel, m.scoreLines("2048", 5, m.cw-bw-4)...)
	panel = append(panel, "")
	panel = append(panel, m.keyHelp("↑↓←→", "slide", "n", "new game", "esc", "back")...)
	return m.withPanel(c.lines(m.ren), bw, panel)
}

func (g *tilesGame) status(m *model) (string, string, string) {
	return "2048", "↑↓←→ wasd slide   n new game   esc back", m.st.barDim.Render("score " + commas(g.score))
}

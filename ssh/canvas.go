package main

import (
	"strings"

	"github.com/charmbracelet/lipgloss"
)

// canvas is a grid of character cells, each with its own colours, that the games draw onto and then
// turn into styled lines. Drawing into cells instead of gluing styled strings together lets things
// overlap: a tile sliding across the board, a box over the snake, a piece crossing the squares.
type canvas struct {
	w, h  int
	cells []cell
}

type cell struct {
	r      rune
	fg, bg string // hex colours, "" for the terminal's own
	bold   bool
}

func newCanvas(w, h int) *canvas {
	c := &canvas{w: w, h: h, cells: make([]cell, w*h)}
	for i := range c.cells {
		c.cells[i].r = ' '
	}
	return c
}

func (c *canvas) at(x, y int) *cell {
	if x < 0 || y < 0 || x >= c.w || y >= c.h {
		return nil
	}
	return &c.cells[y*c.w+x]
}

// put writes s from (x, y) rightwards in fg. Each cell keeps its background unless bg is given.
func (c *canvas) put(x, y int, s, fg, bg string, bold bool) {
	for _, r := range s {
		if p := c.at(x, y); p != nil {
			p.r, p.fg, p.bold = r, fg, bold
			if bg != "" {
				p.bg = bg
			}
		}
		x++
	}
}

// fill clears a rectangle to bg.
func (c *canvas) fill(x, y, w, h int, bg string) {
	for j := y; j < y+h; j++ {
		for i := x; i < x+w; i++ {
			if p := c.at(i, j); p != nil {
				*p = cell{r: ' ', bg: bg}
			}
		}
	}
}

// center writes s centred on row y of the span [x, x+w).
func (c *canvas) center(x, y, w int, s, fg, bg string, bold bool) {
	c.put(x+(w-len([]rune(s)))/2, y, s, fg, bg, bold)
}

// frame draws a rounded border around [x, x+w) × [y, y+h) in fg, with an optional title set into its
// top edge, and clears the inside to bg.
func (c *canvas) frame(x, y, w, h int, fg, bg, title, titleFg string) {
	c.fill(x+1, y+1, w-2, h-2, bg)
	c.put(x, y, "╭"+strings.Repeat("─", w-2)+"╮", fg, bg, false)
	for j := y + 1; j < y+h-1; j++ {
		c.put(x, j, "│", fg, bg, false)
		c.put(x+w-1, j, "│", fg, bg, false)
	}
	c.put(x, y+h-1, "╰"+strings.Repeat("─", w-2)+"╯", fg, bg, false)
	if title != "" {
		c.put(x+2, y, " "+title+" ", titleFg, bg, true)
	}
}

// lines turns the cells into styled lines, one style for each run of cells that look the same.
func (c *canvas) lines(r *lipgloss.Renderer) []string {
	out := make([]string, c.h)
	run := make([]rune, 0, c.w)
	for y := 0; y < c.h; y++ {
		var b strings.Builder
		row := c.cells[y*c.w : (y+1)*c.w]
		for i := 0; i < len(row); {
			run = run[:0]
			j := i
			for j < len(row) && row[j].fg == row[i].fg && row[j].bg == row[i].bg && row[j].bold == row[i].bold {
				run = append(run, row[j].r)
				j++
			}
			b.WriteString(cellStyle(r, row[i]).Render(string(run)))
			i = j
		}
		out[y] = b.String()
	}
	return out
}

func cellStyle(r *lipgloss.Renderer, c cell) lipgloss.Style {
	s := r.NewStyle()
	if c.fg != "" {
		s = s.Foreground(lipgloss.Color(c.fg))
	}
	if c.bg != "" {
		s = s.Background(lipgloss.Color(c.bg))
	}
	if c.bold {
		s = s.Bold(true)
	}
	return s
}

// The games' own colours. The app assumes a dark terminal (sessionRenderer), so these are tuned for one.
const (
	cInk    = "#101114"
	cText   = "#e8e4dc"
	cDim    = "#7c786f"
	cFaint  = "#4a4741"
	cAccent = "#e9a35b"
	cGreen  = "#9fcb98"
	cBlue   = "#8ab4d8"
	cGold   = "#e6c36a"
	cRed    = "#e07a6a"
	cBoard  = "#17181c"
	cBoard2 = "#1c1d22"
	cPanel  = "#1d1f24"
)

// lerpHex mixes two #rrggbb colours, t from 0 (a) to 1 (b).
func lerpHex(a, b string, t float64) string {
	ch := func(s string, i int) float64 {
		var v int
		for _, r := range s[1+i*2 : 3+i*2] {
			v *= 16
			switch {
			case r >= '0' && r <= '9':
				v += int(r - '0')
			case r >= 'a' && r <= 'f':
				v += int(r-'a') + 10
			case r >= 'A' && r <= 'F':
				v += int(r-'A') + 10
			}
		}
		return float64(v)
	}
	t = max(0, min(1, t))
	hex := "0123456789abcdef"
	out := []byte{'#'}
	for i := 0; i < 3; i++ {
		v := int(ch(a, i) + (ch(b, i)-ch(a, i))*t + .5)
		out = append(out, hex[v/16], hex[v%16])
	}
	return string(out)
}

// easeOut is a cubic ease: quick to leave, gentle to arrive.
func easeOut(t float64) float64 {
	t = max(0, min(1, t))
	return 1 - (1-t)*(1-t)*(1-t)
}

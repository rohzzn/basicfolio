package main

import (
	"fmt"
	"html"
	"io"
	"os"
	"regexp"
	"strconv"
	"strings"
	"testing"
	"time"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	"github.com/muesli/termenv"
)

// TestColorPreview draws the Arcade's screens in full colour into an HTML page, the quickest way to
// see the games as a terminal would show them without a terminal:
//
//	COLOR_PREVIEW=arcade.html OFFLINE=1 go test -run TestColorPreview
func TestColorPreview(t *testing.T) {
	out := os.Getenv("COLOR_PREVIEW")
	if out == "" {
		t.Skip("COLOR_PREVIEW is not set")
	}
	if err := loadSite(); err != nil {
		t.Fatal(err)
	}
	live := NewLive("https://www.rohan.run")
	arc := NewArcade("")
	arc.scores.Add("snake", Score{Name: "alex", Value: 23})
	arc.scores.Add("snake", Score{Name: "tester", Value: 17})
	arc.scores.Add("2048", Score{Name: "sam", Value: 5120})
	arc.scores.Add("chess", Score{Name: "alex", Value: 1966, Note: "medium in 34"})
	arc.scores.Add("race", Score{Name: "jo", Value: 92, Note: "97%"})

	r := lipgloss.NewRenderer(io.Discard)
	r.SetColorProfile(termenv.TrueColor)
	r.SetHasDarkBackground(true)
	m := newModelWith(r, live, arc, io.Discard, 100, 30)
	m.name = "tester"
	key := func(ks ...string) {
		for _, k := range ks {
			switch k {
			case "enter":
				m.Update(tea.KeyMsg{Type: tea.KeyEnter})
			case "esc":
				m.Update(tea.KeyMsg{Type: tea.KeyEsc})
			default:
				for _, r := range k {
					m.Update(tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{r}})
				}
			}
		}
	}
	var page strings.Builder
	n := 0
	shot := func(name string) {
		frame := fmt.Sprintf("<h2>%s</h2><pre>%s</pre>\n", html.EscapeString(name), ansiHTML(m.View()))
		page.WriteString(frame)
		n++
		_ = os.WriteFile(fmt.Sprintf("%s-%02d.html", strings.TrimSuffix(out, ".html"), n), []byte(previewHead+frame), 0o644)
	}

	key("x", "6")
	shot("Arcade")

	key("enter")
	sg := m.game.(*snakeGame)
	sg.body = []pt{{14, 6}, {13, 6}, {12, 6}, {11, 6}, {11, 7}, {11, 8}, {12, 8}, {13, 8}, {14, 8}, {15, 8}, {16, 8}}
	sg.food, sg.score, sg.state = pt{18, 4}, 7, snakeRunning
	shot("Snake")
	sg.state, sg.flash = snakeDying, 3
	shot("Snake, the flash as it dies")
	sg.state, sg.newBest, sg.place = snakeOver, true, 2
	shot("Snake, game over")
	key("esc", "s", "enter")

	tg := m.game.(*tilesGame)
	tg.grid = [4][4]int{{2, 4, 8, 16}, {32, 64, 128, 256}, {512, 1024, 2048, 0}, {0, 2, 2, 4}}
	tg.score, tg.keep = 21480, true
	tg.slides, tg.frame = nil, 0
	shot("2048, every tile")
	key("a")
	tg.frame = 3
	shot("2048, mid-slide")
	tg.frame = slideFrames + 1
	shot("2048, settling: the merge swells, the new tile grows")
	tg.frame = 0
	key("esc", "s", "enter")

	cg := m.game.(*chessGame)
	shot("Chess, setup")
	key("enter")
	cg.pos = fromFEN("r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq -")
	cg.sans = []string{"e4", "e5", "Bc4", "Nc6", "Qh5", "Nf6"}
	cg.played = []cmove{{12, 28, 0}, {52, 36, 0}, {5, 26, 0}, {57, 42, 0}, {3, 39, 0}, {62, 45, 0}}
	cg.before = make([]chessPos, 6)
	cg.cur = 39
	key("enter")
	shot("Chess, the queen picked up: where it can go, and the capture on f7")
	cg.cur = 53
	key("enter")
	cg.anim.frame = 0
	shot("Chess, Qxf7#")
	m.Update(tea.WindowSizeMsg{Width: 80, Height: 24})
	shot("Chess, the two-line board in an 80 × 24 window")
	m.Update(tea.WindowSizeMsg{Width: 100, Height: 30})
	key("esc", "s", "enter")

	rg := m.game.(*raceGame)
	shot("Typing race, waiting")
	rg.race.start = time.Now().Add(-9 * time.Second)
	rg.look = arc.races.Look(rg.race)
	key(string(rg.look.text[:58]), "xq")
	rg.look = arc.races.Look(rg.race)
	shot("Typing race, a mistake to fix")

	doc := previewHead + page.String()
	if err := os.WriteFile(out, []byte(doc), 0o644); err != nil {
		t.Fatal(err)
	}
}

const previewHead = `<!doctype html><meta charset="utf-8"><title>Arcade preview</title><style>
body{background:#0e0f12;color:#d8d4cc;font:15px/1.0 "Cascadia Mono",Consolas,Menlo,monospace;padding:16px;margin:0}
pre{font:inherit;line-height:1.0;margin:0 0 36px;padding:12px;background:#101114;display:inline-block}
h2{font:600 13px system-ui;color:#999;margin:0 0 8px}
</style>`

var sgrRe = regexp.MustCompile(`\x1b\[([0-9;]*)m|\x1b\]8;[^\x07\x1b]*(\x07|\x1b\\)`)

// ansiHTML turns the colour codes lipgloss writes into spans.
func ansiHTML(s string) string {
	var b strings.Builder
	fg, bg, bold := "", "", false
	open := false
	flush := func(text string) {
		if text == "" {
			return
		}
		if open {
			b.WriteString("</span>")
			open = false
		}
		style := ""
		if fg != "" {
			style += "color:" + fg + ";"
		}
		if bg != "" {
			style += "background:" + bg + ";"
		}
		if bold {
			style += "font-weight:bold;"
		}
		if style != "" {
			b.WriteString(`<span style="` + style + `">`)
			open = true
		}
		// one cell a character, as a terminal draws them, whatever width the browser's font gives it
		for _, r := range text {
			if r < 128 {
				b.WriteString(html.EscapeString(string(r)))
			} else {
				b.WriteString(`<i style="display:inline-block;width:1ch;font-style:normal;overflow:visible;text-align:center">` + string(r) + `</i>`)
			}
		}
	}
	last := 0
	for _, loc := range sgrRe.FindAllStringSubmatchIndex(s, -1) {
		flush(s[last:loc[0]])
		last = loc[1]
		if loc[2] < 0 {
			continue // a hyperlink
		}
		parts := strings.Split(s[loc[2]:loc[3]], ";")
		for i := 0; i < len(parts); i++ {
			n, _ := strconv.Atoi(parts[i])
			switch {
			case parts[i] == "" || n == 0:
				fg, bg, bold = "", "", false
			case n == 1:
				bold = true
			case n == 22:
				bold = false
			case n == 39:
				fg = ""
			case n == 49:
				bg = ""
			case (n == 38 || n == 48) && i+4 < len(parts) && parts[i+1] == "2":
				c := fmt.Sprintf("rgb(%s,%s,%s)", parts[i+2], parts[i+3], parts[i+4])
				if n == 38 {
					fg = c
				} else {
					bg = c
				}
				i += 4
			}
		}
	}
	flush(s[last:])
	if open {
		b.WriteString("</span>")
	}
	return b.String()
}

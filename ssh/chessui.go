package main

import (
	"fmt"
	"math"
	"math/rand/v2"
	"strings"
	"time"

	tea "github.com/charmbracelet/bubbletea"
)

// Chess against the Mac. The board is drawn square: five characters by two lines a square, or seven
// by three in a tall window. In the two-line board each square's colour starts half a line down, in
// half blocks, so the piece sits on the square's middle line. Moves slide; the Mac thinks in the
// background and always takes at least half a second, so its reply never lands as a jump cut.

type chessStage int

const (
	chessSetup chessStage = iota
	chessPlaying
	chessOver
)

var levelNames = [3]string{"easy", "medium", "hard"}
var sideNames = [3]string{"white", "black", "either"}

const chessAnimFrames = 7

type chessGame struct {
	stage chessStage
	level int
	side  int  // the setup's choice: white, black or either
	opt   int  // the setup's chosen row
	white bool // the visitor plays white

	pos    chessPos
	before []chessPos // the position before each move, for undo
	played []cmove
	sans   []string
	seen   map[string]int // how often each position has come up, for threefold repetition
	cur    int8           // the cursor's square
	sel    int8           // the picked-up piece's square, -1 if none
	moves  []cmove        // where the picked-up piece can go
	promo  *cmove         // a pawn move waiting to be told what the pawn becomes
	pick   int            // which piece the promotion prompt is on

	thinking bool
	think    int // which request the Mac's answer has to belong to
	seq      int
	anim     chessAnim
	result   string
	won      bool
	place    int
	rng      *rand.Rand
}

type chessAnim struct {
	pc       int8 // the piece moving
	under    int8 // what it is taking, still shown until it lands
	from, to int8
	frame    int // 0 when nothing is moving
}

// chessThought is the Mac's move, from a goroutine.
type chessThought struct {
	gen, think int
	mv         cmove
}

func (c chessThought) owner() int { return c.gen }

func newChess() *chessGame {
	g := &chessGame{level: 1, opt: 2, sel: -1, rng: rand.New(rand.NewPCG(uint64(time.Now().UnixNano()), 3))}
	g.pos = startPos()
	g.white = true
	g.cur = 12
	return g
}

func (g *chessGame) start(m *model) tea.Cmd {
	g.white = g.side == 0 || g.side == 2 && g.rng.IntN(2) == 0
	g.pos, g.before, g.played, g.sans = startPos(), nil, nil, nil
	g.seen = map[string]int{g.pos.key(): 1}
	g.sel, g.moves, g.promo, g.result, g.won, g.place = -1, nil, nil, "", false, 0
	g.anim = chessAnim{}
	g.thinking = false
	g.think++
	g.cur = 12
	if !g.white {
		g.cur = 52
	}
	g.stage = chessPlaying
	if !g.white {
		return tea.Batch(g.ask(m), g.loop(m, 100*time.Millisecond))
	}
	return nil
}

// yours says whether the piece on s is the visitor's.
func (g *chessGame) yours(s int8) bool {
	v := g.pos.sq[s]
	return v != 0 && (v > 0) == g.white
}

func (g *chessGame) yourTurn() bool {
	return g.stage == chessPlaying && g.pos.white == g.white && !g.thinking
}

// ask sets the Mac thinking about the position in a goroutine.
func (g *chessGame) ask(m *model) tea.Cmd {
	g.thinking = true
	g.think++
	pos, level, gen, id, seed := g.pos, g.level, m.gameGen, g.think, g.rng.Uint64()
	return func() tea.Msg {
		began := time.Now()
		mv := bestMove(pos, level, rand.New(rand.NewPCG(seed, 4)))
		if wait := 500*time.Millisecond - time.Since(began); wait > 0 {
			time.Sleep(wait)
		}
		return chessThought{gen, id, mv}
	}
}

// loop (re)starts the clock that slides pieces and turns the thinking spinner.
func (g *chessGame) loop(m *model, d time.Duration) tea.Cmd {
	g.seq++
	return m.frameIn(d, g.seq)
}

func (g *chessGame) apply(m *model, mv cmove) {
	g.anim = chessAnim{pc: g.pos.sq[mv.from], under: g.pos.sq[mv.to], from: mv.from, to: mv.to, frame: 1}
	g.sans = append(g.sans, g.pos.san(mv))
	g.before = append(g.before, g.pos)
	g.played = append(g.played, mv)
	g.pos = g.pos.play(mv)
	g.seen[g.pos.key()]++
	g.sel, g.moves = -1, nil

	over := ""
	switch {
	case len(g.pos.legal(false)) == 0 && g.pos.inCheck():
		g.won = g.pos.white != g.white
		over = "checkmate · the Mac wins"
		if g.won {
			over = "checkmate · you win"
		}
	case len(g.pos.legal(false)) == 0:
		over = "stalemate · a draw"
	case g.pos.half >= 100:
		over = "fifty moves without a capture · a draw"
	case g.seen[g.pos.key()] >= 3:
		over = "the same position three times · a draw"
	case g.pos.insufficient():
		over = "nobody can mate · a draw"
	}
	if over == "" {
		return
	}
	g.stage, g.result, g.thinking = chessOver, over, false
	if g.won {
		moves := (len(g.played) + 1) / 2
		g.place = m.arc.scores.Add("chess", Score{
			Name:  m.name,
			Value: (g.level+1)*1000 - moves,
			Note:  fmt.Sprintf("%s in %d", levelNames[g.level], moves),
			At:    time.Now(),
		})
	}
}

// undo takes back the visitor's last move, and the Mac's reply to it.
func (g *chessGame) undo() {
	for len(g.before) > 0 {
		g.seen[g.pos.key()]--
		n := len(g.before) - 1
		g.pos, g.before, g.played, g.sans = g.before[n], g.before[:n], g.played[:n], g.sans[:n]
		if g.pos.white == g.white {
			break
		}
	}
	g.anim, g.sel, g.moves, g.promo = chessAnim{}, -1, nil, nil
	g.stage, g.result, g.won = chessPlaying, "", false
}

// choose is enter or a click on square s: pick a piece up, put it down, or swap to another one.
func (g *chessGame) choose(m *model, s int8) tea.Cmd {
	if !g.yourTurn() {
		return nil
	}
	if g.sel >= 0 {
		for _, mv := range g.moves {
			if mv.to != s {
				continue
			}
			if mv.promo != 0 {
				g.promo, g.pick = &cmove{mv.from, mv.to, queen}, 0
				return nil
			}
			return g.move(m, mv)
		}
	}
	was := g.sel
	g.sel, g.moves = -1, nil
	if g.yours(s) && s != was { // choosing the piece already picked up puts it back down
		for _, mv := range g.pos.legal(false) {
			if mv.from == s {
				g.moves = append(g.moves, mv)
			}
		}
		if len(g.moves) > 0 {
			g.sel = s
		}
	}
	return nil
}

func (g *chessGame) move(m *model, mv cmove) tea.Cmd {
	g.promo = nil
	g.apply(m, mv)
	if g.stage != chessPlaying {
		return g.loop(m, 16*time.Millisecond)
	}
	return tea.Batch(g.ask(m), g.loop(m, 16*time.Millisecond))
}

func (g *chessGame) enter(m *model) tea.Cmd {
	g.anim.frame = 0
	if g.stage == chessPlaying && g.pos.white != g.white {
		return tea.Batch(g.ask(m), g.loop(m, 100*time.Millisecond)) // the answer it was working on was dropped
	}
	return nil
}

func (g *chessGame) leave(m *model) { g.thinking = false }

var promoPieces = [4]int8{queen, rook, bishop, knight}

func (g *chessGame) update(m *model, msg tea.Msg) tea.Cmd {
	switch msg := msg.(type) {
	case chessThought:
		if msg.think != g.think || g.stage != chessPlaying {
			return nil
		}
		g.thinking = false
		if msg.mv == noMove {
			return nil
		}
		g.apply(m, msg.mv)
		return g.loop(m, 16*time.Millisecond)

	case frameMsg:
		if msg.seq != g.seq {
			return nil
		}
		if g.anim.frame > 0 {
			if g.anim.frame++; g.anim.frame > chessAnimFrames {
				g.anim.frame = 0
			}
		}
		switch {
		case g.anim.frame > 0:
			return m.frameIn(16*time.Millisecond, g.seq)
		case g.thinking:
			return m.frameIn(100*time.Millisecond, g.seq)
		}

	case tea.MouseMsg:
		if msg.Action != tea.MouseActionPress || msg.Button != tea.MouseButtonLeft || g.stage != chessPlaying || g.promo != nil {
			return nil
		}
		if s := g.geo(m).at(msg.X, msg.Y); s >= 0 {
			g.cur = s
			return g.choose(m, s)
		}

	case tea.KeyMsg:
		k := msg.String()
		if g.promo != nil {
			switch wasd(k) {
			case "left":
				g.pick = (g.pick + 3) % 4
			case "right":
				g.pick = (g.pick + 1) % 4
			case "q", "r", "b", "n":
				g.pick = strings.Index("qrbn", k)
				fallthrough
			case "enter", " ":
				mv := *g.promo
				mv.promo = promoPieces[g.pick]
				return g.move(m, mv)
			case "esc":
				g.promo = nil
			}
			return nil
		}
		switch g.stage {
		case chessSetup:
			switch wasd(k) {
			case "up":
				g.opt = (g.opt + 2) % 3
			case "down":
				g.opt = (g.opt + 1) % 3
			case "left", "right":
				d := 1
				if wasd(k) == "left" {
					d = 2
				}
				switch g.opt {
				case 0:
					g.level = (g.level + d) % 3
				case 1:
					g.side = (g.side + d) % 3
				}
			case "enter", " ":
				return g.start(m)
			case "esc", "q":
				m.closeGame()
			}
			return nil
		case chessOver:
			switch k {
			case "enter", "n":
				g.stage = chessSetup
			case "u":
				g.undo()
			case "esc", "q":
				m.closeGame()
			}
			return nil
		}
		switch k {
		case "enter", " ":
			return g.choose(m, g.cur)
		case "u":
			if !g.thinking && len(g.before) > 0 {
				g.undo()
				if g.pos.white != g.white { // only the Mac's opening move was left
					return tea.Batch(g.ask(m), g.loop(m, 100*time.Millisecond))
				}
			}
		case "n":
			g.stage, g.thinking = chessSetup, false
			g.think++
		case "esc", "q":
			if g.sel >= 0 {
				g.sel, g.moves = -1, nil
			} else {
				m.closeGame()
			}
		default:
			if d, ok := snakeDirs[wasd(k)]; ok {
				geo := g.geo(m)
				vr, vc := geo.vis(g.cur)
				vr, vc = min(7, max(0, vr+d.y)), min(7, max(0, vc+d.x))
				g.cur = geo.square(vr, vc)
			}
		}
	}
	return nil
}

// ── drawing ──

type chessGeo struct {
	sw, sh int  // a square's width and height
	x0     int  // where the squares start, after the rank numbers
	rows   int  // the board's height in lines
	flip   bool // black at the bottom
}

func (g *chessGame) geo(m *model) chessGeo {
	geo := chessGeo{sw: 5, sh: 2, x0: 2, rows: 17, flip: !g.white}
	if g.stage == chessSetup {
		geo.flip = g.side == 1
	}
	if m.bodyH() >= 26 && m.cw >= 2+8*7+4+28 {
		geo.sw, geo.sh, geo.rows = 7, 3, 24
	}
	return geo
}

// square is the square drawn at visual row vr (0 at the top) and column vc (0 at the left).
func (geo chessGeo) square(vr, vc int) int8 {
	if geo.flip {
		return int8(vr*8 + 7 - vc)
	}
	return int8((7-vr)*8 + vc)
}

func (geo chessGeo) vis(s int8) (vr, vc int) {
	f, r := int(fileOf(s)), int(rankOf(s))
	if geo.flip {
		return r, 7 - f
	}
	return 7 - r, f
}

// pieceY is the line a piece on visual row vr is drawn on: the middle of its square.
func (geo chessGeo) pieceY(vr int) int { return vr*geo.sh + geo.sh/2 }

func (geo chessGeo) at(x, y int) int8 {
	if x < geo.x0 || x >= geo.x0+8*geo.sw || y < 0 || y >= geo.rows {
		return -1
	}
	return geo.square(min(7, y/geo.sh), (x-geo.x0)/geo.sw)
}

const pieceGlyphs = " ♟♞♝♜♛♚"

func glyph(v int8) string { return string([]rune(pieceGlyphs)[abs8(v)]) }

func pieceFg(v int8) string {
	if v > 0 {
		return "#fffaf2"
	}
	return "#15100b"
}

// squareBg is a square's colour: the board's own, tinted for the last move, a capture on offer, a
// king in check, the piece picked up, and the cursor, in rising order.
func (g *chessGame) squareBg(s int8) string {
	light := (fileOf(s)+rankOf(s))%2 == 1
	pick := func(l, d string) string {
		if light {
			return l
		}
		return d
	}
	bg := pick("#b4966f", "#73583e")
	if n := len(g.played); n > 0 && g.anim.frame == 0 && (g.played[n-1].from == s || g.played[n-1].to == s) {
		bg = pick("#cdb25c", "#a68c3c")
	}
	if g.sel >= 0 {
		for _, mv := range g.moves {
			if mv.to == s && (g.pos.sq[s] != 0 || abs8(g.pos.sq[mv.from]) == pawn && s == g.pos.ep) {
				bg = pick("#c27a5c", "#9b5a40")
			}
		}
	}
	if g.stage != chessSetup && g.pos.inCheck() && s == g.pos.kings[g.pos.side()] {
		bg = "#c6463a"
	}
	if s == g.sel {
		bg = pick("#d9aa5e", "#b98a42")
	}
	if s == g.cur && g.stage == chessPlaying {
		bg = pick("#a4bfd9", "#7d9ab8")
	}
	return bg
}

func (g *chessGame) board(m *model) *canvas {
	geo := g.geo(m)
	cv := newCanvas(geo.x0+8*geo.sw, geo.rows+1)
	for vr := 0; vr < 8; vr++ {
		for vc := 0; vc < 8; vc++ {
			s := geo.square(vr, vc)
			bg := g.squareBg(s)
			x := geo.x0 + vc*geo.sw
			if geo.sh == 3 {
				cv.fill(x, vr*3, geo.sw, 3, bg)
				continue
			}
			cv.fill(x, vr*2+1, geo.sw, 1, bg)
			if vr == 0 {
				cv.put(x, 0, strings.Repeat("▄", geo.sw), bg, "", false)
			} else {
				cv.put(x, vr*2, strings.Repeat("▀", geo.sw), g.squareBg(geo.square(vr-1, vc)), bg, false)
			}
			if vr == 7 {
				cv.put(x, 16, strings.Repeat("▀", geo.sw), bg, "", false)
			}
		}
		rank := geo.square(vr, 0)
		cv.put(0, geo.pieceY(vr), string(rune('1'+rankOf(rank))), cDim, "", false)
	}
	for vc := 0; vc < 8; vc++ {
		cv.put(geo.x0+vc*geo.sw+geo.sw/2, geo.rows, string(rune('a'+fileOf(geo.square(0, vc)))), cDim, "", false)
	}

	moving := g.anim.frame > 0
	for s := int8(0); s < 64; s++ {
		vr, vc := geo.vis(s)
		x, y := geo.x0+vc*geo.sw+geo.sw/2, geo.pieceY(vr)
		v := g.pos.sq[s]
		if moving && s == g.anim.to {
			v = g.anim.under
		}
		if v != 0 {
			cv.put(x, y, glyph(v), pieceFg(v), "", true)
			continue
		}
		if g.sel >= 0 {
			for _, mv := range g.moves {
				if mv.to == s {
					dot := "#5c4731"
					if (fileOf(s)+rankOf(s))%2 == 0 {
						dot = "#3f2f20"
					}
					cv.put(x, y, "•", dot, "", false)
					break
				}
			}
		}
	}
	if moving {
		t := easeOut(float64(g.anim.frame) / chessAnimFrames)
		fr, fc := geo.vis(g.anim.from)
		tr, tc := geo.vis(g.anim.to)
		fx, fy := float64(geo.x0+fc*geo.sw+geo.sw/2), float64(geo.pieceY(fr))
		tx, ty := float64(geo.x0+tc*geo.sw+geo.sw/2), float64(geo.pieceY(tr))
		x, y := int(math.Round(fx+(tx-fx)*t)), int(math.Round(fy+(ty-fy)*t))
		cv.put(x, y, glyph(g.anim.pc), pieceFg(g.anim.pc), "", true)
	}
	if g.promo != nil {
		var row []string
		for i, p := range promoPieces {
			gl := glyph(p)
			if i == g.pick {
				gl = "[" + gl + "]"
			} else {
				gl = " " + gl + " "
			}
			row = append(row, gl)
		}
		cv.card(cv.w/2+1, geo.rows/2, []cardLine{{"promote to", cText, true}, {strings.Join(row, " "), cText, true}, {"←→ and enter", cDim, false}})
	}
	return cv
}

func (g *chessGame) view(m *model) string {
	geo := g.geo(m)
	bw := geo.x0 + 8*geo.sw
	if m.cw < bw || m.bodyH() < geo.rows+1 {
		return tooSmall(m, bw, geo.rows+1)
	}
	st := m.st
	var panel []string
	add := func(ls ...string) { panel = append(panel, ls...) }
	pw := m.cw - bw - 4

	if g.stage == chessSetup {
		add(st.bold.Render("Chess")+st.dim.Render("  ·  against the Mac"), "")
		opts := []string{"Level", "Side", ""}
		vals := []string{levelNames[g.level], sideNames[g.side], ""}
		for i := range opts {
			label := "  " + fit(opts[i], 8)
			val := "‹ " + fit(vals[i], 6) + " ›"
			if i == 2 {
				label, val = "  Start", ""
			}
			if i == g.opt {
				add(m.selRow(label+"  "+val, "", min(pw, 30)))
			} else {
				add(label + "  " + st.dim.Render(val))
			}
		}
		add("")
		about := [3]string{
			"Easy looks one move ahead and picks among the ones that look about as good, so it gives things away.",
			"Medium looks three moves ahead.",
			"Hard looks as far as it can in a second and a half a move.",
		}
		add(lines(st.dim, about[g.level], pw)...)
		add("", st.bold.Render("Beaten it"))
		add(m.scoreLines("chess", 4, pw)...)
		return m.withPanel(g.board(m).lines(m.ren), bw, panel)
	}

	you, mac := "white", "black"
	if !g.white {
		you, mac = mac, you
	}
	turn := func(white bool) string {
		if g.stage == chessPlaying && g.pos.white == white {
			return st.accent.Render("●")
		}
		return st.faint.Render("○")
	}
	thinking := ""
	if g.thinking {
		spin := []rune("⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏")
		thinking = st.dim.Render("  thinking ") + st.accent.Render(string(spin[time.Now().UnixMilli()/100%int64(len(spin))]))
	}
	add(st.bold.Render("Chess")+st.dim.Render("  ·  "+levelNames[g.level]), "")
	add(turn(g.white)+" You      "+st.dim.Render(you))
	add(turn(!g.white)+" The Mac  "+st.dim.Render(mac)+thinking)
	add("")

	// the move list, as much of the end of it as fits
	var rows []string
	for i := 0; i < len(g.sans); i += 2 {
		w := g.sans[i]
		b := ""
		if i+1 < len(g.sans) {
			b = g.sans[i+1]
		}
		row := st.dim.Render(fmt.Sprintf("%3d  ", i/2+1)) + fit(w, 8) + b
		if i+2 >= len(g.sans) {
			row = st.dim.Render(fmt.Sprintf("%3d  ", i/2+1)) + fit(w, 8) + st.accent.Render(b)
			if b == "" {
				row = st.dim.Render(fmt.Sprintf("%3d  ", i/2+1)) + st.accent.Render(w)
			}
		}
		rows = append(rows, row)
	}
	room := geo.rows + 1 - len(panel) - 6
	if len(rows) == 0 {
		rows = []string{st.dim.Render("  no moves yet")}
	}
	add(st.bold.Render("Moves"))
	add(rows[max(0, len(rows)-room):]...)
	add("")

	taken := g.taken(g.white)
	if taken != "" {
		add(st.dim.Render("Taken  ") + taken)
	}

	var line string
	switch {
	case g.stage == chessOver:
		col := st.dim
		if g.won {
			col = st.sel
		}
		line = col.Render(g.result)
		if g.place > 0 {
			line += st.dim.Render(fmt.Sprintf(" · #%d", g.place))
		}
	case g.promo != nil:
		line = st.accent.Render("pick what your pawn becomes")
	case g.thinking:
		line = st.dim.Render("the Mac is thinking")
	case g.pos.inCheck():
		line = st.red.Render("check! ") + st.dim.Render("your move")
	default:
		line = st.text.Render("your move")
	}
	for len(panel) < geo.rows-1 {
		add("")
	}
	add(line)
	return m.withPanel(g.board(m).lines(m.ren), bw, panel)
}

// taken is the pieces the given side has captured, as glyphs, worked out from what is missing.
func (g *chessGame) taken(byWhite bool) string {
	start := [7]int{0, 8, 2, 2, 2, 1, 1}
	var left [7]int
	for _, v := range g.pos.sq {
		if v != 0 && (v > 0) != byWhite {
			left[abs8(v)]++
		}
	}
	var b strings.Builder
	for _, k := range []int8{queen, rook, bishop, knight, pawn} {
		for i := left[k]; i < start[k]; i++ {
			b.WriteString(glyph(k))
		}
	}
	return b.String()
}

func (g *chessGame) status(m *model) (string, string, string) {
	right := m.st.barDim.Render(levelNames[g.level])
	switch {
	case g.stage == chessSetup:
		return "CHESS", "↑↓ ws choose   ←→ ad change   enter start   esc back", right
	case g.promo != nil:
		return "CHESS", "←→ choose   enter promote   esc cancel", right
	case g.stage == chessOver:
		return "CHESS", "enter new game   u take back   esc back", right
	}
	return "CHESS", "↑↓←→ wasd move   enter pick up / put down   u undo   n new   esc back", right
}

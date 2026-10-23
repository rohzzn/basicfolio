package main

import (
	"math/rand/v2"
	"strings"
	"time"
)

// The chess rules and the Mac's player. Squares run a1 = 0 to h8 = 63; pieces are 1 to 6 (pawn,
// knight, bishop, rook, queen, king), positive for white and negative for black. Positions are small
// values, so a move makes a new one rather than undoing anything.

const (
	pawn int8 = iota + 1
	knight
	bishop
	rook
	queen
	king
)

type chessPos struct {
	sq     [64]int8
	white  bool    // white to move
	castle uint8   // 1 white short, 2 white long, 4 black short, 8 black long
	ep     int8    // the square a pawn could be taken on en passant, -1 if none
	kings  [2]int8 // where the white and the black king are
	half   int     // half-moves since a capture or a pawn move, for the fifty-move rule
	full   int     // the move number
}

type cmove struct{ from, to, promo int8 }

var noMove = cmove{-1, -1, 0}

func fileOf(s int8) int8 { return s & 7 }
func rankOf(s int8) int8 { return s >> 3 }

func abs8(v int8) int8 {
	if v < 0 {
		return -v
	}
	return v
}

var (
	knightTo, kingTo [64][]int8
	rays             [64][8][]int8 // 0 to 3 run like a rook, 4 to 7 like a bishop
	castleLoss       [64]uint8     // the rights gone once a piece leaves or lands on the square
)

func init() {
	steps := func(s int8, d [][2]int8) []int8 {
		var out []int8
		for _, v := range d {
			f, r := fileOf(s)+v[0], rankOf(s)+v[1]
			if f >= 0 && f < 8 && r >= 0 && r < 8 {
				out = append(out, r*8+f)
			}
		}
		return out
	}
	dirs := [8][2]int8{{0, 1}, {0, -1}, {1, 0}, {-1, 0}, {1, 1}, {1, -1}, {-1, 1}, {-1, -1}}
	for s := int8(0); s < 64; s++ {
		knightTo[s] = steps(s, [][2]int8{{1, 2}, {2, 1}, {2, -1}, {1, -2}, {-1, -2}, {-2, -1}, {-2, 1}, {-1, 2}})
		kingTo[s] = steps(s, dirs[:])
		for d, v := range dirs {
			for f, r := fileOf(s)+v[0], rankOf(s)+v[1]; f >= 0 && f < 8 && r >= 0 && r < 8; f, r = f+v[0], r+v[1] {
				rays[s][d] = append(rays[s][d], r*8+f)
			}
		}
	}
	castleLoss[4], castleLoss[7], castleLoss[0] = 3, 1, 2
	castleLoss[60], castleLoss[63], castleLoss[56] = 12, 4, 8
}

func startPos() chessPos {
	p := chessPos{white: true, castle: 15, ep: -1, kings: [2]int8{4, 60}, full: 1}
	back := [8]int8{rook, knight, bishop, queen, king, bishop, knight, rook}
	for f := 0; f < 8; f++ {
		p.sq[f], p.sq[8+f] = back[f], pawn
		p.sq[56+f], p.sq[48+f] = -back[f], -pawn
	}
	return p
}

// fromFEN reads the first four fields of a FEN string. For tests and positions worth starting from.
func fromFEN(fen string) chessPos {
	p := chessPos{ep: -1, full: 1}
	f := strings.Fields(fen)
	r, c := int8(7), int8(0)
	for _, ch := range f[0] {
		switch {
		case ch == '/':
			r, c = r-1, 0
		case ch >= '1' && ch <= '8':
			c += int8(ch - '0')
		default:
			v := int8(strings.IndexRune("pnbrqk", ch|32) + 1)
			if ch < 'a' {
				p.sq[r*8+c] = v
				if v == king {
					p.kings[0] = r*8 + c
				}
			} else {
				p.sq[r*8+c] = -v
				if v == king {
					p.kings[1] = r*8 + c
				}
			}
			c++
		}
	}
	p.white = f[1] == "w"
	for _, ch := range f[2] {
		p.castle |= map[rune]uint8{'K': 1, 'Q': 2, 'k': 4, 'q': 8}[ch]
	}
	if f[3] != "-" {
		p.ep = int8(f[3][1]-'1')*8 + int8(f[3][0]-'a')
	}
	return p
}

func (p *chessPos) side() int {
	if p.white {
		return 0
	}
	return 1
}

// attacked says whether a piece of the given colour attacks s.
func (p *chessPos) attacked(s int8, byWhite bool) bool {
	sign := int8(1)
	if !byWhite {
		sign = -1
	}
	f := fileOf(s)
	if byWhite {
		if f > 0 && s >= 9 && p.sq[s-9] == pawn || f < 7 && s >= 7 && p.sq[s-7] == pawn {
			return true
		}
	} else {
		if f < 7 && s+9 < 64 && p.sq[s+9] == -pawn || f > 0 && s+7 < 64 && p.sq[s+7] == -pawn {
			return true
		}
	}
	for _, t := range knightTo[s] {
		if p.sq[t] == sign*knight {
			return true
		}
	}
	for _, t := range kingTo[s] {
		if p.sq[t] == sign*king {
			return true
		}
	}
	for d := 0; d < 8; d++ {
		for _, t := range rays[s][d] {
			v := p.sq[t]
			if v == 0 {
				continue
			}
			if v == sign*queen || d < 4 && v == sign*rook || d >= 4 && v == sign*bishop {
				return true
			}
			break
		}
	}
	return false
}

func (p *chessPos) inCheck() bool { return p.attacked(p.kings[p.side()], !p.white) }

// pseudo is every move for the side to move that follows how the pieces go, before checking whether
// it leaves the king in check. With only set, just captures and promotions.
func (p *chessPos) pseudo(only bool, out []cmove) []cmove {
	sign, fwd, startR, lastR := int8(1), int8(8), int8(1), int8(7)
	if !p.white {
		sign, fwd, startR, lastR = -1, -8, 6, 0
	}
	own := func(v int8) bool { return v*sign > 0 }
	enemy := func(v int8) bool { return v*sign < 0 }
	addPawn := func(from, to int8) {
		if rankOf(to) == lastR {
			for _, pr := range [4]int8{queen, knight, rook, bishop} {
				out = append(out, cmove{from, to, pr})
			}
			return
		}
		out = append(out, cmove{from, to, 0})
	}
	for s := int8(0); s < 64; s++ {
		v := p.sq[s]
		if !own(v) {
			continue
		}
		switch abs8(v) {
		case pawn:
			if t := s + fwd; t >= 0 && t < 64 && p.sq[t] == 0 {
				if !only || rankOf(t) == lastR {
					addPawn(s, t)
				}
				if t2 := t + fwd; !only && rankOf(s) == startR && p.sq[t2] == 0 {
					out = append(out, cmove{s, t2, 0})
				}
			}
			for _, df := range [2]int8{-1, 1} {
				f := fileOf(s) + df
				if f < 0 || f > 7 {
					continue
				}
				t := s + fwd + df
				if enemy(p.sq[t]) || t == p.ep {
					addPawn(s, t)
				}
			}
		case knight:
			for _, t := range knightTo[s] {
				if !own(p.sq[t]) && (!only || p.sq[t] != 0) {
					out = append(out, cmove{s, t, 0})
				}
			}
		case king:
			for _, t := range kingTo[s] {
				if !own(p.sq[t]) && (!only || p.sq[t] != 0) {
					out = append(out, cmove{s, t, 0})
				}
			}
			if !only {
				out = p.castles(s, out)
			}
		default:
			lo, hi := 0, 8
			switch abs8(v) {
			case rook:
				hi = 4
			case bishop:
				lo = 4
			}
			for d := lo; d < hi; d++ {
				for _, t := range rays[s][d] {
					if own(p.sq[t]) {
						break
					}
					if !only || p.sq[t] != 0 {
						out = append(out, cmove{s, t, 0})
					}
					if p.sq[t] != 0 {
						break
					}
				}
			}
		}
	}
	return out
}

func (p *chessPos) castles(s int8, out []cmove) []cmove {
	short, long, home, them := uint8(1), uint8(2), int8(4), false
	if !p.white {
		short, long, home, them = 4, 8, 60, true
	}
	if s != home || p.attacked(home, them) {
		return out
	}
	r := p.sq[home+3]
	if p.castle&short != 0 && abs8(r) == rook && p.sq[home+1] == 0 && p.sq[home+2] == 0 &&
		!p.attacked(home+1, them) && !p.attacked(home+2, them) {
		out = append(out, cmove{home, home + 2, 0})
	}
	r = p.sq[home-4]
	if p.castle&long != 0 && abs8(r) == rook && p.sq[home-1] == 0 && p.sq[home-2] == 0 && p.sq[home-3] == 0 &&
		!p.attacked(home-1, them) && !p.attacked(home-2, them) {
		out = append(out, cmove{home, home - 2, 0})
	}
	return out
}

// play is the position after mv.
func (p chessPos) play(mv cmove) chessPos {
	n := p
	pc := n.sq[mv.from]
	took := n.sq[mv.to]
	n.sq[mv.to], n.sq[mv.from] = pc, 0
	kind := abs8(pc)
	if kind == pawn && mv.to == p.ep {
		if pc > 0 {
			n.sq[mv.to-8] = 0
		} else {
			n.sq[mv.to+8] = 0
		}
		took = 1
	}
	n.ep = -1
	if kind == pawn && (mv.to-mv.from == 16 || mv.from-mv.to == 16) {
		n.ep = (mv.from + mv.to) / 2
	}
	if mv.promo != 0 {
		n.sq[mv.to] = mv.promo
		if pc < 0 {
			n.sq[mv.to] = -mv.promo
		}
	}
	if kind == king {
		n.kings[p.side()] = mv.to
		switch int(mv.to) - int(mv.from) {
		case 2:
			n.sq[mv.to-1], n.sq[mv.to+1] = n.sq[mv.to+1], 0
		case -2:
			n.sq[mv.to+1], n.sq[mv.to-2] = n.sq[mv.to-2], 0
		}
	}
	n.castle &^= castleLoss[mv.from] | castleLoss[mv.to]
	if kind == pawn || took != 0 {
		n.half = 0
	} else {
		n.half++
	}
	if !p.white {
		n.full++
	}
	n.white = !p.white
	return n
}

// legal is every move that does not leave the mover's own king in check.
func (p *chessPos) legal(only bool) []cmove {
	all := p.pseudo(only, make([]cmove, 0, 48))
	out := all[:0]
	for _, mv := range all {
		n := p.play(mv)
		if !n.attacked(n.kings[p.side()], n.white) {
			out = append(out, mv)
		}
	}
	return out
}

// key is the position for spotting repetitions: the pieces, the side to move, and the rights.
func (p chessPos) key() string {
	b := make([]byte, 0, 68)
	for _, v := range p.sq {
		b = append(b, byte(v+'G'))
	}
	return string(append(b, map[bool]byte{true: 'w', false: 'b'}[p.white], p.castle+'a', byte(p.ep+'B')))
}

// insufficient is a position neither side can mate from: kings alone, or a king and one minor piece.
func (p *chessPos) insufficient() bool {
	minors := 0
	for _, v := range p.sq {
		switch abs8(v) {
		case pawn, rook, queen:
			return false
		case knight, bishop:
			minors++
		}
	}
	return minors <= 1
}

// ── naming moves ──

func sqName(s int8) string { return string([]byte{byte('a' + fileOf(s)), byte('1' + rankOf(s))}) }

const pieceLetters = " PNBRQK"

// san is mv in standard algebraic notation: Nf3, exd5, O-O, e8=Q+, Qh7#.
func (p chessPos) san(mv cmove) string {
	kind := abs8(p.sq[mv.from])
	var s string
	switch {
	case kind == king && mv.to-mv.from == 2:
		s = "O-O"
	case kind == king && mv.from-mv.to == 2:
		s = "O-O-O"
	case kind == pawn:
		if fileOf(mv.from) != fileOf(mv.to) {
			s = sqName(mv.from)[:1] + "x"
		}
		s += sqName(mv.to)
		if mv.promo != 0 {
			s += "=" + string(pieceLetters[mv.promo])
		}
	default:
		s = string(pieceLetters[kind])
		same, sameFile, sameRank := false, false, false
		for _, o := range p.legal(false) {
			if o.to == mv.to && o.from != mv.from && abs8(p.sq[o.from]) == kind {
				same = true
				sameFile = sameFile || fileOf(o.from) == fileOf(mv.from)
				sameRank = sameRank || rankOf(o.from) == rankOf(mv.from)
			}
		}
		if same {
			switch {
			case !sameFile:
				s += sqName(mv.from)[:1]
			case !sameRank:
				s += sqName(mv.from)[1:]
			default:
				s += sqName(mv.from)
			}
		}
		if p.sq[mv.to] != 0 {
			s += "x"
		}
		s += sqName(mv.to)
	}
	n := p.play(mv)
	if n.inCheck() {
		if len(n.legal(false)) == 0 {
			return s + "#"
		}
		return s + "+"
	}
	return s
}

// ── the Mac's player ──

var pieceValue = [7]int{0, 100, 320, 330, 500, 900, 0}

// Piece-square tables from white's side, rank 8 first, as they are usually written.
var pst = [7][64]int{
	{},
	{ // pawn
		0, 0, 0, 0, 0, 0, 0, 0,
		50, 50, 50, 50, 50, 50, 50, 50,
		10, 10, 20, 30, 30, 20, 10, 10,
		5, 5, 10, 25, 25, 10, 5, 5,
		0, 0, 0, 20, 20, 0, 0, 0,
		5, -5, -10, 0, 0, -10, -5, 5,
		5, 10, 10, -20, -20, 10, 10, 5,
		0, 0, 0, 0, 0, 0, 0, 0},
	{ // knight
		-50, -40, -30, -30, -30, -30, -40, -50,
		-40, -20, 0, 0, 0, 0, -20, -40,
		-30, 0, 10, 15, 15, 10, 0, -30,
		-30, 5, 15, 20, 20, 15, 5, -30,
		-30, 0, 15, 20, 20, 15, 0, -30,
		-30, 5, 10, 15, 15, 10, 5, -30,
		-40, -20, 0, 5, 5, 0, -20, -40,
		-50, -40, -30, -30, -30, -30, -40, -50},
	{ // bishop
		-20, -10, -10, -10, -10, -10, -10, -20,
		-10, 0, 0, 0, 0, 0, 0, -10,
		-10, 0, 5, 10, 10, 5, 0, -10,
		-10, 5, 5, 10, 10, 5, 5, -10,
		-10, 0, 10, 10, 10, 10, 0, -10,
		-10, 10, 10, 10, 10, 10, 10, -10,
		-10, 5, 0, 0, 0, 0, 5, -10,
		-20, -10, -10, -10, -10, -10, -10, -20},
	{ // rook
		0, 0, 0, 0, 0, 0, 0, 0,
		5, 10, 10, 10, 10, 10, 10, 5,
		-5, 0, 0, 0, 0, 0, 0, -5,
		-5, 0, 0, 0, 0, 0, 0, -5,
		-5, 0, 0, 0, 0, 0, 0, -5,
		-5, 0, 0, 0, 0, 0, 0, -5,
		-5, 0, 0, 0, 0, 0, 0, -5,
		0, 0, 0, 5, 5, 0, 0, 0},
	{ // queen
		-20, -10, -10, -5, -5, -10, -10, -20,
		-10, 0, 0, 0, 0, 0, 0, -10,
		-10, 0, 5, 5, 5, 5, 0, -10,
		-5, 0, 5, 5, 5, 5, 0, -5,
		0, 0, 5, 5, 5, 5, 0, -5,
		-10, 5, 5, 5, 5, 5, 0, -10,
		-10, 0, 5, 0, 0, 0, 0, -10,
		-20, -10, -10, -5, -5, -10, -10, -20},
	{ // king, while there is plenty on the board
		-30, -40, -40, -50, -50, -40, -40, -30,
		-30, -40, -40, -50, -50, -40, -40, -30,
		-30, -40, -40, -50, -50, -40, -40, -30,
		-30, -40, -40, -50, -50, -40, -40, -30,
		-20, -30, -30, -40, -40, -30, -30, -20,
		-10, -20, -20, -20, -20, -20, -20, -10,
		20, 20, 0, 0, 0, 0, 20, 20,
		20, 30, 10, 0, 0, 10, 30, 20},
}

var kingLate = [64]int{
	-50, -40, -30, -20, -20, -30, -40, -50,
	-30, -20, -10, 0, 0, -10, -20, -30,
	-30, -10, 20, 30, 30, 20, -10, -30,
	-30, -10, 30, 40, 40, 30, -10, -30,
	-30, -10, 30, 40, 40, 30, -10, -30,
	-30, -10, 20, 30, 30, 20, -10, -30,
	-30, -30, 0, 0, 0, 0, -30, -30,
	-50, -30, -30, -30, -30, -30, -30, -50,
}

// eval is the position for the side to move, in centipawns: material, where the pieces stand, and
// the king walking out to the middle as the board empties.
func (p *chessPos) eval() int {
	score, phase := 0, 0
	var kingAt [2]int
	for s := 0; s < 64; s++ {
		v := p.sq[s]
		if v == 0 {
			continue
		}
		kind := abs8(v)
		idx := (7-s/8)*8 + s%8 // the table index from white's side
		sign := 1
		if v < 0 {
			idx, sign = s, -1 // black reads the table upside down
		}
		switch kind {
		case knight, bishop:
			phase++
		case rook:
			phase += 2
		case queen:
			phase += 4
		}
		if kind == king {
			kingAt[(1-sign)/2] = idx
			continue
		}
		score += sign * (pieceValue[kind] + pst[kind][idx])
	}
	phase = min(phase, 24)
	for c, idx := range kingAt {
		k := (pst[king][idx]*phase + kingLate[idx]*(24-phase)) / 24
		if c == 1 {
			k = -k
		}
		score += k
	}
	if !p.white {
		return -score
	}
	return score
}

const mate = 100000

type thinker struct {
	deadline time.Time
	nodes    int
	stop     bool
}

func moveValue(p *chessPos, mv cmove) int {
	v := 0
	if t := p.sq[mv.to]; t != 0 {
		v = 10*pieceValue[abs8(t)] - pieceValue[abs8(p.sq[mv.from])] + 10000
	}
	if mv.promo != 0 {
		v += pieceValue[mv.promo] + 9000
	}
	return v
}

// order puts the likely best moves first: first, then captures of big pieces by small ones, then
// promotions, then the rest as they came.
func order(p *chessPos, moves []cmove, first cmove) {
	vals := make([]int, len(moves))
	for i, mv := range moves {
		vals[i] = moveValue(p, mv)
		if mv == first {
			vals[i] = 1 << 30
		}
	}
	for i := 1; i < len(moves); i++ {
		for j := i; j > 0 && vals[j] > vals[j-1]; j-- {
			vals[j], vals[j-1] = vals[j-1], vals[j]
			moves[j], moves[j-1] = moves[j-1], moves[j]
		}
	}
}

func (t *thinker) search(p *chessPos, depth, ply, alpha, beta int) int {
	t.nodes++
	if t.nodes&1023 == 0 && time.Now().After(t.deadline) {
		t.stop = true
	}
	if t.stop {
		return 0
	}
	if p.half >= 100 {
		return 0
	}
	check := p.inCheck()
	if check && ply < 6 {
		depth++ // look further when in check, so mates are not missed
	}
	if depth <= 0 {
		return t.quiet(p, alpha, beta, 0)
	}
	moves := p.legal(false)
	if len(moves) == 0 {
		if check {
			return -mate + ply
		}
		return 0
	}
	order(p, moves, noMove)
	for _, mv := range moves {
		n := p.play(mv)
		score := -t.search(&n, depth-1, ply+1, -beta, -alpha)
		if t.stop {
			return 0
		}
		if score >= beta {
			return beta
		}
		alpha = max(alpha, score)
	}
	return alpha
}

// quiet carries on through the captures, so a move is not judged in the middle of a trade.
func (t *thinker) quiet(p *chessPos, alpha, beta, qd int) int {
	t.nodes++
	stand := p.eval()
	if stand >= beta {
		return beta
	}
	alpha = max(alpha, stand)
	if qd >= 8 {
		return alpha
	}
	moves := p.legal(true)
	order(p, moves, noMove)
	for _, mv := range moves {
		n := p.play(mv)
		score := -t.quiet(&n, -beta, -alpha, qd+1)
		if score >= beta {
			return beta
		}
		alpha = max(alpha, score)
	}
	return alpha
}

// bestMove is the Mac's move. Easy looks one move ahead and picks among the moves that look about as
// good, so it gives pieces away now and then; medium looks three ahead; hard goes as deep as it can
// in a second and a half.
func bestMove(p chessPos, level int, rng *rand.Rand) cmove {
	moves := p.legal(false)
	if len(moves) == 0 {
		return noMove
	}
	if len(moves) == 1 {
		return moves[0]
	}
	t := &thinker{deadline: time.Now().Add(4 * time.Second)}
	if level < 2 {
		depth, slack := 1, 140
		if level == 1 {
			depth, slack = 3, 12
		}
		type scored struct {
			mv    cmove
			score int
		}
		var all []scored
		for _, mv := range moves {
			n := p.play(mv)
			score := -t.search(&n, depth-1, 1, -mate, mate)
			if t.stop && len(all) > 0 {
				break // out of time: choose among the moves already weighed
			}
			all = append(all, scored{mv, score})
		}
		top := all[0].score
		for _, s := range all {
			top = max(top, s.score)
		}
		var near []cmove
		for _, s := range all {
			if s.score >= top-slack {
				near = append(near, s.mv)
			}
		}
		return near[rng.IntN(len(near))]
	}
	t.deadline = time.Now().Add(1500 * time.Millisecond)
	best := moves[0]
	for depth := 1; depth <= 12; depth++ {
		order(&p, moves, best)
		alpha, found := -mate-1, noMove
		for _, mv := range moves {
			n := p.play(mv)
			score := -t.search(&n, depth-1, 1, -mate, -alpha)
			if t.stop {
				break
			}
			if score > alpha {
				alpha, found = score, mv
			}
		}
		if t.stop {
			if found != noMove && found != best && alpha > -mate {
				best = found // a better move found partway through the deeper look is still better
			}
			break
		}
		best = found
		if alpha > mate-100 {
			break // a forced mate; looking deeper will not find a quicker one
		}
	}
	return best
}

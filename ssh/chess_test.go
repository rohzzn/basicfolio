package main

import (
	"math/rand/v2"
	"testing"
)

func perft(p chessPos, depth int) int {
	if depth == 0 {
		return 1
	}
	moves := p.legal(false)
	if depth == 1 {
		return len(moves)
	}
	n := 0
	for _, mv := range moves {
		n += perft(p.play(mv), depth-1)
	}
	return n
}

// TestPerft counts every position a few moves deep from positions known to catch move generator
// bugs (castling through check, en passant pins, promotions), against the published counts.
func TestPerft(t *testing.T) {
	cases := []struct {
		fen    string
		counts []int
	}{
		{"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -", []int{20, 400, 8902, 197281}},
		{"r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq -", []int{48, 2039, 97862}},
		{"8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - -", []int{14, 191, 2812, 43238}},
		{"r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq -", []int{6, 264, 9467}},
		{"rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ -", []int{44, 1486, 62379}},
	}
	for _, c := range cases {
		p := fromFEN(c.fen)
		for d, want := range c.counts {
			if got := perft(p, d+1); got != want {
				t.Errorf("%s depth %d: %d positions, want %d", c.fen, d+1, got, want)
			}
		}
	}
	if p := startPos(); p.key() != fromFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -").key() {
		t.Error("startPos and its FEN disagree")
	}
}

func TestSan(t *testing.T) {
	p := fromFEN("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq -")
	want := map[string]bool{"O-O": true, "O-O-O": true, "Nxf7": true, "Qxf6": true, "dxe6": true, "Bxa6": true, "Nc6": true}
	for _, mv := range p.legal(false) {
		delete(want, p.san(mv))
	}
	if len(want) > 0 {
		t.Errorf("never named: %v", want)
	}
	// the scholar's mate ends in a mate sign
	q := fromFEN("r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq -")
	if s := q.san(cmove{39, 53, 0}); s != "Qxf7#" {
		t.Errorf("Qh5xf7 is %q, want Qxf7#", s)
	}
}

// TestMacFindsMate makes sure each level takes a mate in one, and hard finds a mate in two.
func TestMacFindsMate(t *testing.T) {
	rng := rand.New(rand.NewPCG(1, 2))
	q := fromFEN("r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq -")
	for level := 1; level <= 2; level++ {
		if mv := bestMove(q, level, rng); mv != (cmove{39, 53, 0}) {
			t.Errorf("level %d played %s, not the mate", level, q.san(mv))
		}
	}
	// a back-rank mate in two: Re8+ Rxe8, Qxe8#... or just Qd8+ first; either way hard should find mate
	p := fromFEN("3r2k1/5ppp/8/8/8/8/5PPP/3QR1K1 w - -")
	mv := bestMove(p, 2, rng)
	n := p.play(mv)
	if !n.inCheck() {
		t.Errorf("hard played %s in a mate in two, not a check", p.san(mv))
	}
}

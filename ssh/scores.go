package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"
)

// Scores are the Arcade's high scores: one best per name for each game, kept in a small JSON file
// beside the binary so a restart does not lose them. A name is whatever someone connected as
// (ssh alex@rohan.my is "alex"); nothing checks it, which is fine for a game.
type Scores struct {
	path string
	mu   sync.Mutex
	by   map[string][]Score // game id → best first
}

type Score struct {
	Name  string    `json:"name"`
	Value int       `json:"value"`          // higher is better
	Note  string    `json:"note,omitempty"` // shown instead of the value where it says more
	At    time.Time `json:"at"`
}

const keepScores = 100

// OpenScores reads the file at path if there is one. An empty path keeps scores in memory only.
func OpenScores(path string) *Scores {
	s := &Scores{path: path, by: map[string][]Score{}}
	if path != "" {
		if b, err := os.ReadFile(path); err == nil {
			_ = json.Unmarshal(b, &s.by)
		}
	}
	return s
}

// Add records a score and returns its place on the board (1 is the top), or 0 when the name already
// has a better one or it is too far down to keep.
func (s *Scores) Add(game string, sc Score) int {
	if sc.Value <= 0 {
		return 0
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	list := s.by[game]
	for i, old := range list {
		if old.Name == sc.Name {
			if old.Value >= sc.Value {
				return 0
			}
			list = append(list[:i], list[i+1:]...)
			break
		}
	}
	// after any equal score, so whoever got there first stays ahead
	at := sort.Search(len(list), func(i int) bool { return list[i].Value < sc.Value })
	if at >= keepScores {
		return 0
	}
	list = append(list, Score{})
	copy(list[at+1:], list[at:])
	list[at] = sc
	if len(list) > keepScores {
		list = list[:keepScores]
	}
	s.by[game] = list
	s.save()
	return at + 1
}

// Top is the best n for a game.
func (s *Scores) Top(game string, n int) []Score {
	s.mu.Lock()
	defer s.mu.Unlock()
	list := s.by[game]
	return append([]Score(nil), list[:min(n, len(list))]...)
}

// Best is a name's own best for a game and its place on the board, place 0 if it has none.
func (s *Scores) Best(game, name string) (Score, int) {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i, sc := range s.by[game] {
		if sc.Name == name {
			return sc, i + 1
		}
	}
	return Score{}, 0
}

// Count is how many names are on a game's board.
func (s *Scores) Count(game string) int {
	s.mu.Lock()
	defer s.mu.Unlock()
	return len(s.by[game])
}

// save writes the file whole and swaps it in, so a crash mid-write cannot leave half of one.
func (s *Scores) save() {
	if s.path == "" {
		return
	}
	b, err := json.MarshalIndent(s.by, "", " ")
	if err != nil {
		return
	}
	tmp := filepath.Join(filepath.Dir(s.path), "."+filepath.Base(s.path)+".tmp")
	if os.WriteFile(tmp, b, 0o644) == nil {
		_ = os.Rename(tmp, s.path)
	}
}

// cleanName turns the name someone connected as into one fit for a scoreboard.
func cleanName(user string) string {
	var b strings.Builder
	for _, r := range user {
		if r >= 'a' && r <= 'z' || r >= 'A' && r <= 'Z' || r >= '0' && r <= '9' || r == '-' || r == '_' || r == '.' {
			b.WriteRune(r)
		}
		if b.Len() == 14 {
			break
		}
	}
	if b.Len() == 0 {
		return "guest"
	}
	return b.String()
}

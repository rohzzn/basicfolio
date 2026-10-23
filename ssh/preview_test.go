package main

import (
	"fmt"
	"io"
	"os"
	"strings"
	"testing"
	"time"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	"github.com/charmbracelet/x/ansi"
)

// TestScreens walks every screen at a roomy and a cramped terminal size and checks each frame fits
// it exactly. With PREVIEW=1 it also prints the frames, the quickest way to look at a layout change:
//
//	PREVIEW=1 go test -run TestScreens -v
//
// OFFLINE=1 skips the live pull from rohan.run; PLAYING=1 pretends a song is on, to see the player.
func TestScreens(t *testing.T) {
	if err := loadSite(); err != nil {
		t.Fatal(err)
	}
	live := NewLive("https://www.rohan.run")
	if os.Getenv("OFFLINE") == "" {
		live.Pull()
	}
	if os.Getenv("PLAYING") != "" {
		live.mu.Lock()
		live.snap.Track = &Track{Name: "A song", Artists: "An artist", Progress: 100 * time.Second, Duration: 210 * time.Second, At: time.Now()}
		live.snap.Discord = &Discord{Status: "online", Activity: "Playing VALORANT"}
		live.snap.Updated = time.Now()
		live.mu.Unlock()
	}

	arc := NewArcade("")
	arc.scores.Add("snake", Score{Name: "alex", Value: 23})
	arc.scores.Add("2048", Score{Name: "sam", Value: 5120})
	arc.scores.Add("chess", Score{Name: "alex", Value: 1966, Note: "medium in 34"})
	arc.scores.Add("race", Score{Name: "jo", Value: 92, Note: "97%"})
	for _, size := range [][2]int{{100, 32}, {80, 24}, {120, 40}} {
		w, h := size[0], size[1]
		m := newModelWith(lipgloss.NewRenderer(io.Discard), live, arc, io.Discard, w, h)
		m.name = "tester"
		keys := func(ks ...string) {
			for _, k := range ks {
				var msg tea.KeyMsg
				switch k {
				case "right":
					msg = tea.KeyMsg{Type: tea.KeyRight}
				case "left":
					msg = tea.KeyMsg{Type: tea.KeyLeft}
				case "up":
					msg = tea.KeyMsg{Type: tea.KeyUp}
				case "down":
					msg = tea.KeyMsg{Type: tea.KeyDown}
				case "enter":
					msg = tea.KeyMsg{Type: tea.KeyEnter}
				case "esc":
					msg = tea.KeyMsg{Type: tea.KeyEsc}
				case "tab":
					msg = tea.KeyMsg{Type: tea.KeyTab}
				case "space":
					msg = tea.KeyMsg{Type: tea.KeySpace, Runes: []rune{' '}}
				case "backspace":
					msg = tea.KeyMsg{Type: tea.KeyBackspace}
				default:
					msg = tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune(k)}
				}
				m.Update(msg)
			}
		}
		shot := func(name string) {
			name = fmt.Sprintf("%s %dx%d", name, w, h)
			frame := ansi.Strip(m.View())
			lines := strings.Split(frame, "\n")
			if len(lines) > h {
				t.Errorf("%s: %d lines, terminal has %d", name, len(lines), h)
			}
			for i, l := range lines {
				if width := ansi.StringWidth(l); width > w {
					t.Errorf("%s: line %d is %d wide: %q", name, i, width, l)
				}
			}
			if os.Getenv("PREVIEW") != "" {
				fmt.Printf("\n===== %s =====\n%s\n", name, frame)
			}
		}

		shot("front door")
		keys("x")
		shot("home")
		keys("2")
		shot("projects")
		keys("tab", "tab", "tab")
		shot("projects, games")
		keys("tab", "tab", "/", "c", "l", "a", "w", "enter")
		if m.query != "claw" || m.page != pageProjects {
			t.Errorf("%dx%d: the search box should take w a s d as letters (query %q)", w, h, m.query)
		}
		shot("projects, search")
		keys("esc", "down", "down", "enter")
		shot("project open")
		keys("3")
		shot("writing")
		keys("enter")
		shot("reading")
		keys("n", "f")
		shot("reading the next post, a page down")
		keys("4")
		shot("hobbies")
		keys("5", "down", "down", "down", "down", "down", "down", "down", "down", "c")
		shot("links")
		keys("up", "up", "down", "down", "left", "right", "left", "right", "b", "a")
		if !m.room || m.page != pageLinks {
			t.Errorf("%dx%d: the Konami code should open the room over Links (room %v, page %v)", w, h, m.room, m.page)
		}
		if os.Getenv("OFFLINE") == "" {
			// opening the room started a check in the background; wait for it
			for i := 0; i < 150 && live.Snapshot().RoomChecked.IsZero(); i++ {
				time.Sleep(100 * time.Millisecond)
			}
			m.Update(pulledMsg{})
		}
		shot("server room")
		keys("esc")
		if m.room || m.page != pageLinks {
			t.Errorf("%dx%d: esc should leave the room back to Links", w, h)
		}

		// W A S D steer exactly like the arrows
		keys("1", "d")
		if m.page != pageProjects {
			t.Errorf("%dx%d: d should go to the next page, got %v", w, h, m.page)
		}
		was := m.pcur
		keys("s", "s", "w")
		if m.pcur != was+1 {
			t.Errorf("%dx%d: s s w should move one project down, from %d to %d", w, h, was, m.pcur)
		}
		keys("a")
		if m.page != pageHome {
			t.Errorf("%dx%d: a should go to the previous page, got %v", w, h, m.page)
		}
		keys("w", "w", "s", "s", "a", "d", "a", "d", "b", "a")
		if !m.room || m.page != pageHome {
			t.Errorf("%dx%d: the Konami code in W A S D should open the room over Home (room %v, page %v)", w, h, m.room, m.page)
		}
		keys("esc", "wwssadadba") // the same, arriving in one read
		if !m.room || m.page != pageHome {
			t.Errorf("%dx%d: W A S D keys that arrive together should still count one by one", w, h)
		}
		keys("esc")

		// the Arcade
		keys("6")
		shot("arcade")
		keys("enter")
		if _, ok := m.game.(*snakeGame); !ok {
			t.Fatalf("%dx%d: enter on the Arcade should open Snake", w, h)
		}
		shot("snake, ready")
		keys("d")
		for i := 0; i < 5; i++ {
			m.Update(frameMsg{m.gameGen, m.game.(*snakeGame).seq})
		}
		shot("snake, running")
		keys("space")
		shot("snake, paused")
		keys("esc")
		if m.game != nil || m.page != pageArcade {
			t.Errorf("%dx%d: esc should leave a game for the list", w, h)
		}
		keys("s", "enter")
		tg := m.game.(*tilesGame)
		keys("a", "s")
		m.Update(frameMsg{m.gameGen, tg.seq})
		m.Update(frameMsg{m.gameGen, tg.seq})
		shot("2048, mid-slide")
		for i := 0; i < 12; i++ {
			m.Update(frameMsg{m.gameGen, tg.seq})
		}
		shot("2048")
		keys("esc", "s", "enter")
		shot("chess, setup")
		keys("enter")
		cg := m.game.(*chessGame)
		keys("enter", "w", "w", "enter") // e2-e4
		if cg.pos.sq[28] != pawn {
			t.Errorf("%dx%d: e2 e4 by keys did not move the pawn", w, h)
		}
		m.Update(frameMsg{m.gameGen, cg.seq})
		shot("chess, a move sliding, the Mac thinking")
		keys("esc", "s", "enter")
		shot("typing race, waiting")
		rg := m.game.(*raceGame)
		rg.race.start = time.Now().Add(-2 * time.Second)
		m.Update(frameMsg{m.gameGen, rg.seq})
		keys(string(rg.look.text[:12]), "x", "x")
		shot("typing race, racing with a mistake")
		keys("backspace", "backspace")
		keys(string(rg.look.text[12:]))
		if !rg.done {
			t.Errorf("%dx%d: typing the whole paragraph should finish the race", w, h)
		}
		m.Update(frameMsg{m.gameGen, rg.seq})
		shot("typing race, finished")
		keys("esc", "1")
	}
}

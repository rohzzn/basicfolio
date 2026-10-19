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

	for _, size := range [][2]int{{100, 32}, {80, 24}} {
		w, h := size[0], size[1]
		m := newModelWith(lipgloss.NewRenderer(io.Discard), live, io.Discard, w, h)
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
	}
}

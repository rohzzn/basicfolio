package main

import (
	"fmt"
	"io"
	"os"
	"strings"
	"testing"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	"github.com/charmbracelet/x/ansi"
)

// TestScreens renders every screen at a fixed size and checks the frame fits it. With
// PREVIEW=1 it also prints the frames, which is the quickest way to look at a layout change:
//
//	PREVIEW=1 go test -run TestScreens -v
func TestScreens(t *testing.T) {
	if err := loadSite(); err != nil {
		t.Fatal(err)
	}
	live := NewLive("https://www.rohan.run")
	if os.Getenv("OFFLINE") == "" {
		live.Pull()
	}
	r := lipgloss.NewRenderer(io.Discard)
	const w, h = 100, 32
	m := newModelWith(r, live, w, h)

	keys := func(ks ...string) {
		for _, k := range ks {
			var msg tea.KeyMsg
			switch k {
			case "right":
				msg = tea.KeyMsg{Type: tea.KeyRight}
			case "left":
				msg = tea.KeyMsg{Type: tea.KeyLeft}
			case "down":
				msg = tea.KeyMsg{Type: tea.KeyDown}
			case "enter":
				msg = tea.KeyMsg{Type: tea.KeyEnter}
			case "esc":
				msg = tea.KeyMsg{Type: tea.KeyEsc}
			default:
				msg = tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune(k)}
			}
			m.Update(msg)
		}
	}
	shot := func(name string) {
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

	shot("home")
	keys("right")
	shot("projects")
	keys("down", "down", "enter")
	shot("project open")
	keys("esc", "right")
	shot("writing")
	keys("enter")
	shot("post open")
	keys("right")
	shot("hobbies")
	keys("right")
	shot("links")
}

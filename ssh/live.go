package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"sync"
	"time"
)

// Live is what is happening right now, read from rohan.run's own API routes. One fetch a minute is
// shared by every session, and a source that fails keeps its last good value instead of going blank.
type Live struct {
	base   string
	client *http.Client

	mu       sync.RWMutex
	snap     Snapshot
	lastPull time.Time
	pulling  bool
}

type Snapshot struct {
	Updated  time.Time
	Track    *Track
	Games    []Game
	Films    []Film
	Anime    []Anime
	Workouts []Workout
}

type Track struct{ Name, Artists, URL string }
type Game struct {
	Name    string
	Minutes int // in the last two weeks
}
type Film struct {
	Title  string
	Year   int
	Rating float64 // out of 5
}
type Anime struct {
	Title, Status string
	Score         int
}
type Workout struct {
	Title    string
	Start    time.Time
	Duration time.Duration
}

func NewLive(base string) *Live {
	return &Live{base: base, client: &http.Client{Timeout: 8 * time.Second}}
}

func (l *Live) Snapshot() Snapshot {
	l.mu.RLock()
	defer l.mu.RUnlock()
	return l.snap
}

// Run pulls once now and then every minute until ctx ends.
func (l *Live) Run(ctx context.Context) {
	l.Pull()
	t := time.NewTicker(time.Minute)
	defer t.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-t.C:
			l.Pull()
		}
	}
}

// PullSoon is the r key: a fresh pull, unless one happened in the last ten seconds.
func (l *Live) PullSoon() {
	l.mu.RLock()
	recent := time.Since(l.lastPull) < 10*time.Second || l.pulling
	l.mu.RUnlock()
	if !recent {
		go l.Pull()
	}
}

func (l *Live) Pull() {
	l.mu.Lock()
	if l.pulling {
		l.mu.Unlock()
		return
	}
	l.pulling = true
	next := l.snap
	l.mu.Unlock()

	var wg sync.WaitGroup
	var mu sync.Mutex
	set := func(f func()) { mu.Lock(); f(); mu.Unlock() }
	run := func(f func()) { wg.Add(1); go func() { defer wg.Done(); f() }() }

	run(func() {
		var r struct {
			IsPlaying bool `json:"isPlaying"`
			Track     *struct {
				Name       string `json:"name"`
				Artists    string `json:"artists"`
				SpotifyURL string `json:"spotifyUrl"`
			} `json:"track"`
		}
		if l.get("/api/spotify/currently-playing", &r) == nil {
			set(func() {
				next.Track = nil
				if r.IsPlaying && r.Track != nil {
					next.Track = &Track{Name: r.Track.Name, Artists: r.Track.Artists, URL: r.Track.SpotifyURL}
				}
			})
		}
	})
	run(func() {
		var r struct {
			Response struct {
				Games []struct {
					Name   string `json:"name"`
					TwoWks int    `json:"playtime_2weeks"`
				} `json:"games"`
			} `json:"response"`
		}
		if l.get("/api/steam/games", &r) == nil {
			var games []Game
			for _, g := range r.Response.Games {
				if g.TwoWks > 0 {
					games = append(games, Game{Name: g.Name, Minutes: g.TwoWks})
				}
			}
			sort.Slice(games, func(i, j int) bool { return games[i].Minutes > games[j].Minutes })
			set(func() { next.Games = games })
		}
	})
	run(func() {
		var r struct {
			Movies []struct {
				Title  string   `json:"title"`
				Year   int      `json:"year"`
				Rating *float64 `json:"ratingValue"`
			} `json:"movies"`
		}
		if l.get("/api/letterboxd", &r) == nil {
			var films []Film
			for _, m := range r.Movies {
				f := Film{Title: m.Title, Year: m.Year}
				if m.Rating != nil {
					f.Rating = *m.Rating
				}
				films = append(films, f)
			}
			set(func() { next.Films = films })
		}
	})
	run(func() {
		var r struct {
			List []struct {
				Title  string `json:"title"`
				Status string `json:"status"`
				Score  *int   `json:"score"`
			} `json:"animeList"`
		}
		if l.get("/api/myanimelist", &r) == nil {
			var anime []Anime
			for _, a := range r.List {
				x := Anime{Title: a.Title, Status: a.Status}
				if a.Score != nil {
					x.Score = *a.Score
				}
				anime = append(anime, x)
			}
			set(func() { next.Anime = anime })
		}
	})
	run(func() {
		var r struct {
			Workouts []struct {
				Title string    `json:"title"`
				Start time.Time `json:"start_time"`
				End   time.Time `json:"end_time"`
			} `json:"workouts"`
		}
		if l.get("/api/hevy/workouts", &r) == nil {
			var ws []Workout
			for _, w := range r.Workouts {
				ws = append(ws, Workout{Title: w.Title, Start: w.Start, Duration: w.End.Sub(w.Start)})
			}
			set(func() { next.Workouts = ws })
		}
	})
	wg.Wait()

	l.mu.Lock()
	next.Updated = time.Now()
	l.snap = next
	l.lastPull = time.Now()
	l.pulling = false
	l.mu.Unlock()
}

func (l *Live) get(path string, into any) error {
	req, err := http.NewRequest(http.MethodGet, l.base+path, nil)
	if err != nil {
		return err
	}
	req.Header.Set("User-Agent", "rohan.my-ssh")
	res, err := l.client.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		return fmt.Errorf("%s: %s", path, res.Status)
	}
	return json.NewDecoder(res.Body).Decode(into)
}

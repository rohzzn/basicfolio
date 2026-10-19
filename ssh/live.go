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
	Discord  *Discord
	Track    *Track
	Games    []Game // most played in the last two weeks first
	Recent   []Game // most recently played first
	Films    []Film
	Anime    []Anime
	Workouts []Workout
}

// Discord is the presence Discord shows: online, idle, dnd or offline, and what he is doing.
type Discord struct {
	Status   string
	Activity string // "Playing VALORANT", a custom status, or empty
}

// discordID is the account whose presence Lanyard mirrors; the site's sidebar reads the same one.
const discordID = "407922731645009932"

type Track struct {
	Name, Artists, URL string
	Progress, Duration time.Duration
	At                 time.Time // when Progress was read
}

// Elapsed is how far into the song it is now, counting on from when it was read.
func (t *Track) Elapsed() time.Duration {
	e := t.Progress + time.Since(t.At)
	if t.Duration > 0 && e > t.Duration {
		return t.Duration
	}
	return e
}

type Game struct {
	Name       string
	Minutes    int // in the last two weeks
	LastPlayed time.Time
}
type Film struct {
	Title  string
	Year   int
	Rating float64 // out of 5
}
type Anime struct {
	Title, Status string // status: watching, watched, plan_to_watch, dropped
	Score         int
	Updated       time.Time // zero until the site's API sends updatedAt
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
			IsPlaying  bool    `json:"isPlaying"`
			ProgressMs float64 `json:"progressMs"`
			Track      *struct {
				Name       string  `json:"name"`
				Artists    string  `json:"artists"`
				SpotifyURL string  `json:"spotifyUrl"`
				DurationMs float64 `json:"durationMs"`
			} `json:"track"`
		}
		if l.get("/api/spotify/currently-playing", &r) == nil {
			set(func() {
				next.Track = nil
				if r.IsPlaying && r.Track != nil {
					next.Track = &Track{
						Name: r.Track.Name, Artists: r.Track.Artists, URL: r.Track.SpotifyURL,
						Progress: time.Duration(r.ProgressMs) * time.Millisecond,
						Duration: time.Duration(r.Track.DurationMs) * time.Millisecond,
						At:       time.Now(),
					}
				}
			})
		}
	})
	run(func() {
		var r struct {
			Response struct {
				Games []struct {
					Name     string `json:"name"`
					TwoWks   int    `json:"playtime_2weeks"`
					LastUnix int64  `json:"rtime_last_played"`
				} `json:"games"`
			} `json:"response"`
		}
		if l.get("/api/steam/games", &r) == nil {
			var games, recent []Game
			for _, g := range r.Response.Games {
				x := Game{Name: g.Name, Minutes: g.TwoWks}
				if g.LastUnix > 0 {
					x.LastPlayed = time.Unix(g.LastUnix, 0)
					recent = append(recent, x)
				}
				if g.TwoWks > 0 {
					games = append(games, x)
				}
			}
			sort.Slice(games, func(i, j int) bool { return games[i].Minutes > games[j].Minutes })
			sort.Slice(recent, func(i, j int) bool { return recent[i].LastPlayed.After(recent[j].LastPlayed) })
			set(func() { next.Games, next.Recent = games, recent })
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
				Title     string     `json:"title"`
				Status    string     `json:"status"`
				Score     *int       `json:"score"`
				UpdatedAt *time.Time `json:"updatedAt"`
			} `json:"animeList"`
		}
		if l.get("/api/myanimelist", &r) == nil {
			var anime []Anime
			for _, a := range r.List {
				x := Anime{Title: a.Title, Status: a.Status}
				if a.Score != nil {
					x.Score = *a.Score
				}
				if a.UpdatedAt != nil {
					x.Updated = *a.UpdatedAt
				}
				anime = append(anime, x)
			}
			set(func() { next.Anime = anime })
		}
	})
	run(func() {
		var r struct {
			Data struct {
				Status     string `json:"discord_status"`
				Activities []struct {
					Type  int    `json:"type"`
					Name  string `json:"name"`
					State string `json:"state"`
				} `json:"activities"`
			} `json:"data"`
		}
		if l.getURL("https://api.lanyard.rest/v1/users/"+discordID, &r) == nil && r.Data.Status != "" {
			d := &Discord{Status: r.Data.Status}
			verbs := map[int]string{0: "Playing", 1: "Streaming", 2: "Listening to", 3: "Watching", 5: "Competing in"}
			custom := ""
			for _, a := range r.Data.Activities {
				if a.Name == "Spotify" {
					continue // the song has its own line
				}
				if a.Type == 4 {
					custom = a.State
					continue
				}
				if v, ok := verbs[a.Type]; ok && d.Activity == "" {
					d.Activity = v + " " + a.Name
				}
			}
			if d.Activity == "" {
				d.Activity = custom
			}
			set(func() { next.Discord = d })
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

func (l *Live) get(path string, into any) error { return l.getURL(l.base+path, into) }

func (l *Live) getURL(url string, into any) error {
	path := url
	req, err := http.NewRequest(http.MethodGet, url, nil)
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

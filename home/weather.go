package main

import (
	"context"
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"time"
)

// Weather in Cincinnati, from Open-Meteo (no key needed).
type Weather struct {
	TempC float64
	Code  int
	At    time.Time
}

const weatherURL = "https://api.open-meteo.com/v1/forecast?latitude=39.1031&longitude=-84.512&current=temperature_2m,weather_code"

func (s *Store) readWeather(ctx context.Context) {
	if s.offline {
		return
	}
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, weatherURL, nil)
	if err != nil {
		return
	}
	req.Header.Set("User-Agent", "home.rohan.my")
	res, err := s.client.Do(req)
	if err != nil {
		return
	}
	defer res.Body.Close()
	var v struct {
		Current struct {
			Temp float64 `json:"temperature_2m"`
			Code int     `json:"weather_code"`
		} `json:"current"`
	}
	if res.StatusCode != http.StatusOK || json.NewDecoder(res.Body).Decode(&v) != nil {
		return
	}
	s.mu.Lock()
	s.weather = &Weather{TempC: v.Current.Temp, Code: v.Current.Code, At: time.Now()}
	s.mu.Unlock()
}

// phrase finishes "1:41 PM in Cincinnati, …": "18°C and clear", "6°C with rain".
func (w *Weather) phrase() string {
	if w == nil || time.Since(w.At) > 2*time.Hour {
		return ""
	}
	sky := "and clear"
	switch c := w.Code; {
	case c == 1:
		sky = "and mostly clear"
	case c == 2:
		sky = "and partly cloudy"
	case c == 3:
		sky = "and overcast"
	case c == 45 || c == 48:
		sky = "and foggy"
	case c >= 51 && c <= 57:
		sky = "with drizzle"
	case c == 66 || c == 67:
		sky = "with freezing rain"
	case c >= 61 && c <= 65:
		sky = "with rain"
	case c >= 71 && c <= 77:
		sky = "with snow"
	case c >= 80 && c <= 82:
		sky = "with showers"
	case c == 85 || c == 86:
		sky = "with snow showers"
	case c >= 95:
		sky = "with thunderstorms"
	}
	return fmt.Sprintf("%d°C %s", int(math.Round(w.TempC)), sky)
}

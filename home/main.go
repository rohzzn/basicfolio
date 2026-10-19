// home.rohan.my: what the Mac under the desk runs and whether it's up, as four plain pages.
// It replaces Glance. Only names, roles and numbers that are safe to be public ever reach a
// page: no addresses, ports, image names or service labels (preview_test.go checks).
package main

import (
	"context"
	"crypto/sha256"
	"embed"
	"encoding/hex"
	"errors"
	"io/fs"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	_ "time/tzdata"
)

//go:embed templates/*.html static/*
var files embed.FS

func main() {
	addr := env("HOME_ADDR", "127.0.0.1:8080")
	s := newStore(env("HOME_STATE", "state.json"))

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	go s.run(ctx)

	srv := &http.Server{
		Addr:              addr,
		Handler:           s.routes(),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
	}
	go func() {
		<-ctx.Done()
		shut, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		_ = srv.Shutdown(shut)
	}()
	log.Printf("home.rohan.my on %s", addr)
	if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatal(err)
	}
}

func env(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}

func (s *Store) routes() http.Handler {
	static, _ := fs.Sub(files, "static")
	mux := http.NewServeMux()
	mux.HandleFunc("GET /{$}", s.page(pageHome))
	mux.HandleFunc("GET /mac", s.page(pageMac))
	mux.HandleFunc("GET /containers", s.page(pageContainers))
	mux.HandleFunc("GET /network", s.page(pageNetwork))
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) { w.Write([]byte("ok\n")) })
	mux.Handle("GET /static/", http.StripPrefix("/static/", cacheFor(time.Hour, http.FileServerFS(static))))
	mux.HandleFunc("GET /favicon.svg", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "public, max-age=86400")
		http.ServeFileFS(w, r, static, "favicon.svg")
	})
	mux.HandleFunc("/", func(w http.ResponseWriter, _ *http.Request) { http.Error(w, "Nothing here.", http.StatusNotFound) })
	return secure(mux)
}

// secure sets the headers every response gets. The pages load fonts from Google and nothing else
// from anywhere; inline styles are only the bar and meter widths.
func secure(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		hd := w.Header()
		hd.Set("Content-Security-Policy", "default-src 'none'; script-src 'self'; connect-src 'self'; img-src 'self'; "+
			"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; "+
			"base-uri 'none'; form-action 'none'; frame-ancestors 'none'")
		hd.Set("X-Content-Type-Options", "nosniff")
		hd.Set("Referrer-Policy", "strict-origin-when-cross-origin")
		hd.Set("X-Frame-Options", "DENY")
		h.ServeHTTP(w, r)
	})
}

func cacheFor(d time.Duration, h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "public, max-age="+itoa(int(d.Seconds())))
		h.ServeHTTP(w, r)
	})
}

// version is a short hash of a static file, added to its URL so Cloudflare's cache never serves
// an old one after a deploy.
func version(name string) string {
	b, err := files.ReadFile("static/" + name)
	if err != nil {
		return "/static/" + name
	}
	sum := sha256.Sum256(b)
	return "/static/" + name + "?v=" + hex.EncodeToString(sum[:4])
}

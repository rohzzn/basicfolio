// ssh rohan.my: the portfolio as a terminal app. Anyone who connects gets the app, never a shell,
// and no login is asked for.
//
//	SSH_ADDR      where to listen            (default 0.0.0.0:2222)
//	SSH_HOST_KEY  the server's own key file  (default .ssh/rohan_my_ed25519, made on first run)
//	SITE_API      where the live data is     (default https://www.rohan.run)
package main

import (
	"context"
	"errors"
	"os"
	"os/signal"
	"syscall"
	"time"
	_ "time/tzdata" // the Cincinnati clock, wherever this runs

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/log"
	"github.com/charmbracelet/ssh"
	"github.com/charmbracelet/wish"
	"github.com/charmbracelet/wish/activeterm"
	bm "github.com/charmbracelet/wish/bubbletea"
	"github.com/charmbracelet/wish/logging"
	"github.com/charmbracelet/wish/ratelimiter"
	"golang.org/x/time/rate"
)

func env(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}

func main() {
	if err := loadSite(); err != nil {
		log.Fatal("site data", "err", err)
	}
	addr := env("SSH_ADDR", "0.0.0.0:2222")

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	live := NewLive(env("SITE_API", "https://www.rohan.run"))
	go live.Run(ctx)

	srv, err := wish.NewServer(
		wish.WithAddress(addr),
		wish.WithHostKeyPath(env("SSH_HOST_KEY", ".ssh/rohan_my_ed25519")),
		wish.WithVersion("rohan.my"),
		wish.WithIdleTimeout(15*time.Minute),
		wish.WithMaxTimeout(2*time.Hour),
		// Middlewares run last to first: log, limit, require a terminal, then the app.
		wish.WithMiddleware(
			bm.Middleware(func(s ssh.Session) (tea.Model, []tea.ProgramOption) {
				return newModel(s, live), []tea.ProgramOption{tea.WithAltScreen(), tea.WithMouseCellMotion()}
			}),
			activeterm.Middleware(),
			// per client address: one new session a second, bursts of five
			ratelimiter.Middleware(ratelimiter.NewRateLimiter(rate.Every(time.Second), 5, 2000)),
			logging.Middleware(),
		),
	)
	if err != nil {
		log.Fatal("server", "err", err)
	}

	log.Info("listening", "addr", addr)
	go func() {
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, ssh.ErrServerClosed) {
			log.Error("listen", "err", err)
			stop()
		}
	}()

	<-ctx.Done()
	shutdown, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_ = srv.Shutdown(shutdown)
}

#!/usr/bin/env bash
# Builds home.rohan.my for the Mac and installs it there as the LaunchAgent my.rohan.home, on
# 127.0.0.1:8080, where the rohan-mac tunnel sends home.rohan.my.
#
#   ./deploy.sh                    MAC=rohan@192.168.4.36 by default
#
# On the Mac: ~/srv/rohan-home/{bin,logs}, and state.json, the last day of checks. Keep it, or
# the 24-hour bars start over empty.
set -euo pipefail
cd "$(dirname "$0")"
MAC=${MAC:-rohan@192.168.4.36}

go test ./... >/dev/null
GOOS=darwin GOARCH=arm64 CGO_ENABLED=0 go build -trimpath -ldflags "-s -w" -o out/rohan-home .

ssh "$MAC" 'mkdir -p ~/srv/rohan-home/bin ~/srv/rohan-home/logs'
scp -q out/rohan-home "$MAC":srv/rohan-home/bin/rohan-home.new
scp -q my.rohan.home.plist "$MAC":Library/LaunchAgents/my.rohan.home.plist
ssh "$MAC" 'set -e
  cd ~/srv/rohan-home/bin && chmod 755 rohan-home.new && mv rohan-home.new rohan-home
  uid=$(id -u); svc=gui/$uid/my.rohan.home
  launchctl bootout $svc 2>/dev/null || true
  # bootout returns before the old one is gone; bootstrapping over it fails with error 5
  for i in 1 2 3 4 5 6 7 8 9 10; do launchctl print $svc >/dev/null 2>&1 || break; sleep 1; done
  launchctl bootstrap gui/$uid ~/Library/LaunchAgents/my.rohan.home.plist
  sleep 2
  curl -fsS -o /dev/null http://127.0.0.1:8080/healthz && echo "my.rohan.home is answering on 8080"'

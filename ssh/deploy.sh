#!/usr/bin/env bash
# Builds ssh rohan.my for the Mac and installs it there as the LaunchAgent my.rohan.ssh.
# Run it again after the site's projects, posts, books or links change: it regenerates
# data/site.json from them first.
#
#   ./deploy.sh                    MAC=rohan@192.168.4.36 by default
#
# On the Mac: ~/srv/rohan-ssh/{bin,logs,.ssh}. The host key in .ssh is made on the first run;
# keep it, or everyone who has connected before gets a changed-key warning.
set -euo pipefail
cd "$(dirname "$0")"
MAC=${MAC:-rohan@192.168.4.36}

node gen-data.mjs 2>/dev/null
go test ./... >/dev/null
GOOS=darwin GOARCH=arm64 CGO_ENABLED=0 go build -trimpath -ldflags "-s -w" -o out/rohan-ssh .

ssh "$MAC" 'mkdir -p ~/srv/rohan-ssh/bin ~/srv/rohan-ssh/logs ~/srv/rohan-ssh/.ssh && chmod 700 ~/srv/rohan-ssh/.ssh'
scp -q out/rohan-ssh "$MAC":srv/rohan-ssh/bin/rohan-ssh.new
scp -q my.rohan.ssh.plist "$MAC":Library/LaunchAgents/my.rohan.ssh.plist
ssh "$MAC" 'set -e
  cd ~/srv/rohan-ssh/bin && chmod 755 rohan-ssh.new && mv rohan-ssh.new rohan-ssh
  uid=$(id -u); svc=gui/$uid/my.rohan.ssh
  launchctl bootout $svc 2>/dev/null || true
  # bootout returns before the old one is gone; bootstrapping over it fails with error 5
  for i in 1 2 3 4 5 6 7 8 9 10; do launchctl print $svc >/dev/null 2>&1 || break; sleep 1; done
  launchctl bootstrap gui/$uid ~/Library/LaunchAgents/my.rohan.ssh.plist
  sleep 2
  lsof -nP -iTCP:2222 -sTCP:LISTEN >/dev/null && echo "my.rohan.ssh is listening on 2222"'

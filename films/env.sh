# source me: puts Chrome and ffmpeg where render.mjs and build.mjs look for them (Windows)
export CHROME="${CHROME:-/c/Program Files/Google/Chrome/Application/chrome.exe}"
FF_DIR="$(ls -d ${LOCALAPPDATA:+$(cygpath -u "$LOCALAPPDATA")/}Microsoft/WinGet/Packages/Gyan.FFmpeg*/ffmpeg-*/bin 2>/dev/null | head -1)"
[ -n "$FF_DIR" ] && export PATH="$FF_DIR:$PATH"

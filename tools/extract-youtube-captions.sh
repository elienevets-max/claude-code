#!/usr/bin/env bash
#
# extract-youtube-captions.sh — Download YouTube auto-captions as text transcripts
#
# This is the FASTEST way to get transcripts — no audio download or Whisper needed.
# Most YouTube videos have auto-generated English captions.
#
# Usage:
#   ./extract-youtube-captions.sh [OPTIONS] [PLAYLIST_URL]
#
# Options:
#   -c, --cookies FILE   Path to cookies.txt (default: ./cookies.txt)
#   -l, --language LANG  Subtitle language (default: en)
#   -o, --output DIR     Output directory (default: ./transcripts)
#   -h, --help           Show this help
#
# Examples:
#   ./extract-youtube-captions.sh
#   ./extract-youtube-captions.sh -c ~/cookies.txt
#   ./extract-youtube-captions.sh "https://youtube.com/playlist?list=..."
#
# Prerequisites:
#   - yt-dlp (pip install yt-dlp)

set -euo pipefail

# Defaults
PLAYLIST_URL="https://www.youtube.com/playlist?list=PL3KSApovQlbnOM2QWLWQgg_Bd_qhPusxR"
COOKIES_FILE="./cookies.txt"
SUB_LANG="en"
OUTPUT_DIR="./transcripts"

# Colors
if [ -t 1 ]; then
    BOLD='\033[1m' RED='\033[31m' GREEN='\033[32m'
    YELLOW='\033[33m' CYAN='\033[36m' RESET='\033[0m'
else
    BOLD='' RED='' GREEN='' YELLOW='' CYAN='' RESET=''
fi

log_info()    { echo -e "${CYAN}[INFO]${RESET} $*" >&2; }
log_warn()    { echo -e "${YELLOW}[WARN]${RESET} $*" >&2; }
log_error()   { echo -e "${RED}[ERROR]${RESET} $*" >&2; }
log_success() { echo -e "${GREEN}[ OK ]${RESET} $*" >&2; }

show_usage() { sed -n '2,/^[^#]/{ /^#/s/^# \{0,1\}//p; }' "$0"; }

while [[ $# -gt 0 ]]; do
    case "$1" in
        -c|--cookies)  COOKIES_FILE="$2"; shift 2 ;;
        -l|--language) SUB_LANG="$2"; shift 2 ;;
        -o|--output)   OUTPUT_DIR="$2"; shift 2 ;;
        -h|--help)     show_usage; exit 0 ;;
        -*)            log_error "Unknown: $1"; show_usage; exit 1 ;;
        *)             PLAYLIST_URL="$1"; shift ;;
    esac
done

if ! command -v yt-dlp >/dev/null 2>&1; then
    log_error "yt-dlp not found. Install: pip install yt-dlp"
    exit 1
fi

mkdir -p "$OUTPUT_DIR"

echo -e "${BOLD}YouTube Caption Extractor${RESET}" >&2
log_info "Playlist: $PLAYLIST_URL"
log_info "Language: $SUB_LANG"
log_info "Output:   $OUTPUT_DIR/"
echo "" >&2

# Build yt-dlp command
CMD=(yt-dlp
    --yes-playlist
    --skip-download
    --write-auto-sub
    --sub-lang "$SUB_LANG"
    --convert-subs srt
    --restrict-filenames
    -o "$OUTPUT_DIR/%(playlist_index)03d_-_%(title)s.%(ext)s"
    --ignore-errors
    --no-overwrites
)

# Add cookies if file exists
if [ -f "$COOKIES_FILE" ]; then
    CMD+=(--cookies "$COOKIES_FILE")
    log_info "Using cookies: $COOKIES_FILE"
else
    log_warn "No cookies file found ($COOKIES_FILE) — trying without auth"
fi

CMD+=("$PLAYLIST_URL")

log_info "Downloading captions..."
echo "" >&2

"${CMD[@]}" 2>&1 | tee "$OUTPUT_DIR/captions.log"

echo "" >&2

# Convert SRT files to clean text
log_info "Converting SRT to clean text..."
SRT_COUNT=0
for srt_file in "$OUTPUT_DIR"/*.srt; do
    [ -f "$srt_file" ] || continue
    txt_file="${srt_file%.srt}.txt"

    # Strip SRT formatting: remove sequence numbers, timestamps, blank lines, <tags>
    sed -E '
        /^[0-9]+$/d
        /^[0-9]{2}:[0-9]{2}:[0-9]{2}/d
        /^$/d
        s/<[^>]+>//g
    ' "$srt_file" | awk '!seen[$0]++' > "$txt_file"

    rm "$srt_file"
    SRT_COUNT=$((SRT_COUNT + 1))
    log_success "Converted: $(basename "$txt_file")"
done

echo "" >&2
if [ "$SRT_COUNT" -gt 0 ]; then
    log_success "Done! Extracted $SRT_COUNT transcript(s) to $OUTPUT_DIR/"
else
    log_warn "No captions were found. Videos may not have auto-captions."
    log_warn "Try the browser recording approach instead:"
    log_warn "  1. Open tools/youtube-recorder.html in Chrome"
    log_warn "  2. Record each lesson"
    log_warn "  3. Run: bash tools/transcribe-recordings.sh"
fi

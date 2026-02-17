#!/usr/bin/env bash
#
# youtube-audio-download.sh — Download YouTube playlist audio and transcribe with Whisper
#
# Usage:
#   ./youtube-audio-download.sh [OPTIONS] [PLAYLIST_URL]
#
# Options:
#   -c, --cookies FILE       Path to cookies.txt (default: ./cookies.txt)
#   -m, --model MODEL        Whisper model size: tiny|base|small|medium|large (default: medium)
#   -l, --language LANG      Whisper language code (default: en)
#   -o, --output-dir DIR     Base output directory (default: current directory)
#   -d, --download-only      Download audio only, skip transcription
#   -t, --transcribe-only    Transcribe existing audio only, skip download
#   -h, --help               Show this help message
#
# Examples:
#   ./youtube-audio-download.sh
#   ./youtube-audio-download.sh -c ~/cookies.txt -m large "https://youtube.com/playlist?list=..."
#   ./youtube-audio-download.sh --download-only
#   ./youtube-audio-download.sh --transcribe-only -m tiny
#
# Prerequisites:
#   - yt-dlp        (pip install yt-dlp)
#   - openai-whisper (pip install openai-whisper)
#   - ffmpeg         (apt install ffmpeg / brew install ffmpeg)
#   - cookies.txt    (export from browser using a cookies.txt extension)
#
# Resume support:
#   Re-run the same command to resume. Downloads track progress via downloaded.txt
#   (yt-dlp archive). Transcription skips files that already have a non-empty .txt output.

set -euo pipefail

# -------------------------------------------------------------------
# Defaults
# -------------------------------------------------------------------
DEFAULT_PLAYLIST_URL="https://www.youtube.com/playlist?list=PL3KSApovQlbnOM2QWLWQgg_Bd_qhPusxR"
DEFAULT_COOKIES="./cookies.txt"
DEFAULT_MODEL="medium"
DEFAULT_LANGUAGE="en"
DEFAULT_OUTPUT_DIR="."

# -------------------------------------------------------------------
# Colors (TTY-aware)
# -------------------------------------------------------------------
if [ -t 1 ]; then
    BOLD='\033[1m'
    RED='\033[31m'
    GREEN='\033[32m'
    YELLOW='\033[33m'
    CYAN='\033[36m'
    RESET='\033[0m'
else
    BOLD='' RED='' GREEN='' YELLOW='' CYAN='' RESET=''
fi

# -------------------------------------------------------------------
# Logging
# -------------------------------------------------------------------
log_info()    { echo -e "${CYAN}[INFO]${RESET} $*" >&2; }
log_warn()    { echo -e "${YELLOW}[WARN]${RESET} $*" >&2; }
log_error()   { echo -e "${RED}[ERROR]${RESET} $*" >&2; }
log_success() { echo -e "${GREEN}[OK]${RESET} $*" >&2; }

# -------------------------------------------------------------------
# show_usage — print the header comment block
# -------------------------------------------------------------------
show_usage() {
    sed -n '2,/^[^#]/{ /^#/s/^# \{0,1\}//p; }' "$0"
}

# -------------------------------------------------------------------
# check_prerequisites — verify required tools are installed
# -------------------------------------------------------------------
check_prerequisites() {
    local missing=()
    command -v yt-dlp  >/dev/null 2>&1 || missing+=("yt-dlp")
    command -v whisper >/dev/null 2>&1 || missing+=("whisper (pip install openai-whisper)")
    command -v ffmpeg  >/dev/null 2>&1 || missing+=("ffmpeg")

    if [ ${#missing[@]} -gt 0 ]; then
        log_error "Missing required tools: ${missing[*]}"
        echo "" >&2
        echo "Install with:" >&2
        echo "  pip install yt-dlp openai-whisper" >&2
        echo "  apt install ffmpeg   # or: brew install ffmpeg" >&2
        exit 1
    fi
}

# -------------------------------------------------------------------
# parse_args — parse command-line options
# -------------------------------------------------------------------
parse_args() {
    PLAYLIST_URL="$DEFAULT_PLAYLIST_URL"
    COOKIES_FILE="$DEFAULT_COOKIES"
    WHISPER_MODEL="$DEFAULT_MODEL"
    WHISPER_LANGUAGE="$DEFAULT_LANGUAGE"
    OUTPUT_DIR="$DEFAULT_OUTPUT_DIR"
    DOWNLOAD_ONLY=false
    TRANSCRIBE_ONLY=false

    while [[ $# -gt 0 ]]; do
        case "$1" in
            -c|--cookies)         COOKIES_FILE="$2"; shift 2 ;;
            -m|--model)           WHISPER_MODEL="$2"; shift 2 ;;
            -l|--language)        WHISPER_LANGUAGE="$2"; shift 2 ;;
            -o|--output-dir)      OUTPUT_DIR="$2"; shift 2 ;;
            -d|--download-only)   DOWNLOAD_ONLY=true; shift ;;
            -t|--transcribe-only) TRANSCRIBE_ONLY=true; shift ;;
            -h|--help)            show_usage; exit 0 ;;
            -*)                   log_error "Unknown option: $1"; show_usage; exit 1 ;;
            *)                    PLAYLIST_URL="$1"; shift ;;
        esac
    done

    # Derived paths
    AUDIO_DIR="$OUTPUT_DIR/audio"
    TRANSCRIPT_DIR="$OUTPUT_DIR/transcripts"
    DOWNLOAD_ARCHIVE="$OUTPUT_DIR/downloaded.txt"
    FAILED_LOG="$OUTPUT_DIR/failed.log"
}

# -------------------------------------------------------------------
# download_playlist — download all audio from the playlist via yt-dlp
# -------------------------------------------------------------------
download_playlist() {
    if [ ! -f "$COOKIES_FILE" ]; then
        log_error "Cookies file not found: $COOKIES_FILE"
        log_error "Export cookies from your browser using a cookies.txt extension."
        exit 1
    fi

    log_info "Starting playlist download..."
    log_info "Playlist: $PLAYLIST_URL"
    log_info "Cookies:  $COOKIES_FILE"
    log_info "Output:   $AUDIO_DIR/"
    log_info "Archive:  $DOWNLOAD_ARCHIVE"
    echo "" >&2

    yt-dlp \
        --cookies "$COOKIES_FILE" \
        --yes-playlist \
        -x \
        --audio-format mp3 \
        --audio-quality 0 \
        --restrict-filenames \
        -o "$AUDIO_DIR/%(playlist_index)03d_-_%(title)s.%(ext)s" \
        --download-archive "$DOWNLOAD_ARCHIVE" \
        --no-overwrites \
        --ignore-errors \
        --retries 3 \
        --retry-sleep 5 \
        --sleep-interval 2 \
        --max-sleep-interval 5 \
        --progress \
        "$PLAYLIST_URL" \
        2>&1 | tee -a "$OUTPUT_DIR/yt-dlp.log"

    local exit_code=${PIPESTATUS[0]}
    if [ "$exit_code" -ne 0 ]; then
        log_warn "yt-dlp exited with code $exit_code. Some videos may have failed."
        log_warn "Check $OUTPUT_DIR/yt-dlp.log for details."
    else
        log_success "Download phase complete."
    fi
}

# -------------------------------------------------------------------
# transcribe_all — transcribe every MP3 in the audio directory
# -------------------------------------------------------------------
transcribe_all() {
    local mp3_files=()
    while IFS= read -r -d '' file; do
        mp3_files+=("$file")
    done < <(find "$AUDIO_DIR" -maxdepth 1 -name "*.mp3" -type f -print0 | sort -z)

    local total=${#mp3_files[@]}
    if [ "$total" -eq 0 ]; then
        log_warn "No MP3 files found in $AUDIO_DIR/"
        return 1
    fi

    log_info "Found $total MP3 file(s) to transcribe."
    log_info "Whisper model: $WHISPER_MODEL | Language: $WHISPER_LANGUAGE"
    log_info "Output: $TRANSCRIPT_DIR/"
    echo "" >&2

    local current=0
    local skipped=0
    local succeeded=0
    local failed=0

    for mp3_file in "${mp3_files[@]}"; do
        current=$((current + 1))
        local basename
        basename=$(basename "$mp3_file" .mp3)
        local transcript_file="$TRANSCRIPT_DIR/${basename}.txt"

        # Resume: skip if transcript already exists and is non-empty
        if [ -f "$transcript_file" ] && [ -s "$transcript_file" ]; then
            log_info "[$current/$total] Skipping (already transcribed): $basename"
            skipped=$((skipped + 1))
            continue
        fi

        log_info "[$current/$total] Transcribing: $basename"

        if whisper "$mp3_file" \
            --model "$WHISPER_MODEL" \
            --language "$WHISPER_LANGUAGE" \
            --output_format txt \
            --output_dir "$TRANSCRIPT_DIR/" \
            2>&1 | tee -a "$OUTPUT_DIR/whisper.log"; then
            log_success "[$current/$total] Done: $basename"
            succeeded=$((succeeded + 1))
        else
            log_error "[$current/$total] Failed: $basename"
            echo "$(date '+%Y-%m-%d %H:%M:%S') TRANSCRIBE_FAIL $mp3_file" >> "$FAILED_LOG"
            failed=$((failed + 1))
        fi
    done

    echo "" >&2
    log_info "--- Transcription Summary ---"
    log_info "  Total:     $total"
    log_success "  Succeeded: $succeeded"
    [ "$skipped" -gt 0 ] && log_info "  Skipped:   $skipped (already done)"
    [ "$failed" -gt 0 ]  && log_warn "  Failed:    $failed (see $FAILED_LOG)"
}

# -------------------------------------------------------------------
# main — entry point
# -------------------------------------------------------------------
main() {
    parse_args "$@"

    echo -e "${BOLD}YouTube Playlist Audio Downloader & Transcriber${RESET}" >&2
    echo "" >&2

    check_prerequisites

    # Create output directories
    mkdir -p "$AUDIO_DIR" "$TRANSCRIPT_DIR"

    # Phase 1: Download
    if [ "$TRANSCRIBE_ONLY" = false ]; then
        download_playlist
    else
        log_info "Skipping download phase (--transcribe-only)"
    fi

    echo "" >&2

    # Phase 2: Transcribe
    if [ "$DOWNLOAD_ONLY" = false ]; then
        transcribe_all
    else
        log_info "Skipping transcription phase (--download-only)"
    fi

    echo "" >&2
    log_success "All done!"
}

main "$@"

#!/usr/bin/env bash
#
# transcribe-recordings.sh — Batch-transcribe recorded audio files with Whisper
#
# Usage:
#   ./transcribe-recordings.sh [OPTIONS] [INPUT_DIR]
#
# Options:
#   -m, --model MODEL    Whisper model: tiny|base|small|medium|large (default: medium)
#   -l, --language LANG  Language code (default: en)
#   -o, --output DIR     Output directory for transcripts (default: ./transcripts)
#   -b, --batch SIZE     Batch size — save/commit after this many files (default: 5)
#   -h, --help           Show this help message
#
# Examples:
#   ./transcribe-recordings.sh ~/Downloads        # Transcribe all audio in ~/Downloads
#   ./transcribe-recordings.sh -m tiny -b 3       # Use tiny model, batch of 3
#   ./transcribe-recordings.sh recordings/         # Transcribe the recordings/ folder
#
# Supported formats: .webm, .mp3, .wav, .m4a, .ogg, .flac
#
# Resume support: Skips files that already have a transcript in the output dir.

set -euo pipefail

# -------------------------------------------------------------------
# Defaults
# -------------------------------------------------------------------
DEFAULT_MODEL="medium"
DEFAULT_LANGUAGE="en"
DEFAULT_OUTPUT="./transcripts"
DEFAULT_BATCH=5
DEFAULT_INPUT="./recordings"

# -------------------------------------------------------------------
# Colors
# -------------------------------------------------------------------
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

# -------------------------------------------------------------------
# Parse args
# -------------------------------------------------------------------
MODEL="$DEFAULT_MODEL"
LANGUAGE="$DEFAULT_LANGUAGE"
OUTPUT_DIR="$DEFAULT_OUTPUT"
BATCH_SIZE="$DEFAULT_BATCH"
INPUT_DIR="$DEFAULT_INPUT"

while [[ $# -gt 0 ]]; do
    case "$1" in
        -m|--model)    MODEL="$2"; shift 2 ;;
        -l|--language) LANGUAGE="$2"; shift 2 ;;
        -o|--output)   OUTPUT_DIR="$2"; shift 2 ;;
        -b|--batch)    BATCH_SIZE="$2"; shift 2 ;;
        -h|--help)     show_usage; exit 0 ;;
        -*)            log_error "Unknown option: $1"; show_usage; exit 1 ;;
        *)             INPUT_DIR="$1"; shift ;;
    esac
done

# -------------------------------------------------------------------
# Checks
# -------------------------------------------------------------------
if ! command -v whisper >/dev/null 2>&1; then
    log_error "whisper not found. Install with: pip install openai-whisper"
    exit 1
fi
if ! command -v ffmpeg >/dev/null 2>&1; then
    log_error "ffmpeg not found. Install with: apt install ffmpeg (or brew install ffmpeg)"
    exit 1
fi
if [ ! -d "$INPUT_DIR" ]; then
    log_error "Input directory not found: $INPUT_DIR"
    log_error "Usage: $0 [OPTIONS] <directory-with-audio-files>"
    exit 1
fi

mkdir -p "$OUTPUT_DIR"

# -------------------------------------------------------------------
# Collect audio files
# -------------------------------------------------------------------
AUDIO_FILES=()
while IFS= read -r -d '' file; do
    AUDIO_FILES+=("$file")
done < <(find "$INPUT_DIR" -maxdepth 1 \( -name "*.webm" -o -name "*.mp3" -o -name "*.wav" -o -name "*.m4a" -o -name "*.ogg" -o -name "*.flac" \) -type f -print0 | sort -z)

TOTAL=${#AUDIO_FILES[@]}
if [ "$TOTAL" -eq 0 ]; then
    log_warn "No audio files found in $INPUT_DIR/"
    log_warn "Supported formats: .webm .mp3 .wav .m4a .ogg .flac"
    exit 1
fi

log_info "Found $TOTAL audio file(s) in $INPUT_DIR/"
log_info "Whisper model: $MODEL | Language: $LANGUAGE"
log_info "Output: $OUTPUT_DIR/ | Batch size: $BATCH_SIZE"
echo "" >&2

# -------------------------------------------------------------------
# Transcribe in batches
# -------------------------------------------------------------------
CURRENT=0
SKIPPED=0
SUCCEEDED=0
FAILED=0
BATCH_COUNT=0

for audio_file in "${AUDIO_FILES[@]}"; do
    CURRENT=$((CURRENT + 1))
    BASENAME=$(basename "$audio_file")
    STEM="${BASENAME%.*}"
    TRANSCRIPT_FILE="$OUTPUT_DIR/${STEM}.txt"

    # Resume: skip if transcript already exists
    if [ -f "$TRANSCRIPT_FILE" ] && [ -s "$TRANSCRIPT_FILE" ]; then
        log_info "[$CURRENT/$TOTAL] Skipping (already done): $BASENAME"
        SKIPPED=$((SKIPPED + 1))
        continue
    fi

    log_info "[$CURRENT/$TOTAL] Transcribing: $BASENAME"

    if whisper "$audio_file" \
        --model "$MODEL" \
        --language "$LANGUAGE" \
        --output_format txt \
        --output_dir "$OUTPUT_DIR/" \
        2>&1; then
        log_success "[$CURRENT/$TOTAL] Done: $BASENAME"
        SUCCEEDED=$((SUCCEEDED + 1))
        BATCH_COUNT=$((BATCH_COUNT + 1))
    else
        log_error "[$CURRENT/$TOTAL] Failed: $BASENAME"
        FAILED=$((FAILED + 1))
    fi

    # Batch checkpoint
    if [ "$BATCH_COUNT" -ge "$BATCH_SIZE" ]; then
        echo "" >&2
        log_success "--- Batch checkpoint: $SUCCEEDED transcribed so far ---"
        log_info "Transcripts saved in $OUTPUT_DIR/"
        echo "" >&2
        BATCH_COUNT=0
    fi
done

# -------------------------------------------------------------------
# Summary
# -------------------------------------------------------------------
echo "" >&2
echo -e "${BOLD}===== Transcription Summary =====${RESET}" >&2
log_info "  Total files:  $TOTAL"
log_success "  Succeeded:    $SUCCEEDED"
[ "$SKIPPED" -gt 0 ] && log_info "  Skipped:      $SKIPPED (already done)"
[ "$FAILED" -gt 0 ]  && log_warn "  Failed:       $FAILED"
log_info "  Transcripts:  $OUTPUT_DIR/"
echo "" >&2
log_success "All done!"

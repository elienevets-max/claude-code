#!/usr/bin/env bash
#
# merge-transcripts.sh — Merge new transcript .txt files into the Robotic Bible
#
# This script takes raw transcript files from claude-code/transcripts/ and:
#   1. Copies them into robotic-poker-dealer/transcripts/raw/
#   2. Maps each file to its correct lesson number
#   3. Generates an enhanced transcripts_organized.txt with ALL lessons
#   4. Builds the Robotic Bible chapters
#
# Usage (run from the claude-code root):
#   bash robotic-poker-dealer/merge-transcripts.sh
#
# Or specify a custom source directory:
#   bash robotic-poker-dealer/merge-transcripts.sh /path/to/transcript/files

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
RAW_DIR="$PROJECT_DIR/transcripts/raw"
BIBLE_DIR="$PROJECT_DIR/bible/chapters"
INDEX_FILE="$PROJECT_DIR/bible/ROBOTIC-BIBLE.md"

# Source: first argument, or default to ../transcripts/ relative to this project
SOURCE_DIR="${1:-$(cd "$SCRIPT_DIR/.." && pwd)/transcripts}"

# Colors
if [ -t 1 ]; then
    BOLD='\033[1m' GREEN='\033[32m' CYAN='\033[36m'
    YELLOW='\033[33m' RED='\033[31m' RESET='\033[0m'
else
    BOLD='' GREEN='' CYAN='' YELLOW='' RED='' RESET=''
fi

log_info()    { echo -e "${CYAN}[INFO]${RESET} $*"; }
log_success() { echo -e "${GREEN}[ OK ]${RESET} $*"; }
log_warn()    { echo -e "${YELLOW}[WARN]${RESET} $*"; }
log_error()   { echo -e "${RED}[ERROR]${RESET} $*"; }

echo -e "${BOLD}========================================${RESET}"
echo -e "${BOLD}  Robotic Bible — Transcript Merger${RESET}"
echo -e "${BOLD}========================================${RESET}"
echo ""

# -------------------------------------------------------------------
# Step 1: Find and copy transcript files
# -------------------------------------------------------------------
log_info "Looking for transcripts in: $SOURCE_DIR/"

if [ ! -d "$SOURCE_DIR" ]; then
    log_error "Source directory not found: $SOURCE_DIR"
    echo ""
    echo "Usage: bash merge-transcripts.sh [/path/to/transcripts]"
    echo ""
    echo "Expected locations:"
    echo "  - ../transcripts/          (claude-code/transcripts/)"
    echo "  - ./transcripts/raw/       (already in project)"
    exit 1
fi

# Count .txt files (exclude logs)
TXT_COUNT=$(find "$SOURCE_DIR" -maxdepth 1 -name "*.txt" ! -name "captions.log" ! -name "*.log" -type f 2>/dev/null | wc -l)

if [ "$TXT_COUNT" -eq 0 ]; then
    log_error "No .txt transcript files found in $SOURCE_DIR/"
    exit 1
fi

log_info "Found $TXT_COUNT transcript file(s)"

mkdir -p "$RAW_DIR"

COPIED=0
for txt_file in "$SOURCE_DIR"/*.txt; do
    [ -f "$txt_file" ] || continue
    filename=$(basename "$txt_file")

    # Skip log files
    case "$filename" in
        captions.log|*.log) continue ;;
    esac

    cp "$txt_file" "$RAW_DIR/$filename"
    COPIED=$((COPIED + 1))
done

log_success "Copied $COPIED file(s) → $RAW_DIR/"
echo ""

# -------------------------------------------------------------------
# Step 2: Generate organized transcript file
# -------------------------------------------------------------------
log_info "Generating organized transcript file..."

ORGANIZED_FILE="$PROJECT_DIR/transcripts/transcripts_organized_v2.txt"
mkdir -p "$PROJECT_DIR/transcripts"

cat > "$ORGANIZED_FILE" <<'HEADER'
================================================================================
ROBOTIC POKER DEALER — COMPLETE TRANSCRIPT KNOWLEDGE BASE
================================================================================
Source: TruePokerDealer YouTube Channel (Mark Shumaker)
Course: Professional Poker Dealer Training — 38 Lessons + Bonus Content
Generated: $(date '+%Y-%m-%d %H:%M:%S')
================================================================================

HEADER

# Define chapter groupings
declare -A CHAPTER_NAMES
CHAPTER_NAMES=(
    ["01"]="FOUNDATIONS — Shuffling, Card Handling & Grip"
    ["02"]="CHIP MASTERY — Cutting, Handling & Bank Work"
    ["03"]="MONEY OPERATIONS — Buy-Ins, Color Ups & Bank Fills"
    ["04"]="HAND MECHANICS — Rankings, Community Cards & Showdown"
    ["05"]="GAME FLOW — Cash Games, Betting & Making Change"
    ["06"]="RULES & EDGE CASES — Misdeals, Straddles & Button Movement"
    ["07"]="ADVANCED OPERATIONS — Side Pots, Floor Interaction & Game Management"
    ["08"]="GAME VARIANTS — Limit Hold'Em, Tournaments & Home Games"
    ["09"]="BONUS — Bomb Pots, PLO, Omaha 8 & Audition Tips"
)

declare -A CHAPTER_LESSONS
CHAPTER_LESSONS=(
    ["01"]="1 2 3 4"
    ["02"]="5 6 7"
    ["03"]="8 9 10 11 12 13 14 17"
    ["04"]="15 16 18 23"
    ["05"]="19 20 21 22 24 25"
    ["06"]="26 27 28 29 30"
    ["07"]="31 32 33 36"
    ["08"]="34 35 37 38"
    ["09"]="bonus"
)

for chapter_key in $(echo "${!CHAPTER_NAMES[@]}" | tr ' ' '\n' | sort); do
    chapter_name="${CHAPTER_NAMES[$chapter_key]}"
    echo "================================================================================" >> "$ORGANIZED_FILE"
    echo "CHAPTER $chapter_key: $chapter_name" >> "$ORGANIZED_FILE"
    echo "================================================================================" >> "$ORGANIZED_FILE"
    echo "" >> "$ORGANIZED_FILE"

    lesson_count=0
    for txt_file in "$RAW_DIR"/*.txt; do
        [ -f "$txt_file" ] || continue
        filename=$(basename "$txt_file")

        # Extract lesson number
        lesson_num=$(echo "$filename" | grep -oP '^\d+' | sed 's/^0*//')
        [ -z "$lesson_num" ] && lesson_num=0

        # Extract title from filename
        lesson_title=$(echo "$filename" | sed 's/^[0-9]*_-_//; s/\.en\.txt$//; s/\.txt$//; s/_/ /g')

        # Check if this lesson belongs in this chapter
        lesson_range="${CHAPTER_LESSONS[$chapter_key]}"
        belongs=false

        if [ "$chapter_key" = "09" ]; then
            # Bonus chapter: lessons > 38 or files with specific keywords
            if [ "$lesson_num" -gt 38 ] 2>/dev/null; then
                belongs=true
            fi
            if echo "$filename" | grep -qiE 'bomb|plo|omaha|audition|quartering|all.in.button'; then
                belongs=true
            fi
        else
            for ln in $lesson_range; do
                if [ "$lesson_num" = "$ln" ] 2>/dev/null; then
                    belongs=true
                    break
                fi
            done
        fi

        if [ "$belongs" = true ]; then
            echo "--- LESSON $lesson_num: $lesson_title ---" >> "$ORGANIZED_FILE"
            echo "" >> "$ORGANIZED_FILE"
            cat "$txt_file" >> "$ORGANIZED_FILE"
            echo "" >> "$ORGANIZED_FILE"
            echo "" >> "$ORGANIZED_FILE"
            lesson_count=$((lesson_count + 1))
        fi
    done

    if [ "$lesson_count" -eq 0 ]; then
        echo "(No transcripts found for this chapter yet)" >> "$ORGANIZED_FILE"
        echo "" >> "$ORGANIZED_FILE"
    else
        log_success "Chapter $chapter_key: $lesson_count lesson(s)"
    fi
done

log_success "Generated: $ORGANIZED_FILE"
echo ""

# -------------------------------------------------------------------
# Step 3: Build Bible chapters (Markdown)
# -------------------------------------------------------------------
log_info "Building Robotic Bible chapters..."
mkdir -p "$BIBLE_DIR"

for chapter_key in $(echo "${!CHAPTER_NAMES[@]}" | tr ' ' '\n' | sort); do
    chapter_name="${CHAPTER_NAMES[$chapter_key]}"
    chapter_file="$BIBLE_DIR/chapter-${chapter_key}.md"

    cat > "$chapter_file" <<CHHEADER
# Chapter $chapter_key: $chapter_name

> Auto-generated from TruePokerDealer course transcripts.
> Enhanced with robotics translation notes.

---

CHHEADER

    lesson_count=0
    for txt_file in "$RAW_DIR"/*.txt; do
        [ -f "$txt_file" ] || continue
        filename=$(basename "$txt_file")
        lesson_num=$(echo "$filename" | grep -oP '^\d+' | sed 's/^0*//')
        [ -z "$lesson_num" ] && lesson_num=0
        lesson_title=$(echo "$filename" | sed 's/^[0-9]*_-_//; s/\.en\.txt$//; s/\.txt$//; s/_/ /g')

        lesson_range="${CHAPTER_LESSONS[$chapter_key]}"
        belongs=false

        if [ "$chapter_key" = "09" ]; then
            if [ "$lesson_num" -gt 38 ] 2>/dev/null; then belongs=true; fi
            if echo "$filename" | grep -qiE 'bomb|plo|omaha|audition|quartering|all.in.button'; then belongs=true; fi
        else
            for ln in $lesson_range; do
                if [ "$lesson_num" = "$ln" ] 2>/dev/null; then belongs=true; break; fi
            done
        fi

        if [ "$belongs" = true ]; then
            echo "## Lesson $lesson_num: $lesson_title" >> "$chapter_file"
            echo "" >> "$chapter_file"
            # Add transcript content with blockquote formatting
            sed 's/^/> /' "$txt_file" >> "$chapter_file"
            echo "" >> "$chapter_file"
            echo "" >> "$chapter_file"
            echo "### Robotics Notes — Lesson $lesson_num" >> "$chapter_file"
            echo "" >> "$chapter_file"
            echo "| Human Action | Robot Equivalent | Sensor/Actuator | Priority |" >> "$chapter_file"
            echo "|---|---|---|---|" >> "$chapter_file"
            echo "| *Analyze transcript above* | | | |" >> "$chapter_file"
            echo "" >> "$chapter_file"
            echo "---" >> "$chapter_file"
            echo "" >> "$chapter_file"
            lesson_count=$((lesson_count + 1))
        fi
    done

    if [ "$lesson_count" -eq 0 ]; then
        echo "*No transcripts available for this chapter yet.*" >> "$chapter_file"
        echo "" >> "$chapter_file"
    fi
done

# -------------------------------------------------------------------
# Step 4: Generate master Bible index
# -------------------------------------------------------------------
cat > "$INDEX_FILE" <<'MASTERHEAD'
# The Robotic Poker Dealer Bible

> A comprehensive knowledge base for building a robotic poker dealer.
> Compiled from 38+ professional dealer training lessons by Mark Shumaker
> (TruePokerDealer) and enhanced with robotics engineering notes.

---

## Table of Contents

MASTERHEAD

for chapter_file in "$BIBLE_DIR"/chapter-*.md; do
    [ -f "$chapter_file" ] || continue
    chapter_name=$(basename "$chapter_file" .md)
    chapter_title=$(head -1 "$chapter_file" | sed 's/^# //')
    echo "- [${chapter_title}](chapters/${chapter_name}.md)" >> "$INDEX_FILE"
done

cat >> "$INDEX_FILE" <<'MASTERFOOTER'

---

## Knowledge Sources

| Source | Lessons | Status |
|--------|---------|--------|
| TruePokerDealer Main Course | 38 lessons | Transcribed |
| TruePokerDealer Bonus Content | 4 lessons | Transcribed |
| Elie's 10,000+ Hours Experience | Ongoing | In Progress |
| Robotics Engineering Research | Ongoing | In Progress |

## How to Use

1. **Read sequentially** for full dealer training knowledge
2. **Jump to chapters** for specific topics (chips, betting, tournaments)
3. **Fill in Robotics Notes** tables as you design hardware/software
4. **Cross-reference** with `src/deployment_bible.js` for technical specs

## Project Files

| File | Description |
|------|-------------|
| `src/deployment_bible.js` | Technical specification generator (DOCX) |
| `src/thesis_case_for_robotic_dealers.js` | Business thesis generator |
| `transcripts/all_transcripts.json` | Raw transcript data (JSON) |
| `transcripts/transcripts_organized.txt` | Original organized transcripts |
| `transcripts/transcripts_organized_v2.txt` | Enhanced with new lessons |
| `bible/chapters/` | This Bible — organized by topic |
MASTERFOOTER

log_success "Generated master index: $INDEX_FILE"
echo ""

# -------------------------------------------------------------------
# Summary
# -------------------------------------------------------------------
TOTAL_CHAPTERS=$(ls -1 "$BIBLE_DIR"/chapter-*.md 2>/dev/null | wc -l)
TOTAL_RAW=$(ls -1 "$RAW_DIR"/*.txt 2>/dev/null | wc -l)

echo -e "${BOLD}========================================${RESET}"
echo -e "${BOLD}           MERGE COMPLETE${RESET}"
echo -e "${BOLD}========================================${RESET}"
echo ""
echo -e "  Raw transcripts:  ${GREEN}$TOTAL_RAW${RESET}"
echo -e "  Bible chapters:   ${GREEN}$TOTAL_CHAPTERS${RESET}"
echo -e "  Organized file:   ${GREEN}$ORGANIZED_FILE${RESET}"
echo -e "  Bible index:      ${GREEN}$INDEX_FILE${RESET}"
echo ""
echo -e "Next steps:"
echo -e "  1. Review bible/chapters/ for accuracy"
echo -e "  2. Fill in the 'Robotics Notes' tables in each chapter"
echo -e "  3. Copy to your robotic-poker-dealer repo:"
echo -e "     ${CYAN}cp -r bible/ /path/to/robotic-poker-dealer/${RESET}"
echo -e "     ${CYAN}cp transcripts/transcripts_organized_v2.txt /path/to/robotic-poker-dealer/transcripts/${RESET}"
echo ""

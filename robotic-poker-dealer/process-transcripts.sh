#!/usr/bin/env bash
#
# process-transcripts.sh — Organize raw lesson transcripts into Robotic Bible chapters
#
# Usage:
#   bash process-transcripts.sh
#
# This script reads all .txt files from transcripts/raw/ and concatenates them
# into organized Bible chapter files based on lesson number ranges.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
RAW_DIR="$SCRIPT_DIR/transcripts/raw"
BIBLE_DIR="$SCRIPT_DIR/bible/chapters"

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

echo -e "${BOLD}=== Robotic Bible — Transcript Processor ===${RESET}"
echo ""

# Check for raw transcripts
if [ ! -d "$RAW_DIR" ] || [ -z "$(ls -A "$RAW_DIR"/*.txt 2>/dev/null)" ]; then
    echo -e "${RED}[ERROR]${RESET} No .txt files found in $RAW_DIR/"
    echo ""
    echo "To get started:"
    echo "  1. Copy your transcript .txt files into: transcripts/raw/"
    echo "  2. Files should be named like: 001_-_Lesson_Title.txt"
    echo "  3. Re-run this script"
    exit 1
fi

mkdir -p "$BIBLE_DIR"

# Count total transcripts
TOTAL=$(ls -1 "$RAW_DIR"/*.txt 2>/dev/null | wc -l)
log_info "Found $TOTAL transcript file(s) in $RAW_DIR/"
echo ""

# Chapter definitions: name, start_lesson, end_lesson
declare -A CHAPTERS
CHAPTERS=(
    ["01-foundations"]="1:5:Foundations — Card Handling, Shuffling & Deck Management"
    ["02-game-procedures"]="6:12:Game Procedures — Texas Hold'em Dealing & Hand Flow"
    ["03-betting-and-pots"]="13:18:Betting & Pots — Bet Sizing, Pot Management & Side Pots"
    ["04-table-management"]="19:24:Table Management — Chip Handling & Player Interaction"
    ["05-advanced-games"]="25:30:Advanced Games — Poker Variants & Other Card Games"
    ["06-casino-operations"]="31:36:Casino Operations — Floor Procedures, Fills & Credits"
    ["07-tournament-dealing"]="37:50:Tournament Dealing — Tournament Rules & Multi-Table"
)

# Process each chapter
for chapter_key in $(echo "${!CHAPTERS[@]}" | tr ' ' '\n' | sort); do
    IFS=':' read -r start end title <<< "${CHAPTERS[$chapter_key]}"

    chapter_file="$BIBLE_DIR/${chapter_key}.md"

    # Header
    cat > "$chapter_file" <<HEADER
# Chapter: $title

> Auto-generated from poker dealer training lessons $start-$end.
> Source: Professional Poker Dealer Training Course (YouTube)

---

HEADER

    lesson_count=0

    # Find matching transcript files by lesson number
    for txt_file in "$RAW_DIR"/*.txt; do
        [ -f "$txt_file" ] || continue
        filename=$(basename "$txt_file")

        # Extract lesson number from filename (e.g., "001_-_..." -> 1)
        lesson_num=$(echo "$filename" | grep -oP '^\d+' | sed 's/^0*//')
        [ -z "$lesson_num" ] && lesson_num=0

        if [ "$lesson_num" -ge "$start" ] && [ "$lesson_num" -le "$end" ]; then
            # Extract title from filename
            lesson_title=$(echo "$filename" | sed 's/^[0-9]*_-_//; s/\.txt$//; s/_/ /g')

            echo "## Lesson $lesson_num: $lesson_title" >> "$chapter_file"
            echo "" >> "$chapter_file"
            cat "$txt_file" >> "$chapter_file"
            echo "" >> "$chapter_file"
            echo "---" >> "$chapter_file"
            echo "" >> "$chapter_file"

            lesson_count=$((lesson_count + 1))
        fi
    done

    # Add robotics translation section
    cat >> "$chapter_file" <<ROBOTICS

## Robotics Translation

> Map human dealer actions from this chapter to robotic equivalents.
> Fill in as you design the robotic system.

| Human Action | Robotic Equivalent | Sensor/Actuator | Notes |
|---|---|---|---|
| *To be filled* | | | |

ROBOTICS

    if [ "$lesson_count" -gt 0 ]; then
        log_success "Chapter $chapter_key: $lesson_count lesson(s) → $chapter_file"
    else
        log_warn "Chapter $chapter_key: No lessons found (expected lessons $start-$end)"
        rm "$chapter_file"
    fi
done

echo ""

# Generate master Bible index
INDEX_FILE="$SCRIPT_DIR/bible/ROBOTIC-BIBLE.md"
cat > "$INDEX_FILE" <<'INDEX'
# The Robotic Poker Dealer Bible

> A comprehensive knowledge base for building a robotic poker dealer,
> compiled from professional dealer training and enhanced with robotics insights.

## Table of Contents

INDEX

for chapter_file in "$BIBLE_DIR"/*.md; do
    [ -f "$chapter_file" ] || continue
    chapter_name=$(basename "$chapter_file" .md)
    # Extract the title from the first line
    chapter_title=$(head -1 "$chapter_file" | sed 's/^# Chapter: //')
    echo "- [${chapter_title}](chapters/${chapter_name}.md)" >> "$INDEX_FILE"
done

cat >> "$INDEX_FILE" <<'FOOTER'

## How to Use This Bible

1. **Learning**: Read chapters sequentially to understand the full dealer workflow
2. **Reference**: Jump to specific chapters for particular game mechanics
3. **Robotics**: Each chapter has a "Robotics Translation" section for mapping to hardware
4. **Expansion**: Add new knowledge sources by placing transcripts in `transcripts/raw/`

## Knowledge Sources

- Professional Poker Dealer Training Course (41 lessons)
- *(Add more sources as they are processed)*
FOOTER

log_success "Generated master index: $INDEX_FILE"
echo ""
echo -e "${BOLD}Done! Your Robotic Bible is in: bible/${RESET}"
echo "  - Master index: bible/ROBOTIC-BIBLE.md"
echo "  - Chapters:     bible/chapters/"

# Robotic Poker Dealer — Project Bible

## Project Overview

This project aims to build a comprehensive knowledge base (the "Robotic Bible") for
designing and programming a robotic poker dealer. The knowledge is extracted from
a 41-lesson professional poker dealer training course and enhanced with robotics,
automation, and computer vision insights.

## Directory Structure

```
robotic-poker-dealer/
├── CLAUDE.md              # This file — project instructions
├── bible/                 # The Robotic Bible — organized knowledge
│   ├── chapters/          # Chapters organized by topic
│   └── appendix/          # Quick-reference tables, glossary
├── docs/                  # Design documents, architecture notes
├── research/              # External research, papers, references
├── src/                   # Source code (future robotics code)
├── transcripts/
│   └── raw/               # Raw transcript .txt files from YouTube lessons
└── process-transcripts.sh # Script to organize raw transcripts into Bible chapters
```

## Bible Chapters

| # | Chapter | Covers Lessons | Topic |
|---|---------|---------------|-------|
| 1 | Foundations | 1-5 | Card handling, shuffling, deck management |
| 2 | Game Procedures | 6-12 | Texas Hold'em dealing, hand flow |
| 3 | Betting & Pots | 13-18 | Bet sizing, pot management, side pots |
| 4 | Table Management | 19-24 | Chip handling, player interaction, seating |
| 5 | Advanced Games | 25-30 | Other poker variants, blackjack dealing |
| 6 | Casino Operations | 31-36 | Floor procedures, fills, credits |
| 7 | Tournament Dealing | 37-41 | Tournament rules, multi-table, final table |

## Workflow

1. Place raw transcript `.txt` files in `transcripts/raw/`
2. Run `bash process-transcripts.sh` to generate organized Bible chapters
3. Each chapter combines related lessons with robotics annotations
4. The Bible grows as new knowledge sources are added

## Robotics Annotations

Each chapter includes a `## Robotics Translation` section that maps human dealer
actions to robotic equivalents:

- **Hand movements** → Servo/gripper actions
- **Visual checks** → Computer vision tasks
- **Verbal announcements** → Text-to-speech / display output
- **Decision logic** → State machine / rule engine

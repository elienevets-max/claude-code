# The Robotic Poker Dealer Bible

> A comprehensive knowledge base for building a robotic poker dealer.
> Compiled from 38+ professional dealer training lessons by Mark Shumaker
> (TruePokerDealer) and enhanced with robotics engineering notes.
>
> **Author:** Elie — Professional poker player (10,000+ hours, $800K+ live cash)
> **Version:** 2.0 — February 2026

---

## Table of Contents

1. [Chapter 01: Foundations — Shuffling, Card Handling & Grip](chapters/chapter-01.md)
2. [Chapter 02: Chip Mastery — Cutting, Handling & Bank Work](chapters/chapter-02.md)
3. [Chapter 03: Money Operations — Buy-Ins, Color Ups & Bank Fills](chapters/chapter-03.md)
4. [Chapter 04: Hand Mechanics — Rankings, Community Cards & Showdown](chapters/chapter-04.md)
5. [Chapter 05: Game Flow — Cash Games, Betting & Making Change](chapters/chapter-05.md)
6. [Chapter 06: Rules & Edge Cases — Misdeals, Straddles & Button Movement](chapters/chapter-06.md)
7. [Chapter 07: Advanced Operations — Side Pots, Floor Interaction & Game Management](chapters/chapter-07.md)
8. [Chapter 08: Game Variants — Limit Hold'Em, Tournaments & Home Games](chapters/chapter-08.md)
9. [Chapter 09: Bonus — Bomb Pots, PLO, Omaha 8 & Audition Tips](chapters/chapter-09.md)

---

## Lesson-to-Chapter Map

| Lesson | Title | Chapter | Robotics Priority |
|--------|-------|---------|-------------------|
| 1 | How to Shuffle Cards | 01 | CRITICAL — Card randomization |
| 2 | Train With Me | 01 | Medium — Practice routines |
| 3 | The Poker Pitch — Mechanics | 01 | CRITICAL — Card delivery |
| 4 | The Poker Pitch — Situations | 01 | HIGH — Edge case handling |
| 5a | How to Cut Chips | 02 | HIGH — Chip manipulation |
| 5b | Chip Cutting Important Detail | 02 | HIGH — Precision cutting |
| 6 | How to Handle Chips | 02 | HIGH — Dexterity |
| 7 | Working in the Bank | 02 | CRITICAL — Money handling |
| 8 | Bank Maintenance Part 1 | 03 | Medium — Inventory mgmt |
| 9 | Bank Maintenance Part 2 | 03 | Medium — Inventory mgmt |
| 10 | Buy Ins Part 1 | 03 | HIGH — Transaction processing |
| 11 | Buy Ins Part 2 | 03 | HIGH — Transaction processing |
| 12 | Craziest Cash Buy In | 03 | LOW — Edge case study |
| 13 | Cheque Change & Color Ups Part 1 | 03 | HIGH — Denomination logic |
| 14 | Cheque Change & Color Ups Part 2 | 03 | HIGH — Denomination logic |
| 15 | Poker Hand Rankings | 04 | CRITICAL — Hand evaluation |
| 16 | Poker Hand Examples | 04 | CRITICAL — Hand evaluation |
| 17 | Bank Fill | 03 | Medium — Resupply protocol |
| 18 | Flop, Turn & River | 04 | CRITICAL — Community cards |
| 19 | Hand of 1-2 NL Hold'Em | 05 | HIGH — Full hand simulation |
| 20 | Two Fundamental Rules | 05 | CRITICAL — Core logic |
| 21 | Cash Games | 05 | HIGH — Game flow state machine |
| 22 | Bets, Calls & Making Change | 05 | CRITICAL — Bet processing |
| 23 | The Showdown | 04 | CRITICAL — Winner determination |
| 24-25 | Rake, Promo Drop, Tips | 05 | HIGH — Revenue collection |
| 26-27 | Technical Rules of Betting | 06 | CRITICAL — Rule engine |
| 28 | Misdeals Part 1 | 06 | CRITICAL — Error recovery |
| 28.2 | Action Out of Turn | 06 | HIGH — Sequence enforcement |
| 29 | Straddles & Kills | 06 | HIGH — Variant bet structures |
| 30 | Button Movement & Missed Blinds | 06 | CRITICAL — Position tracking |
| 31 | How to Run Your Game | 07 | HIGH — Game management AI |
| 32 | Side Pots & Multi-Way All-Ins | 07 | CRITICAL — Pot calculation |
| 33 | Interacting with the Floor | 07 | Medium — Communication |
| 34 | Limit Texas Hold'Em | 08 | HIGH — Variant support |
| 35 | Texas Hold'Em Tournaments | 08 | HIGH — Tournament mode |
| 36 | Things I Missed | 07 | Medium — Gap coverage |
| 37 | How to Run a Tournament | 08 | HIGH — Tournament operations |
| 38 | Running Home Games | 08 | LOW — Informal setting |

---

## Robotics Requirements Summary

### CRITICAL Systems (Must-Have for MVP)

| System | Lessons | What Robot Needs |
|--------|---------|------------------|
| Card Shuffling | 1, 2 | Riffle mechanism, wash randomization, cut card placement |
| Card Pitch | 3, 4 | Precision card delivery to 2-10 player positions |
| Hand Evaluation | 15, 16, 23 | Real-time 5-card hand ranking algorithm |
| Community Cards | 18 | Burn-and-turn protocol, card shielding |
| Bet Processing | 22, 26-27 | Stack counting, change making, bet validation |
| Pot Calculation | 32 | Multi-way side pot math, split pot handling |
| Button Tracking | 30 | Positional state machine, missed blind logic |
| Error Recovery | 28 | Misdeal detection, exposed card procedures |
| Rule Engine | 20, 26-27 | Core dealing rules as state transitions |

### HIGH Priority Systems

| System | Lessons | What Robot Needs |
|--------|---------|------------------|
| Chip Manipulation | 5a, 5b, 6 | Gripper dexterity for cutting, stacking, counting |
| Bank Management | 7, 8, 9, 17 | Chip inventory tracking, fill requests |
| Transaction Processing | 10, 11, 13, 14 | Buy-in handling, denomination conversion |
| Game Flow | 19, 21 | Full hand lifecycle state machine |
| Revenue Collection | 24-25 | Rake calculation, promo drop, tip handling |
| Variant Support | 29, 34 | Straddles, kills, limit betting structure |
| Tournament Mode | 35, 37 | Blind level management, color-ups, table breaks |

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
5. **Run `bash merge-transcripts.sh`** to rebuild chapters from raw transcripts

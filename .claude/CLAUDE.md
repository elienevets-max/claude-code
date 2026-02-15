# Project Instructions for Claude Code

## Skill Discovery — READ THIS FIRST

When the user asks about available skills, what skills exist, or anything related to
discovering capabilities in this repository, you MUST read `/skills_index.md` at the
repository root. This file is the **master index** of all skills and contains:

- A quick-reference table of every skill with file paths
- Skills organized by category, source, and situation
- A key frameworks index (33+ frameworks)
- 85+ searchable tags

**Do not rely on memory or partial information.** Always read `skills_index.md` in full
so you can list all skills accurately.

## Repository Overview

This is a personal knowledge base and operations hub organized into the following
skill categories:

| Category | Directory | Description |
|----------|-----------|-------------|
| Business & Finance | `business/`, `finance/` | Business fundamentals, marketing psychology, validation, personal finance, career strategy |
| King of Sparklers | `king-of-sparklers/` | Full-stack Next.js e-commerce dashboard for the King of Sparklers company |
| Learning & Research | `learning/` | Rapid skill acquisition frameworks and learning methodology |
| Entrepreneurship | `entrepreneurship/` | Startup playbooks, scaling strategies, AI-era business, e-commerce |
| Side Hustles & TikTok | `side-hustles/`, `tiktok/` | Low-barrier business ideas, TikTok growth and marketing systems |

## How Skills Work

Skills are invoked using `/<skill-name>` commands (e.g., `/business-fundamentals`,
`/personal-finance-blueprint`). Each skill loads a specialized knowledge module from
its corresponding markdown file.

## Searching Skills

Use the `skills_lookup.sh` script at the repository root to search skills by keyword:

```
./skills_lookup.sh                      # List all skills
./skills_lookup.sh <keyword>            # Search by keyword or tag
./skills_lookup.sh --tags               # Show all available tags
./skills_lookup.sh --frameworks         # Show all major frameworks
./skills_lookup.sh --situation "..."    # Find a skill by situation
```

## Main Repository Directories

- `business/` — Business fundamentals, marketing psychology, validation playbooks
- `finance/` — Personal finance, money psychology, career strategy
- `king-of-sparklers/` — Next.js e-commerce application (company operations)
- `learning/` — Rapid skill acquisition and learning frameworks
- `entrepreneurship/` — Startup playbooks, scaling, AI-era strategy
- `side-hustles/` — Low-barrier business testing and side income strategies
- `tiktok/` — TikTok growth, marketing execution, and content systems

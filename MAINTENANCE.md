# Maintenance Guide

How to maintain, extend, and update this knowledge base.

---

## Adding a New Skill

### 1. Choose the right category directory

| Directory | Use for |
|-----------|---------|
| `business/` | Foundational business concepts, marketing, validation |
| `entrepreneurship/` | Starting, scaling, funding, exiting businesses |
| `finance/` | Personal finance, investing, money psychology |
| `side-hustles/` | Low-barrier business ideas, rapid testing |
| `learning/` | Skill acquisition, productivity, learning methods |

If none of these fit, create a new directory with a lowercase, hyphenated name (e.g., `leadership/`, `product-design/`).

### 2. Create the file

Use lowercase, hyphenated filenames: `topic-name.md`

### 3. Add the metadata header

Every file must start with the title, then a metadata block in this exact format:

```markdown
# Title of the Skill

> **Purpose:** One-sentence description of what this module does.
>
> | | |
> |---|---|
> | **Inputs** | What you need before using this |
> | **Outputs** | What you get after using this |
> | **Dependencies** | Links to prerequisite modules (or "None") |
> | **Example Usage** | 1-2 questions this answers, in italics |
> | **Related Files** | Links to complementary modules |
> | **Source** | Author — *Book/Podcast Title* |
> | **Tags** | Backtick-wrapped, space-separated tags |

---
```

### 4. Update the skills index

Edit `skills_index.md` and add entries in these sections:

1. **Quick Reference table** — add a row with the new skill number
2. **By Category section** — add a detailed entry under the right category
3. **By Source table** — add or update the source row
4. **By Situation table** — add 1-2 situations where this skill applies
5. **Key Frameworks Index** — add any new frameworks
6. **All Tags** — add any new tags (keep alphabetical)
7. **Directory Structure** — update the tree if you added a new directory
8. **Footer** — update the total counts

### 5. Update the lookup script

Edit `skills_lookup.sh` and update:

1. `show_all()` — add the new skill to the categorized list
2. `show_frameworks()` — add any new frameworks
3. `show_tags()` — add any new tags

### 6. Update README.md

Add the new skill to the appropriate category section in `README.md`.

---

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Directories | Lowercase, hyphenated | `side-hustles/` |
| Files | Lowercase, hyphenated, `.md` | `business-validation-playbook.md` |
| Tags | Lowercase, hyphenated, backtick-wrapped | `` `risk-management` `` |
| Titles | Title Case | `# The Entrepreneurship Playbook` |
| Internal links | Relative paths | `[text](../business/file.md)` |

---

## Linking Between Files

Use relative paths so links work both on GitHub and locally:

- Same directory: `[text](other-file.md)`
- Different directory: `[text](../other-dir/file.md)`

---

## When to Create a New Category

Create a new top-level directory when:

1. You have 2+ files that share a theme not covered by existing categories
2. The new theme is clearly distinct from all existing categories
3. The category name is self-explanatory

Do NOT create a new category for a single file. Place it in the closest existing category instead.

---

## Quality Checklist

Before committing a new skill, verify:

- [ ] Metadata header is complete (all 7 fields filled)
- [ ] All internal links resolve correctly
- [ ] Tags are consistent with existing tag vocabulary
- [ ] `skills_index.md` is updated in all relevant sections
- [ ] `skills_lookup.sh` reflects the new skill
- [ ] `README.md` includes the new skill
- [ ] No duplicate content with existing files
- [ ] Source is attributed

---

## Asking "What skills do we have?"

Three ways to get the full categorized list:

1. **Read the index:** Open `skills_index.md`
2. **Run the CLI:** `./skills_lookup.sh`
3. **Search by keyword:** `./skills_lookup.sh marketing`

---

*This guide should be updated whenever the structure or conventions change.*

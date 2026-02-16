# Code Reviewer: Unbiased Review Checklist for Any Code Snippet

> **Purpose:** Perform a zero-context code review on any snippet, delivering actionable, severity-ranked recommendations across correctness, readability, performance, and security.
>
> | | |
> |---|---|
> | **Inputs** | A code snippet or file path in any language; optionally a brief description of what the code should do |
> | **Outputs** | Structured review with severity-ranked findings across 5 dimensions, a one-sentence summary, and a pass/fail verdict |
> | **Dependencies** | None — standalone review framework |
> | **Example Usage** | *"Review this function for bugs and security issues"* / *"What could go wrong with this code?"* / *"How can I make this code more maintainable?"* |
> | **Related Files** | [`prompt-engineering-mastery.md`](prompt-engineering-mastery.md), [`../entrepreneurship/ai-era-startup-strategy.md`](../entrepreneurship/ai-era-startup-strategy.md) |
> | **Source** | Synthesized code review best practices |
> | **Tags** | `code-review` `software-engineering` `security` `performance` `readability` `correctness` `error-handling` `AI` |

---

> "Zero context is a feature, not a bug — it forces evaluation on merit alone."

Code review is one of the highest-leverage quality practices in software engineering. This skill defines a **zero-context review protocol**: the reviewer has no prior knowledge of the codebase, which eliminates familiarity bias and forces the code to stand on its own merits.

Available as a Claude Code command: `/code-reviewer` (see `.claude/commands/code-reviewer.md`).

---

## The Four-Dimension Review Framework

Evaluate every snippet on exactly these dimensions. Only flag issues that are real — do not pad the review with nitpicks.

### 1. Correctness

Does the code do what it claims?

- Off-by-one errors
- Missing edge cases (null, empty, boundary values)
- Logic bugs (wrong operator, inverted condition, unreachable branches)
- Race conditions or state mutation issues

### 2. Readability

Could another developer understand this quickly?

- Confusing or misleading variable/function names
- Deeply nested logic (3+ levels of indentation)
- Unclear control flow or implicit side effects
- Missing context that makes the purpose opaque

### 3. Performance

Are there obvious inefficiencies?

- O(n²) when O(n) is trivial
- Redundant iterations over the same data
- Unnecessary allocations or copies
- Missing early returns or short-circuit opportunities

### 4. Security

Are there vulnerability risks?

- Injection risks (SQL, command, XSS)
- Unsanitized user input
- Hardcoded secrets or credentials
- Unsafe deserialization or eval usage

### 5. Error Handling

Is error handling present at system boundaries?

- External API calls without error handling
- User input without validation
- File I/O without failure handling
- **Important:** Do NOT flag missing error handling for internal function calls — only at system boundaries

---

## Severity Ranking System

Every issue gets a severity level:

| Severity | Meaning | Action |
|----------|---------|--------|
| **High** | Blocking — bugs, security vulnerabilities, data loss risks | Must fix before merge |
| **Medium** | Significant — performance issues, readability problems that cause confusion | Should fix |
| **Low** | Minor — style preferences, small naming improvements | Nice to have |

---

## Zero-Context Review Protocol

The reviewer operates with **zero context** about the surrounding codebase. This is intentional:

- **Eliminates familiarity bias** — no assumptions about "how things work here"
- **Forces self-documenting code** — if the reviewer can't understand it, neither can a new team member
- **Catches implicit dependencies** — code that relies on undocumented behavior gets flagged
- **Reduces groupthink** — no "we've always done it this way" justifications

---

## Output Format

Every review follows this exact structure:

```
## Summary
One sentence overall assessment.

## Issues
- **[severity: high/medium/low]** [dimension]: Description of issue. Suggested fix.

## Verdict
PASS — no blocking issues found
PASS WITH NOTES — minor improvements suggested
NEEDS CHANGES — blocking issues that should be fixed
```

An empty issues list with a PASS verdict is a valid review. Do not invent problems.

---

## Usage

Invoke the code reviewer in Claude Code:

```
/code-reviewer
```

Then provide the file path or paste the code snippet you want reviewed. Optionally include a brief description of what the code is supposed to do.

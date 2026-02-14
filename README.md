# Business, Finance & Skill Acquisition

Practical frameworks extracted from podcast teachings by Josh Kaufman (The Personal MBA, The First 20 Hours), Ramit Sethi (I Will Teach You To Be Rich), Simon Squibb (serial entrepreneur, 19 companies, 78 startup investments), Chris from The Kerner Office (80+ businesses launched), and Morgan Housel (The Psychology of Money).

> **"What skills do we have?"** — Run `./skills_lookup.sh` or open [`skills_index.md`](skills_index.md) for the full categorized catalog.

---

## Contents

### Business & Marketing — [`business/`](business/)

| File | What It Covers |
|------|----------------|
| [Business Fundamentals](business/business-fundamentals.md) | The five parts of every business: Value Creation, Marketing, Sales, Value Delivery, and Finance. Includes the Iron Law of the Market, Gall's Law, and diagnostic questions for any business. |
| [Marketing Psychology](business/marketing-psychology.md) | The five core human drives, features vs benefits, counter-signaling strategy, the "Piss Off the 80%" rule, and sensory marketing principles. |
| [Business Validation Playbook](business/business-validation-playbook.md) | Step-by-step guide from problem discovery through sustainability decision. Includes the credit card test and experimentation framework. |

### Entrepreneurship — [`entrepreneurship/`](entrepreneurship/)

| File | What It Covers |
|------|----------------|
| [Entrepreneurship Playbook](entrepreneurship/entrepreneurship-playbook.md) | Starting a business with no money, the passion-first principle, mind maps vs business plans, finding purpose, co-founder selection, three-step sales process, and the staircase philosophy for PR. |
| [Scaling, Funding & Exiting](entrepreneurship/scaling-and-exiting.md) | Six ways to raise money, how to get sponsors, building brand, the 7-and-8 firing rule, going global, equity structures, SAFEs, and five exit strategies. |
| [AI-Era Startup Strategy](entrepreneurship/ai-era-startup-strategy.md) | The Founder's Triangle, the DREAM operating framework, three moats AI can't destroy, the 1000x cost collapse, and the regret minimization mindset. |

### Side Hustles — [`side-hustles/`](side-hustles/)

| File | What It Covers |
|------|----------------|
| [Side Hustle Playbook](side-hustles/side-hustle-playbook.md) | The copying framework, old vs new problems, the Facebook Marketplace validation test, mirage opportunities, three types of entrepreneurs, the equity trap, and 40+ business ideas at $500/$1,000/$5,000 budgets. |

### Personal Finance — [`finance/`](finance/)

| File | What It Covers |
|------|----------------|
| [Personal Finance Blueprint](finance/personal-finance-blueprint.md) | The conscious spending plan (four categories), investing fundamentals with target date funds, compound interest, hidden cost of fees, housing as investment, and account automation. |
| [Money Psychology & Rich Life](finance/money-psychology-and-rich-life.md) | How to define your rich life with specificity, childhood money scripts, Ramit's 10 money rules, talking about money with a partner, prenups, and wealth predictors. |
| [Psychology of Money](finance/psychology-of-money.md) | Why behavior beats intelligence with money. Experience asymmetry, compounding paradox, getting vs staying wealthy, tail events, survival mindset, room for error, and the barbell strategy. |

### Learning — [`learning/`](learning/)

| File | What It Covers |
|------|----------------|
| [Rapid Skill Acquisition](learning/rapid-skill-acquisition.md) | The 10 principles for learning anything in 20 hours. Covers the frustration barrier, the research trap, pre-commitment, and the explore/exploit trade-off. |

---

## Quick Start

```bash
# List all skills
./skills_lookup.sh

# Search by keyword
./skills_lookup.sh marketing

# List all frameworks
./skills_lookup.sh --frameworks

# Find by situation
./skills_lookup.sh --situation "I have a business idea"
```

---

## Key Takeaways

### Business & Marketing
1. **Every business has five parts** — Value Creation, Marketing, Sales, Value Delivery, Finance
2. **Understanding business is a superpower** — break down any organization into simple, actionable parts
3. **Start simple** — complex systems that work evolved from simpler systems that worked (Gall's Law)
4. **Validate with credit cards, not compliments** — pre-orders beat friend endorsements
5. **Hook into core human drives** — Acquire, Bond, Learn, Defend, Feel
6. **Be distinctive, not vanilla** — polarization beats lukewarm acceptance
7. **Experiment relentlessly** — but always collect feedback

### Entrepreneurship
8. **Start with passion, not an original idea** — 500 competitors is fine if you care more than all of them
9. **Delay gratification** — build value before monetizing
10. **Sell the sizzle, not the steak** — outcomes and philosophy, not features and specs
11. **Build a brand, not a business** — brands get bought; businesses get commoditized
12. **Give equity to your team** — aligned incentives beat management stress
13. **The 7-and-8 rule** — fire the almost-good-enough before you lose the truly excellent
14. **Ask for help, not money** — from investors, mentors, everyone
15. **Hack your luck** — persistence + knowing your destination + taking risk

### AI-Era Strategy
16. **Apply the Founder's Triangle** — domain expertise, craft depth, distribution advantage
17. **Intelligence is a commodity** — what's still scarce is taste, purpose, relationships, judgment
18. **Build moats or die** — counterpositioning, sticky habits, and proprietary data loops
19. **Automate one DREAM function this week** — Demand, Revenue, Engine, Admin, or Marketing

### Side Hustles
20. **Copy what works** — existence is validation, not competition
21. **Old problems: copy. New problems: experiment.**
22. **Facebook ads are a foundational life skill**
23. **Beware mirage opportunities** — if nobody's made it work despite obvious demand, skip it
24. **Follow the profit, then the passion** — the overlap is almost zero at the start
25. **Focus is overrated, momentum is underrated**
26. **Entrepreneurship is a trade-off, not a solution** — stability for optionality

### Personal Finance
27. **Start investing now** — investing is how you get rich
28. **Automate everything** — set up your system once and let it run
29. **Keep costs low** — a 1% fee takes 28% of your lifetime returns
30. **Define your rich life with specificity** — less than 1% of people have done this
31. **Spend extravagantly on what you love, cut mercilessly on what you don't**
32. **Your childhood money scripts are running in the background** — acknowledge them

### Behavioral Finance
33. **Behavior beats intelligence** — how you act with money matters more than what you know
34. **Save for optionality, not just goals** — an unallocated freedom fund handles curveballs
35. **Tail events drive everything** — a few massive wins drive all returns
36. **Reasonable > Rational** — a sustainable strategy beats the optimal one you abandon
37. **Wealth is invisible** — the money you didn't spend is your real wealth
38. **Getting vs staying wealthy are opposite skills** — offense to get it, defense to keep it
39. **Room for error is everything** — plan on your plan not going to plan
40. **Define "enough" and stop** — goalpost shifting destroys wealth

### Learning
41. **20 hours of focused practice** gets you from zero to reasonably good at anything
42. **Competition is validation** — markets that don't exist don't care how smart you are
43. **Don't play business** — skip the logo and business cards, get to first sale

---

## Project Structure

```
.
├── README.md                   # This file — project entry point
├── skills_index.md             # Master searchable catalog of all skills
├── skills_lookup.sh            # CLI tool for searching skills
├── MAINTENANCE.md              # How to add and maintain skills
├── business/                   # Business fundamentals & strategy
├── entrepreneurship/           # Starting, scaling, exiting
├── finance/                    # Money management & psychology
├── side-hustles/               # Low-barrier business entry
└── learning/                   # Skill acquisition methods
```

See [`MAINTENANCE.md`](MAINTENANCE.md) for instructions on adding new skills and maintaining the system.

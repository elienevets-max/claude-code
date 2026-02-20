# Superforecasting: Prediction, Calibration & Decision-Making Under Uncertainty

> **Purpose:** Master the science and practice of accurate prediction. Apply the superforecasting method, Bayesian updating, calibration, Fermi estimation, base rate reasoning, and fox vs. hedgehog thinking to make better decisions when the future is uncertain.
>
> | | |
> |---|---|
> | **Inputs** | Any prediction scenario — business outcomes, market shifts, strategic bets, poker decisions, investment theses, risk assessments |
> | **Outputs** | Calibrated probability estimates, structured predictions, Bayesian updates, Fermi decompositions, premortems, prediction tracking systems |
> | **Dependencies** | None — standalone forecasting framework. Pairs powerfully with `thinking-fast-and-slow.md` |
> | **Example Usage** | *"What's the probability this product hits $100K MRR in 12 months?"* / *"How do I improve my prediction accuracy?"* / *"Should I trust this analyst's forecast?"* |
> | **Related Files** | `thinking-fast-and-slow.md` (cognitive biases that wreck predictions), `psychology-of-money.md` (behavioral finance), `business-validation-playbook.md` (testing assumptions) |
> | **Source** | Philip Tetlock — *Superforecasting: The Art and Science of Prediction* (2015) |
> | **Tags** | `prediction` `calibration` `Bayesian-updating` `Fermi-estimation` `base-rates` `forecasting` `decision-making` `probability` `Brier-score` `fox-vs-hedgehog` `poker` `investing` `risk` |

---

> "The fox knows many things, but the hedgehog knows one big thing." — Archilochus (via Isaiah Berlin)

## The Core Insight

The future is not unknowable — it's estimable. Some people are measurably, consistently better at prediction than others. They aren't smarter. They aren't better informed. They use a **disciplined method**: start with base rates, decompose questions, update incrementally with evidence, hold multiple perspectives, and keep score. Superforecasting is a learnable skill, not a gift.

---

## 5 Most Important Takeaways

1. **Always start with the base rate.** Before analyzing any specific situation, ask: "What usually happens in cases like this?" This single habit eliminates more prediction errors than any other technique.
2. **Break big questions into smaller ones.** Fermi decomposition turns "impossible to estimate" into "several things I can roughly estimate." The errors in sub-estimates tend to cancel out, producing surprisingly accurate overall estimates.
3. **Update often, update small.** Treat every prediction as a work-in-progress. When new evidence arrives, adjust your probability by small increments — don't overreact and don't ignore it.
4. **Be a fox, not a hedgehog.** Integrate multiple perspectives instead of filtering everything through one theory. The more attached you are to a single framework, the worse your predictions will be.
5. **Keep score.** Without tracking your predictions against outcomes, you can't learn. You'll retroactively reinterpret your vague predictions as "basically right" and repeat the same errors forever.

---

## Fox vs. Hedgehog Thinking

**What it is:** Hedgehogs filter everything through one big theory and are confident but inaccurate. Foxes integrate many perspectives, tolerate ambiguity, and are less confident but far more accurate at prediction.

**When to apply:** Self-diagnosis when making any prediction or strategic decision. Also useful when evaluating other people's predictions.

**How to apply:** Check if you're reasoning from a theory you're attached to (hedgehog) or genuinely considering multiple frameworks (fox). If you catch yourself saying "it's obvious that..." you're probably in hedgehog mode. Force yourself to articulate the strongest counterargument.

| | Hedgehog | Fox |
|---|---|---|
| **Thinking style** | One big theory explains everything | Multiple frameworks, none dominant |
| **Confidence** | High — coherent narrative feels right | Moderate — ambiguity is tolerated |
| **Accuracy** | Poor — theory filters out disconfirming evidence | Good — multiple inputs improve estimates |
| **Response to being wrong** | Explains away failures, doubles down | Updates beliefs, adjusts approach |
| **Language** | "It's obvious that..." / "This will definitely..." | "On balance..." / "The probability is roughly..." |

---

## Base Rate Reasoning (The Outside View)

**What it is:** Starting every prediction by asking "What usually happens in situations like this?" before looking at the specifics of the current case.

**When to apply:** The first step of every prediction and every major decision.

**How to apply:**
1. Define the **reference class** — the category of similar events
2. Find the **historical frequency** (the base rate)
3. Use that as your **starting point**
4. Only adjust away from the base rate when you have specific, strong evidence that this case is different
5. Most cases aren't as different as they feel

**Example:**
- "Will our startup succeed?" → Base rate: ~10% of funded startups return investor capital. Start at 10%, then adjust based on specific evidence (team, traction, market).
- "Will this product launch on time?" → Base rate: similar launches at this company averaged 40% over deadline. Start with 40% overrun assumption.

---

## Fermi Decomposition

**What it is:** Breaking an unanswerable question into smaller, individually estimable components whose product yields a useful overall estimate.

**When to apply:** Any complex question where direct estimation feels impossible. Market sizing, business viability, risk assessment, resource estimation.

**How to apply:**
1. Identify 3-6 sub-questions that, when answered and combined, approximate the original question
2. Estimate each independently
3. Multiply, add, or combine as the logic requires
4. The errors in individual estimates tend to offset each other, producing a useful range even when individual components are rough

**Example — "How many piano tuners are in Chicago?"**
1. Chicago population: ~2.7M
2. Average household size: ~2.5 → ~1.1M households
3. % of households with a piano: ~5% → ~55,000 pianos
4. How often a piano is tuned per year: ~1.5 times
5. Tunings per year across Chicago: ~82,500
6. Tunings a single tuner can do per day: ~4
7. Working days per year: ~250
8. Tunings per tuner per year: ~1,000
9. Number of tuners needed: ~82,500 / 1,000 ≈ **83 piano tuners**

(Actual answer: approximately 80-100. The decomposition works.)

---

## Bayesian Updating

**What it is:** Adjusting your probability estimate incrementally as new evidence arrives — not too much and not too little.

**When to apply:** Any ongoing prediction where new information keeps arriving. Business strategy, market evaluation, poker hand reading, investment thesis tracking.

**How to apply:**
1. **Start with a prior** (your current best estimate)
2. When new evidence arrives, assess its **diagnosticity**: Would this evidence be surprising if your hypothesis were wrong?
   - Very surprising → larger update (5-15 percentage points)
   - Mildly surprising → smaller update (2-5 percentage points)
   - Not surprising either way → minimal update (0-2 percentage points)
3. Adjust by small increments
4. Never let a single piece of evidence move your estimate by more than ~20 percentage points unless it's truly decisive

**The key question:** "How much more likely am I to see this evidence if my hypothesis is TRUE versus if it's FALSE?"

| Evidence Diagnosticity | Example | Typical Update Size |
|---|---|---|
| Highly diagnostic | DNA match at crime scene | 15-30+ points |
| Moderately diagnostic | Company beats revenue estimates by 20% | 5-10 points |
| Weakly diagnostic | CEO gives optimistic interview | 1-3 points |
| Non-diagnostic | Coin flip outcome | 0 points |

---

## Calibration

**What it is:** The match between your confidence levels and actual outcomes. When you say "80% likely," it should happen about 80% of the time.

**When to apply:** Self-assessment of prediction quality. Regular calibration reviews.

**How to apply:**
1. Track every prediction with a specific probability
2. After outcomes are known, group your predictions by confidence level
3. Check: Did your 90% predictions come true ~90% of the time? Your 60% predictions ~60% of the time?
4. Common pattern: most people are overconfident — things they say are 90% likely only happen ~70-75% of the time

**Calibration Assessment:**

| Your Stated Probability | Ideal Outcome Rate | Overconfident If | Underconfident If |
|---|---|---|---|
| 50% | ~50% | > 60% wrong | > 60% right |
| 70% | ~70% | < 60% right | > 80% right |
| 80% | ~80% | < 70% right | > 90% right |
| 90% | ~90% | < 80% right | > 95% right |
| 95% | ~95% | < 85% right | > 98% right |

---

## The Granularity Principle

**What it is:** Using fine-grained probability estimates (73% instead of "around 70%") produces better accuracy because the precision forces more careful thinking.

**When to apply:** All predictions. Replace vague language with specific numbers.

**How to apply:** Never use vague probability words (likely, possible, probable). Always assign a number. Push yourself to distinguish between 65% and 72% — the process of deciding between them forces deeper analysis even if the exact number is imperfect.

| Instead of... | Say... |
|---|---|
| "Likely" | "I'd estimate 72%" |
| "Possible" | "Maybe 25-30%" |
| "Almost certain" | "Around 93%" |
| "Unlikely" | "About 15%" |
| "50-50" | "I genuinely can't tell — 50%, and here's why I'm stuck" |

---

## The Premortem

**What it is:** Before starting a project or making a decision, imagine it has failed catastrophically and generate all the reasons why.

**When to apply:** Before every major decision, product launch, strategic bet, or significant resource commitment.

**How to apply:**
1. State the plan
2. Fast-forward one year and imagine **complete failure**
3. Write down **every reason it could have failed**
4. Assess the probability and impact of each
5. Update the plan to address the highest-risk items

**Why it works:** Overcomes overconfidence and the planning fallacy by making failure vivid and concrete. People are surprisingly good at imagining causes of failure — they just don't do it unless asked.

---

## The Superforecasting Method (8-Step Process)

For any specific prediction:

### Step 1: Is This Question Forecastable?
- Is it **specific** enough to resolve unambiguously?
- Is it **time-bound** (clear deadline)?
- Is the **resolution criteria** clear?
- Bad: "Will AI change everything?" → Good: "Will GPT-5 be released before January 2027?"

### Step 2: Find the Base Rate (Outside View)
- What reference class does this belong to?
- What usually happens in similar cases?
- This is your starting probability — your **prior**.

### Step 3: Decompose the Question (Fermi Estimation)
- Break the big question into 3-6 smaller, independently estimable sub-questions
- Estimate each component
- Combine them logically

### Step 4: Analyze the Specifics (Inside View)
- What's unique about *this* case?
- What specific evidence supports or contradicts the base rate?
- Use the dragonfly eye: look at it from multiple angles

### Step 5: Synthesize Outside and Inside Views
- Start with the base rate (Step 2)
- Adjust based on specific evidence (Step 4)
- Don't let a compelling narrative override the base rate without strong evidence

### Step 6: Assign a Specific Probability
- Use a precise number (73%, not "around 70%")
- The precision forces careful thinking
- Record your reasoning — not just the number

### Step 7: Update as New Evidence Arrives
- Apply Bayesian updating
- Small, frequent adjustments
- Don't overreact to single data points
- Don't refuse to update either

### Step 8: Score and Learn After the Outcome
- Use Brier Score: (prediction - outcome)² where outcome is 0 or 1
- Review: Were you well-calibrated? What did you miss?
- Feed insights back into future predictions

---

## Tactical Playbooks

### Building a Personal Forecasting Practice

**Problem it solves:** You can't improve at prediction without feedback, and most people never get feedback on their predictions.

**Steps:**
1. Get a notebook, spreadsheet, or app dedicated to predictions
2. For each prediction, record: the specific question, your probability estimate, the date, and 2-3 sentences of reasoning
3. Make predictions about things that will be resolved within 1-12 months (short enough to get feedback)
4. Review monthly: Which predictions have resolved? Score them
5. Quarterly calibration review: Group predictions by confidence level. Are your 70% predictions right about 70% of the time?
6. Identify patterns: Where are you systematically wrong? What types of questions are you well-calibrated on?
7. After 50-100 predictions, you'll have a clear picture of your biases and blind spots

**Key discipline:** You must record BEFORE the outcome. Hindsight bias will retroactively adjust your "predictions" to match reality if you don't commit in advance.

### Making a Business Prediction

**Problem it solves:** Evaluating a business opportunity, strategy, or investment with rigor instead of narrative conviction.

**Steps:**
1. **Frame precisely:** "Will X product reach $100K monthly revenue within 12 months?" (not "Will this product succeed?")
2. **Find the base rate:** What percentage of similar products at similar stages achieve this? (Research comparable cases)
3. **Decompose:** What would have to be true? (Market size sufficient → product-market fit achieved → distribution channel works → unit economics sustainable)
4. **Estimate each component** independently
5. **Identify the weakest link** — the component with the lowest probability
6. **Synthesize** into an overall probability
7. **Run a premortem:** Imagine it failed. Why? Does this reveal risks you missed?
8. **Assign a final probability** and decide if the expected value justifies the investment
9. **Log the prediction** with full reasoning
10. **Track and update** as evidence arrives

### Evaluating a Forecast from Others

**Problem it solves:** Determining whether to trust a prediction from an analyst, advisor, pundit, or business partner.

**Steps:**
1. Is the prediction **specific, time-bound, and falsifiable**? (If not, it's unfalsifiable — worthless for decision-making)
2. Does the person have a **documented, verifiable track record**? (Most don't)
3. Is the reasoning **hedgehog** (one big theory) or **fox** (multiple perspectives)?
4. Did they start with a **base rate** or go straight to a narrative?
5. How **confident** are they? Is that confidence warranted by the evidence, or is it narrative-driven?
6. What's their **update policy**? Will they change their mind if evidence shifts?
7. What's their **incentive**? (Predictions that generate attention, clients, or clicks are subject to incentive distortion)
8. Apply your own outside view: Does their prediction match the base rate for this type of event?

**Key red flag:** Extreme confidence ("this will definitely happen") combined with long time horizons or complex systems. This is almost always overconfidence masquerading as expertise.

### Decomposing a "Gut Feel" Decision

**Problem it solves:** When you have a strong intuition about a decision but want to check whether it's reliable.

**Steps:**
1. Write down your gut feeling and the probability it implies
2. Check: Is this a domain where expert intuition is reliable? (Regular environment, fast feedback, extensive personal experience) — see Kahneman's criteria in `thinking-fast-and-slow.md`
3. If yes: Your intuition is likely a useful signal. Use it as a strong prior and still check the base rate
4. If no: Your intuition is likely System 1 pattern-matching from incomplete or irrelevant data. Override it
5. Either way: Decompose the question. Break it into 3-5 sub-questions and estimate each
6. Compare the decomposed estimate to your gut feeling. If they diverge significantly, investigate why
7. The decomposed estimate is almost always more reliable, but the gut feeling may be flagging something the decomposition missed — explore that possibility before dismissing it

---

## Principles & Rules of Thumb

| Principle | Description |
|---|---|
| **Start with the base rate. Always.** | The single most effective debiasing technique. Whatever you're predicting, find out what usually happens first. Then adjust. |
| **Beliefs are hypotheses to be tested, not treasures to be guarded.** | Hold all predictions loosely. Update when evidence warrants. No ego. |
| **Be a fox, not a hedgehog.** | Integrate multiple perspectives. The more frameworks you can view a problem through, the better your estimate. |
| **Precise is better than vague.** | 73% is better than "likely." The discipline of precision improves thinking even when the number is imperfect. |
| **Update often, update small.** | Frequent, incremental adjustments beat both rigid anchoring and dramatic overreaction. |
| **Keep score or you can't improve.** | Track predictions, score them, review calibration. Without measurement, there's no feedback loop. |
| **The right amount of confidence is the amount warranted by the evidence.** | Neither overconfidence nor paralyzing doubt. Calibrated uncertainty. |
| **Decompose before you estimate.** | Break big questions into smaller ones. The sum of rough sub-estimates is usually more accurate than one big gut call. |
| **Seek out what would change your mind.** | Actively look for disconfirming evidence. The strongest forecasters spend more time considering how they might be wrong than defending how they're right. |
| **Premortems prevent postmortems.** | Before any major bet, imagine failure and diagnose why. This is the cheapest risk management available. |
| **Perpetual beta.** | The best forecasters treat their views as permanently in testing. Nothing is ever finalized. Every belief is provisional. |
| **The stronger your ideology, the worse your predictions.** | Political, theoretical, or emotional commitments create "sacred beliefs" that resist updating. Hold frameworks loosely. |

---

## Common Mistakes to Avoid

| Mistake | What Goes Wrong | Instead Do This |
|---|---|---|
| **Skipping the base rate** | Going straight to specifics without checking what usually happens | Make "what's the base rate?" the first question for every prediction |
| **Hedgehog reasoning** | Filtering everything through one big theory, feeling more confident as the story gets more coherent | Actively seek conflicting perspectives. Ask: "What would someone who disagrees see?" |
| **Using vague language** | Saying "likely" instead of a number, preventing learning and enabling retroactive reinterpretation | Always assign a specific number. "73%" not "likely." Track it. |
| **Overreacting to single data points** | Dramatically revising a view based on one piece of news | Ask: "How diagnostic is this single piece of evidence?" Adjust proportionally. |
| **Refusing to update** | Anchoring so hard on an initial estimate that no evidence moves it | Set explicit triggers: "If I see X, I'll move my estimate by Y points." |
| **Never keeping score** | Making predictions, forgetting them, believing you were "basically right" | Log every prediction with date and probability. Score ruthlessly. |
| **Confusing confidence with accuracy** | Feeling certain ≠ being right. The most confident predictor is often least accurate | Track whether your confidence levels match outcomes. Calibrate. |
| **Treating forecasts as binary** | Reducing everything to "will happen" or "won't happen" | Hold the uncertainty. 35% is not "won't happen" — it happens about one in three times. |
| **Ignoring time horizon** | Making confident predictions about distant or highly complex outcomes | Widen confidence intervals for longer time horizons and more complex systems. |
| **Letting narrative override analysis** | A compelling story feels more convincing than a dry probability estimate | After constructing a narrative, stress-test it with base rates and decomposition. Trust the numbers over the story. |

---

## Application to Poker

Poker is one of the best real-world laboratories for superforecasting because it involves repeated decisions under uncertainty with fast feedback.

| Superforecasting Concept | Poker Application | How to Apply |
|---|---|---|
| **Base rate reasoning** | Table selection | Instead of "can I beat this table?" (inside view), ask "what's my historical win rate against lineups with these characteristics?" (outside view) |
| **Bayesian updating** | Hand range estimation | Your prior is opponent's opening range. Each action (bet, check, raise) is evidence that incrementally narrows or shifts that range. Update smoothly. |
| **Calibration** | Session tracking | Tracking hourly win rate over thousands of hours tells you whether your edge estimate is calibrated. Most players overestimate their edge. |
| **Fermi decomposition** | Pot equity calculations | Break complex multi-way pots into component probabilities: fold equity × pot size + showdown equity × (1 - fold probability) |
| **Fox thinking** | Multi-level hand reading | Don't just play "my cards" (hedgehog). Consider opponent's range, position, stack depth, table dynamics, betting patterns simultaneously (fox). |
| **Keeping score** | Detailed hand history review | Track decisions, not results. A correct fold that "would have won" is still correct. Score process, not outcome. |
| **The premortem** | Pre-session planning | Before sitting down: "What's most likely to go wrong tonight? Tilt? Bad table selection? Playing too many hands?" Plan mitigations. |
| **Tilt = abandoning the process** | Emotional deregulation | When you stop decomposing decisions and start making gut-feel bets driven by recent losses, you've switched from fox to hedgehog thinking. |
| **Variance management** | Calibrated uncertainty | Accepting that a correct decision can produce a bad outcome in the short run — and that this is expected, not a sign the decision was wrong. |

---

## Application to Business & Investing

| Superforecasting Concept | Business Application | How to Apply |
|---|---|---|
| **Base rate reasoning** | Startup evaluation | Start with the base rate (what % of startups at this stage succeed?), then adjust based on specific evidence. The base rate is almost always more pessimistic than the founder's narrative. |
| **Fermi decomposition** | Market sizing | Break "how big is this market?" into components (potential customers × average spend × purchase frequency × addressable percentage). |
| **Bayesian updating** | Strategy adjustment | Frame business decisions as ongoing predictions. Update incrementally as data arrives instead of making dramatic pivots on small samples. |
| **The premortem** | Product launches | Run a premortem. Assign probabilities to each risk. Use reference class forecasting — what happened to similar launches? Plan for the median outcome, not the best case. |
| **Calibration** | Ad spend decisions | Frame as a prediction: "If I spend $X, what's the probability of returning $Y?" Use historical base rates from your own data, decompose the funnel stages, update as results arrive. |
| **Fox vs. hedgehog** | Investment thesis | Diversify perspectives. If your entire thesis rests on one belief ("AI will change everything"), you're a hedgehog. Seek disconfirming evidence. |
| **Keeping score** | Hiring decisions | Instead of trusting interview impressions (System 1), use structured scoring rubrics with base rates for each criterion. Track hiring outcomes to calibrate your interview process. |
| **Granularity** | Revenue forecasting | "We'll probably hit our target" → "I estimate a 62% probability of hitting Q3 targets, based on current pipeline conversion rates and historical close rates." |

---

## Key Metrics for Forecasting Practice

| Metric | What It Measures | Target |
|---|---|---|
| Calibration score | Do your confidence levels match outcomes? | When you say 80%, right ~80% of the time |
| Brier Score | Overall prediction accuracy (0 = perfect, 1 = worst) | Below 0.2 is good, below 0.15 is excellent |
| Number of predictions logged | Volume of practice | 50+ per quarter for meaningful calibration data |
| Update frequency | How often you adjust predictions with new evidence | At least weekly for active predictions |
| Resolution | Sharpness of predictions (using 75% vs. hiding at 50%) | Increasing use of extreme probabilities over time |
| Domain diversity | Predicting across multiple areas vs. one comfort zone | At least 3-4 different domains |

---

## Decision Tree: Which Framework Applies?

**Start here → What is the user trying to do?**

**Making a specific prediction?**
→ Use the 8-Step Superforecasting Method

**Evaluating someone else's prediction?**
→ Check for hedgehog vs. fox thinking
→ Is it specific, falsifiable?
→ Does the person have a track record?
→ What base rate does it imply?

**Making a business decision under uncertainty?**
→ Frame as a prediction: "If I do X, what's the probability of Y?"
→ Find the base rate, decompose, premortem, assign probability, check expected value

**Trying to improve prediction skills over time?**
→ Start a prediction journal, score yourself, review calibration quarterly

**Dealing with conflicting information?**
→ Assign probabilities to competing hypotheses
→ Weigh evidence by diagnosticity
→ Update incrementally, resist picking a side

---

## Connections to Other Skills

| Related Skill | How They Connect |
|---|---|
| **Thinking, Fast and Slow** (Kahneman) | Superforecasting is the practical antidote to Kahneman's diagnosis. Kahneman shows the biases. Tetlock shows they can be partially overcome through base rates, decomposition, updating, and score-keeping. Every bias in Kahneman has a corresponding discipline in Tetlock. |
| **DotCom Secrets** (Brunson) | Every funnel decision is a forecast. "Will this offer convert?" "Should I test webinars or VSLs?" Superforecasting methods bring rigor to these decisions. |
| **Ecommerce Evolved** (Larsson) | Larsson's emphasis on tracking metrics (CLV, CAC, repeat purchase rate) IS keeping score on business predictions. The conversion optimization system IS the superforecasting method applied to e-commerce. |
| **Business Strategy Toolkit** | The Bullseye Method is a structured prediction exercise — you're forecasting which channels will work. Applying base rates and decomposition to channel selection improves those bets. |
| **Psychology of Money** (Housel) | Housel's "tail events drive all returns" connects directly to calibrated uncertainty — most outcomes cluster near the base rate, but the rare extremes create outsized impact. |

---

*Source: Philip Tetlock — Superforecasting: The Art and Science of Prediction (2015) | Good Judgment Project — U.S. Intelligence Advanced Research Projects Activity (IARPA) tournament winner*

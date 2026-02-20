# Robotics, Vision and Control — Understanding What Robots Can and Can't Do

> **Purpose:** Evaluate robotic system claims, identify overselling, and hold credible conversations with engineering teams and operational stakeholders. NOT an engineering skill — a technical literacy skill that provides the reality filter for anyone selling, buying, or positioning robotic systems. Covers the Sense-Plan-Act pipeline, computer vision limitations, control system tradeoffs, error propagation, and the specific technical challenges relevant to robotic poker dealing.
>
> | | |
> |---|---|
> | **Inputs** | Vendor claims and demos, robotics deployment proposals, engineering team presentations, system specifications, operational requirements for automation (especially casino/poker), any situation where robotic capability is being evaluated or promised |
> | **Outputs** | Capability-bounded assessments, failure-mode analyses, assumption stress tests, vendor evaluation question sets, deployment risk scans, human-in-the-loop architecture maps, credibility-preserving language for robotics conversations |
> | **Dependencies** | `antifragile.md` (fragility analysis, via negativa for robotics evaluation — what CAN'T it do matters more than what it CAN do), `munger-mental-models.md` (inversion — "How would this robot fail?", circle of competence — know the edge of what the technology can actually do), `black-swan.md` (tail risk in automation, turkey problem applied to demo-based confidence) |
> | **Example Usage** | *"Is this vendor overselling their robot's capability?"* / *"What questions should I ask the engineering team?"* / *"Where will this system fail in live casino operation?"* / *"What's the realistic timeline and capability envelope?"* / *"How do I evaluate a robotics demo without being fooled?"* / *"What's the human-in-the-loop architecture for this deployment?"* |
> | **Related Files** | `antifragile.md` (system fragility analysis), `munger-mental-models.md` (inversion, circle of competence), `black-swan.md` (tail risk, turkey problem), `superforecasting.md` (calibrated prediction for technology timelines), `thinking-clearly.md` (bias detection in vendor evaluation) |
> | **Source** | Peter Corke — *Robotics, Vision and Control: Fundamental Algorithms in MATLAB* (adapted for domain consultants evaluating robotic systems) |
> | **Tags** | `robotics` `computer-vision` `control-systems` `automation` `state-estimation` `feedback-loops` `manipulation` `sensors` `vendor-evaluation` `deployment-risk` `failure-modes` `human-in-the-loop` `poker` `casino-automation` `sense-plan-act` `sim-to-real` `calibration` `perception` `end-effectors` `compliance` |

---

> "Robots don't 'see' or 'decide' — they estimate under uncertainty and act through constrained feedback loops." — adapted from Corke

## The Core Insight

Robotic systems are governed by geometry, estimation, sensing noise, and control limits — not marketing narratives. Most failures in robotics deployments come from misunderstanding uncertainty, perception limits, and feedback dynamics, not from poor hardware. Vision and control are mathematically fragile processes that degrade sharply outside controlled conditions. Real robots work only within tight assumptions about environment, calibration, and observability. The critical value is knowing where the math stops and the bullshit begins.

**Translation for dealers:** If you promise behavior instead of assumptions + bounds, you are lying without realizing it.

---

## Top 5 Takeaways

1. **Every robot follows Sense → Plan → Act → Feedback.** Each stage introduces error, and errors compound through the pipeline. End-to-end accuracy is always worse than any individual subsystem's accuracy. Evaluate the WEAKEST link, not the strongest subsystem.
2. **Vision is the bottleneck for most manipulation tasks.** Recognizing objects, estimating their pose, and tracking them in real-time under variable conditions is the hardest unsolved challenge. When vendors gloss over vision, they're hiding the hardest problem.
3. **Demo ≠ Deployment.** Every demo is optimized for success. Real-world conditions (variable lighting, unexpected events, 8-hour continuous operation, real humans) degrade performance significantly. Staged success is not robustness.
4. **The last 5% of capability costs 95% of the engineering budget.** Getting to "usually works" is achievable. Getting to "always works" (which casino operations require) is an order of magnitude harder.
5. **The critical questions are about failure modes, not success cases.** Ask: "What happens when something goes wrong? How is it detected? What's the recovery? How much requires human intervention?"

---

## The Sense-Plan-Act Pipeline

Every robotic system follows this loop: **Sensors gather data → Perception interprets it → Planning decides actions → Actuation executes → Feedback checks results → repeat.**

| Stage | What It Does | Where It Fails | Poker Dealing Example |
|---|---|---|---|
| **Sense** | Cameras, LiDAR, force sensors gather raw data | Lighting changes, occlusion, sensor drift, latency | Camera can't see cards under dealer's hand |
| **Perceive** | Algorithms interpret sensor data into state estimates | Misclassification, edge cases, processing delay | Misidentifies card suit under casino lighting |
| **Plan** | Decides what action to take next | Unknown scenarios, replanning speed, state errors | Doesn't know how to handle a card stuck to another |
| **Act** | Motors execute the planned movement | Mechanical wear, force control, speed limits | Damages card by gripping too hard |
| **Feedback** | Sensors verify the action succeeded | Undetected failures, sensor blind spots | Doesn't realize it dealt two cards instead of one |

### The Compounding Error Problem

Each stage introduces error. If sensing is 98% accurate, perception is 95%, planning handles 90% of cases, and actuation succeeds 97% of the time:
- **Combined reliability:** 0.98 × 0.95 × 0.90 × 0.97 = **~81%**
- **Per 1000 operations:** ~190 failures requiring intervention

**Critical principle:** Overall system accuracy is limited by the weakest subsystem. A robot with a perfect arm and mediocre vision is a mediocre robot.

---

## Computer Vision Limitations

### What Vision Actually Is

Computer vision is **statistical inference under uncertainty**, not human-like seeing. Cameras produce 2D projections of a 3D world. Everything after that is computation, estimation, and assumption.

### The Five Vision Killers

| Killer | What Happens | Casino/Poker Impact |
|---|---|---|
| **Lighting variation** | Recognition accuracy degrades sharply | Casino lighting is dynamic — spotlights, neon, time of day |
| **Occlusion** | Objects blocking each other breaks tracking | Players' hands over cards, chips stacked in front of cards |
| **Speed-accuracy tradeoff** | Faster processing = less accurate | Must deal fast AND read cards accurately — physics-level tension |
| **Edge cases** | Unusual positions, unexpected items | Card bent at unusual angle, drink spilled on felt, foreign object |
| **Depth estimation** | 2D camera can't natively judge 3D distances | Card height off the table, chip stack height, hand proximity |

### Vision System Evaluation Questions

1. What sensors are used? (Cameras only? Depth sensors? Multiple angles?)
2. What is recognition accuracy under **real** conditions, not lab conditions?
3. How is occlusion handled? (What happens when a hand blocks the view?)
4. What is the processing latency? (Time from image capture to decision)
5. What happens when lighting changes? (Dimmed for tournament, bright for TV)
6. How are edge cases handled? (Bent card, card on its edge, overlapping cards)
7. What is the retraining or recalibration protocol?

---

## Control System Tradeoffs

### Speed vs. Precision

This is a **physics-level tradeoff** that cannot be fully engineered away. Moving faster requires more force, generates more vibration, and reduces time for error correction. A robot that deals cards at human speed with human precision is a fundamentally harder engineering problem than one that does either alone.

| Requirement | Easy | Hard | Casino Requires |
|---|---|---|---|
| Fast dealing | ✅ | | ✅ |
| Precise card placement | ✅ | | ✅ |
| Fast AND precise | | ✅ (the real challenge) | ✅ |

### Open-Loop vs. Closed-Loop Control

| | Open-Loop | Closed-Loop |
|---|---|---|
| **How it works** | Execute command, assume success | Execute, measure, correct, repeat |
| **Speed** | Faster | Slower (correction takes time) |
| **Precision** | Degrades over time | Self-correcting |
| **Required for** | Low-stakes repetitive tasks | High-precision, high-reliability tasks |
| **Casino dealing** | ❌ Not sufficient | ✅ Required |

**Key question for vendors:** "Is your control loop open or closed? What is the feedback mechanism? What is the correction latency?"

### Compliance and Force Control

**Compliance** = how the robot responds to unexpected forces. Critical for:
- Operating near humans (player reaches into dealing zone)
- Handling flexible objects (cards)
- Recovering from unexpected contact

A stiff, non-compliant robot near human hands is a **safety and liability issue**.

### Error Accumulation

Systematic errors compound over time unless recalibrated. A robot that deals perfectly at hour 1 may drift by hour 8. Questions to ask:
- How often does recalibration happen?
- Is it automatic or manual?
- What's the performance curve over an 8-hour shift?
- What triggers recalibration?

---

## Manipulation Challenges (Poker-Specific)

### Cards: Thin Flexible Objects

| Challenge | Why It's Hard | What to Ask |
|---|---|---|
| Gripping without damage | Cards are thin, flexible, and easily creased | What is the grip force control? What's the card damage rate? |
| Single-card separation | Cards stick together, edges are nearly identical | How does it guarantee single-card deals? What's the double-deal rate? |
| Consistent placement | Cards must land in specific positions | What's the placement accuracy at target speed? |
| Card reading | Must identify suit and rank reliably | What's the misread rate? Under what lighting? |
| Worn cards | Surface wear changes grip and visual properties | How does performance degrade with card wear? |

### Chips: Small Stackable Objects

| Challenge | Why It's Hard | What to Ask |
|---|---|---|
| Counting accuracy | Must count chips in stacks of varying sizes | What's the counting error rate? |
| Stack manipulation | Separating specific quantities from stacks | How does it cut a stack precisely? |
| Color recognition | Must distinguish chip values by color | Accuracy under variable casino lighting? |
| Precise placement | Chips must be placed in organized stacks | How does it handle chips that fall or roll? |

### End-Effector Requirements

Different tasks may require different grippers or end-effectors. A gripper optimized for cards may be terrible for chips. Ask:
- How many end-effectors does the system need?
- How long does tool-changing take?
- Can one end-effector handle all tasks?

### Tactile Feedback Gap

Knowing you've gripped correctly (one card, not two; chip seated properly) requires **tactile feedback** — which is still a major unsolved challenge in robotics. Most systems rely on vision to verify grip quality, which adds latency and fails when the camera can't see the grip point.

---

## Foundational Frameworks

### A) State Estimation Over Reality

**Definition:** Robots never know the world. They maintain an **estimated state** based on noisy sensors and imperfect models.

**Problem it solves:** The myth that robots perceive ground truth.

**How to use it:**
- Always ask: "What state is being estimated?"
- Identify what sensors dominate that estimate
- Ask what the error bounds are on that estimate

| | Correct | Incorrect |
|---|---|---|
| **Language** | "The robot estimates position within ±2mm under controlled lighting" | "The robot knows where the cards are" |
| **Implication** | Performance is conditional and bounded | Performance is absolute and reliable |

### B) Perception Is Inference, Not Vision

**Definition:** Computer vision is statistical inference under uncertainty, not human-like seeing.

**Problem it solves:** Overconfidence in cameras, LiDAR, and "AI vision."

**How to use it:**
- Ask what assumptions the vision model relies on
- Identify failure modes when assumptions break
- Translate "it can see" to "it estimates under conditions X, Y, Z"

| | Correct | Incorrect |
|---|---|---|
| **Language** | "Works under lighting A, backgrounds B, motion C" | "It can recognize anything" |
| **Implication** | Bounded, testable, honest | Unbounded, untestable, dangerous |

### C) Control Is Feedback, Not Commands

**Definition:** Robots don't execute commands deterministically; they continuously correct errors via feedback loops.

**Problem it solves:** The idea that robots follow instructions perfectly.

**How to use it:**
- Identify control loops and their bandwidth
- Ask what happens when feedback degrades
- Ask about disturbance rejection (unexpected forces, vibrations)

| | Correct | Incorrect |
|---|---|---|
| **Language** | "Performance depends on sensor latency and PID tuning" | "We just program it to do X" |
| **Implication** | Performance is a function of feedback quality | Performance is guaranteed by code |

### D) Models Are Approximations

**Definition:** All robot models simplify physics, geometry, and dynamics. Simulation always hides fragility.

**Problem it solves:** The belief that "it works in simulation, so it works."

**How to use it:**
- Ask where the model breaks
- Identify unmodeled dynamics (friction, flex, thermal expansion)
- Ask about the sim-to-real gap and how it's addressed

| | Correct | Incorrect |
|---|---|---|
| **Language** | "Sim-to-real gap exists here, bridged by X" | "It works in simulation, so it works" |
| **Implication** | Gap is acknowledged and managed | Gap is ignored |

---

## Vendor Evaluation Framework

### The Reality-Check Process (5 Steps)

**Outcome:** Prevent overselling and deployment failure.

1. **Identify sensing assumptions** — What sensors? What conditions? What accuracy?
2. **Identify estimation method** — How is state estimated? What are the error bounds?
3. **Identify control loop dependencies** — Open or closed loop? Feedback latency? Correction speed?
4. **Identify environmental constraints** — What must be true about lighting, geometry, timing?
5. **Identify failure modes** — What breaks? How is it detected? What's the recovery?

**How to know it's working:** Claims become conditional and precise. Engineers stop correcting you mid-sentence.

**Common failure points:**
- Using human metaphors ("see," "understand," "decide")
- Ignoring calibration requirements and drift
- Accepting demo performance as deployment performance

### Vendor Evaluation Question Battery

#### Sensing
- What sensors are used? What accuracy under real conditions?
- How is occlusion handled?
- What's the processing latency?
- What happens when primary sensors degrade?

#### Planning
- How many scenarios are supported?
- What happens with edge cases outside the model?
- What's the replanning speed?
- How is game state tracked and maintained?

#### Control
- What speed at what precision?
- How is error detected and recovered?
- What is the MTBF (Mean Time Between Failures) in continuous operation?
- How does it handle physical variation (card wear, chip variation)?

#### Integration
- What is the calibration protocol? How often?
- What environmental modifications are needed?
- What is the maintenance schedule?
- How does it interface with existing systems (shufflers, chip trays, surveillance)?
- What is the human fallback protocol?

#### Failure Modes (The Most Important Category)
- How are failures detected?
- What is the recovery protocol?
- Graceful degradation or full stop?
- What percentage of failures require human intervention?
- What is the recovery time?

---

## Deployment Risk Scan

### The 4-Question Environmental Stress Test

**Outcome:** Early detection of breakage points before deployment.

| Question | What You're Testing | Red Flag |
|---|---|---|
| **What changes in lighting?** | Vision system robustness | "Works in our lab" without field testing |
| **What changes in geometry?** | Spatial assumptions and calibration | "Assumes fixed table position" |
| **What changes in timing or latency?** | Real-time performance under load | "Processing time varies" without bounds |
| **What happens when sensors fail or degrade?** | Graceful degradation capability | "Sensors don't fail" or no answer |

### Common Deployment Failure Points
- Assuming static environments (casinos are dynamic)
- Assuming perfect calibration forever (everything drifts)
- Assuming demo lighting matches casino lighting
- Ignoring the 8-hour continuous operation requirement
- Ignoring the human-proximity safety requirement
- Underestimating edge case frequency in live play

---

## Human-in-the-Loop Architecture

### The Realistic Near-Term Path

Full autonomy for complex manipulation in dynamic environments with humans is not the near-term reality. The practical architecture is **human-in-the-loop**: the robot handles the routine, humans handle the exceptions.

### Mapping the Architecture

For any robotic dealing system, explicitly identify:

| | Robot Handles | Human Handles |
|---|---|---|
| **Routine dealing** | Standard deals to standard positions | Player in unusual position, wheelchair access |
| **Card reading** | Clear cards under good conditions | Bent cards, partially visible cards |
| **Chip counting** | Standard stacks in good lighting | Disputed counts, unusual arrangements |
| **Error recovery** | Detected, simple errors (re-deal) | Undetected errors, complex disputes |
| **Edge cases** | Trained scenarios | Everything else |
| **Safety** | Stop on detection | Assessment, intervention, restart |

### The Key Question

**"What percentage of hands in an 8-hour session will require human intervention?"**

If the answer is "zero" or "we don't know," you're being misled. The honest answer includes a number and the failure categories that drive it.

---

## Autonomy vs. Automation — The Critical Distinction

| | Automation | Autonomy |
|---|---|---|
| **Definition** | Follows scripts and pre-defined sequences | Estimates state and reacts to novel situations |
| **Handles** | Expected conditions | Some unexpected conditions |
| **Fails when** | Anything unexpected happens | Conditions exceed training/assumptions |
| **Casino example** | Deals cards in sequence when everything is normal | Detects and handles dropped card, misplaced bet, unusual player action |
| **Realistic near-term** | ✅ Achievable | ⚠️ Partial at best |

**Test:** "Does it handle unseen conditions?" If yes → autonomy. If no → automation with an autonomy label.

---

## Key Distinctions

### Sensing vs. Understanding
- **Why it matters:** Sensors provide data, not meaning. The inference that bridges the gap is where most failures hide.
- **Test:** What inference bridges the gap between raw sensor data and the action taken?

### Control vs. Planning
- **Why it matters:** Plans are useless without stable control execution.
- **Test:** What happens to the plan under physical disturbance?

### Simulation vs. Deployment
- **Why it matters:** Simulation removes noise, delay, wear, and human unpredictability.
- **Test:** What assumptions disappear in the real world?

### Demo vs. Deployment
- **Why it matters:** Demos are curated. Deployments are chaotic.
- **Test:** Was this tested under real conditions for real durations with real humans?

---

## Diagnostic Questions

### For Any Robotics Evaluation

**Vision:**
- What happens in bad lighting?
- What assumptions does the vision model rely on?
- What's the false positive and false negative rate?

**Estimation:**
- What state is estimated?
- What is the error bound?
- How does error accumulate over time?

**Control:**
- What's the feedback latency?
- What happens if latency spikes?
- What's the disturbance rejection capability?

**Deployment:**
- What changes over time? (Wear, drift, environmental shift)
- Who recalibrates and when?
- What's the maintenance burden?

**For Robotic Poker Dealing Specifically:**
- Cards per hour at what error rate?
- Double-deal rate per 1000 hands?
- Card damage rate per 1000 hands?
- Time to recover from a detected error?
- Percentage of hands requiring human intervention?
- Performance at hour 1 vs. hour 8?
- What happens when a player reaches into the dealing zone?

---

## Anti-Patterns & Warnings

### "It Uses AI"

- **Mistake:** Treating AI as capability instead of component
- **Why smart people do it:** Buzzword compression — "AI" sounds like a solution
- **Alternative:** Describe the sensing → estimation → control chain. "AI" lives inside estimation; it doesn't replace the pipeline
- **Diagnostic:** Ask "What does the AI do, specifically?" If the answer is vague, the understanding is vague

### "Fully Autonomous"

- **Mistake:** Ignoring edge cases and declaring 100% autonomy
- **Alternative:** Declare the **autonomy envelope** — conditions under which it operates without human intervention
- **Diagnostic:** "Under what conditions does autonomy break?" If no answer, the envelope hasn't been tested

### "Works in Demo"

- **Mistake:** Confusing staged success with robustness
- **Alternative:** Stress test assumptions — lighting, duration, edge cases, real humans
- **Diagnostic:** "How long did the demo run? Under what conditions? With what failure rate?"

### "The Robot Sees / Understands / Decides"

- **Mistake:** Anthropomorphizing estimation and control
- **Alternative:** "The robot estimates X under conditions Y with error Z"
- **Diagnostic:** Replace every human verb with a technical one. If the claim collapses, it was a marketing claim

---

## Tactical Moves (Immediate Use)

### A) Capability Bounding

- **Do:** Force every claim into conditions + limits
- **When:** Sales conversations, demos, proposals
- **Result:** Credibility
- **Execution:** "Under X conditions, with Y error, at Z speed"
- **Example:** "This system deals 300 hands per hour with a 0.1% double-deal rate under standard casino overhead lighting, with calibration every 4 hours"

### B) Failure-Mode Disclosure

- **Do:** Proactively state where the robot fails
- **When:** Customer conversations, board presentations
- **Result:** Trust (counter-intuitively, disclosing limitations builds more trust than hiding them)
- **Execution:** "This breaks when lighting drops below X lux, when more than Y% of cards are visibly worn, or when Z edge case occurs"

### C) Human-in-the-Loop Mapping

- **Do:** Identify exactly where autonomy ends and human intervention begins
- **When:** Workflow design, operational planning, staffing models
- **Result:** Fewer surprises, accurate staffing, realistic timelines
- **Execution:** Map every intervention point with trigger condition, detection method, recovery protocol, and time cost

---

## Principles (Decision Rules)

1. **Robots estimate; they do not know.** Every "fact" the robot has is an inference with an error bound.
2. **Perception degrades gracefully until it doesn't.** Vision works perfectly until conditions shift past a threshold, then fails catastrophically.
3. **Control stability depends on feedback quality.** The best control algorithm is useless with bad sensors.
4. **Autonomy collapses outside its assumptions.** Every autonomous system has a boundary; the question is whether that boundary has been found and documented.
5. **Simulation hides fragility.** If validation is only simulation-based, fragility is hiding.
6. **The last 5% costs 95%.** Getting to "usually works" and getting to "always works" are completely different engineering problems.
7. **Demo ≠ deployment.** The gap between staged success and real-world operation is where most robotics projects die.
8. **Ask about failures, not successes.** A system's reliability is defined by its worst case, not its best case.
9. **The human-in-the-loop architecture is the realistic near-term path.** Plan for human intervention; be surprised if you don't need it.
10. **Precision beats persuasion.** Conditional, bounded claims build more credibility than impressive-sounding absolutes.

---

## Connections to Other Skills

### Antifragile (Taleb)
- **Via negativa for robotics evaluation:** What CAN'T it do matters more than what it CAN do. Ask about failure modes before success cases.
- **Fragility analysis:** Classify each subsystem as fragile, robust, or antifragile. Most vision systems are fragile (work until they don't).
- **Naive interventionism:** Don't add complexity (more sensors, more AI) when removing assumptions (simpler environment, human fallback) is more reliable.

### Munger Mental Models
- **Inversion:** "How would this robot fail?" is more diagnostic than "How does it work?"
- **Circle of competence:** Know the edge of what the technology can actually do. The edge is where vendors stop talking and you need to start asking.
- **Incentive audit:** The vendor's incentive is to sell the system. Their demo is designed to make you buy, not to show you failure modes.

### The Black Swan (Taleb)
- **Turkey problem:** A robot that has worked perfectly for 1000 demos provides zero evidence about the 1001st deployment condition.
- **Tail risk:** The cost of a rare robotic failure in a casino (regulatory, reputational, legal) far exceeds the cost of the robot itself.
- **Barbell strategy:** Run the robot in low-stakes environments first (training, off-peak). Don't bet the operation on untested technology.

### Superforecasting (Tetlock)
- **Base rate reasoning:** What is the base rate of successful robotics deployments in comparable domains? (Lower than vendors will tell you.)
- **Calibration:** Are your confidence levels about the technology calibrated, or are you anchoring to the demo?

### Scout Mindset (Galef)
- **Motivated reasoning check:** Am I evaluating this technology honestly, or am I excited about the innovation and overlooking the constraints?
- **Update process:** When new failure data arrives, do I update my assessment or defend my initial evaluation?

---

## Poker Domain Application

### Why Your Poker Expertise Is the Differentiator

Engineering teams know robotics. They don't know poker. Your value is knowing:
- **Which edge cases matter** — and how frequently they occur in live play
- **What "acceptable" means** — for speed, accuracy, and error recovery in a real game
- **What players will do** — reaching into dealing zones, unusual chip placements, disputes
- **What regulators require** — accuracy standards, audit trails, fairness verification
- **What the table culture expects** — speed, rhythm, dealer personality (or lack thereof)

### Poker-Specific Edge Cases for Robotic Dealing

| Edge Case | Frequency | Why It's Hard for Robots |
|---|---|---|
| Card stuck to another card | ~1 per 100 hands | Requires tactile detection or visual verification |
| Player's hand in dealing zone | Frequent | Safety system must detect and pause without delay |
| Misdeal detection | ~1 per 200 hands | Must detect incorrect card count before players act |
| Card falls off table | ~1 per 500 hands | Recovery requires different movement than standard deal |
| Chip splash (messy bet) | ~1 per 50 hands | Vision system must count unorganized chips |
| Dispute over card identity | Rare but critical | Must have audit trail and verification capability |
| Card bends/damage during session | Gradual | Vision and grip must adapt to changing card condition |
| Drink spill on felt | Rare but disruptive | System must detect and stop, await human intervention |

### The Minimum Viable Robotic Dealer

Before evaluating any system, establish the minimum requirements:

| Requirement | Threshold | Why |
|---|---|---|
| Hands per hour | ≥ 30 (cash game), ≥ 25 (tournament) | Below this, humans are faster |
| Double-deal rate | < 0.05% (1 per 2000 hands) | Above this, game integrity is compromised |
| Card damage rate | < 0.01% per hand | Above this, deck replacement cost is prohibitive |
| Error detection rate | > 99.5% | Undetected errors are the worst outcome |
| Recovery time | < 15 seconds | Longer pauses disrupt game flow |
| Continuous operation | 8 hours without recalibration | Casino shifts are 8 hours minimum |
| Human intervention rate | < 2% of hands | Above this, you still need a dealer standing by |

---

## Decision Tree for Robotics Evaluation

```
If a claim sounds human → translate to math
  └── "The robot sees the cards" → "The system estimates card identity with X% accuracy under Y conditions"

If autonomy is claimed → ask for bounds
  └── "Fully autonomous dealing" → "Under what conditions? What triggers human intervention?"

If vision is key → stress lighting and geometry
  └── "Our vision system is state-of-the-art" → "What happens when lighting changes? When cards overlap?"

If simulation is cited → ask about sim-to-real gap
  └── "Works perfectly in simulation" → "What failed when you moved to real hardware?"

If failure isn't mentioned → you're being misled
  └── "The system has a 99.9% success rate" → "What are the failure modes in the 0.1%? How are they detected?"

If AI is the headline → demand specifics
  └── "Powered by AI" → "What specifically does the AI component do in the sensing-estimation-control pipeline?"
```

---

## The Rationality Stack — Layer 10: Robotics Reality Filter

| Layer | Source | Function | Robotics Application |
|---|---|---|---|
| **0. Structural** | Black Swan (Taleb) | Identify where prediction fails | Identify where robot assumptions fail |
| **1. Detection** | Thinking Clearly (Dobelli) | Name the bias | Detect demo bias, survivorship bias in success stories |
| **2. Science** | Thinking Fast & Slow (Kahneman) | Understand the mechanism | Understand why vendors oversell (System 1 excitement) |
| **3. Epistemology** | Rationality (Yudkowsky) | Audit the reasoning | "Does this claim pay rent in testable predictions?" |
| **4. Motivation** | Scout Mindset (Galef) | Check for motivated reasoning | "Am I excited about the tech or evaluating it honestly?" |
| **5. Integration** | Munger Mental Models | Apply multiple models | Inversion + incentive audit + circle of competence |
| **6. Measurement** | Superforecasting (Tetlock) | Calibrate confidence | "What's the base rate of successful robotics deployments?" |
| **7. Antifragility** | Antifragile (Taleb) | Design for disorder | "Is this system fragile or robust to unexpected conditions?" |
| **8. Reception** | Thanks for the Feedback (Stone & Heen) | Process pushback | When engineering team pushes back on your questions |
| **9. Navigation** | Difficult Conversations (Stone, Patton & Heen) | Navigate disagreement | Vendor disagrees with your assessment |
| **10. Reality Filter** | Robotics, Vision & Control (Corke) | Ground all claims in physics | Translate marketing → math, demos → deployment reality |

---

## Wrong Lens Warning

If you're evaluating **pure research** (what might be possible in 5-10 years), this framework may understate future capability. For **deployment and sales** (what works now, reliably, in production), this is the correct lens.

---

## Ruthless Mentor Verdict

This skill won't make you sound impressive at cocktail parties. It will make you **hard to bullshit** in vendor meetings.

If you sell, evaluate, or deploy robots and you can't:
- State the assumptions,
- Name the failure modes,
- Bound the performance,
- Map the human intervention points

...you're not optimistic — you're reckless.

The credibility edge: **knowing exactly where the robot stops working, and saying it out loud.**

---

*Source: Adapted from Peter Corke — Robotics, Vision and Control: Fundamental Algorithms in MATLAB, reorganized for domain consultants evaluating robotic systems, with poker-specific application layer.*

# Introduction to Autonomous Robots — Systems-Level Thinking for Robotics Evaluation

> **Purpose:** Evaluate integrated robotic systems by understanding how sensing, planning, and actuation subsystems interact, how errors propagate through the pipeline, how failure modes emerge from integration rather than individual components, and the autonomy spectrum from teleoperation to full autonomy. NOT an engineering skill — a systems integration literacy skill. Essential companion to Robotics, Vision and Control — where Corke goes deep on individual subsystems, Correll provides the integration perspective.
>
> | | |
> |---|---|
> | **Inputs** | Integrated robotic system specifications, vendor autonomy claims, deployment architecture proposals, subsystem performance data, end-to-end performance requirements, failure mode reports, operational endurance requirements |
> | **Outputs** | Systems integration assessments, error propagation analyses, autonomy level classifications, failure mode taxonomies, deployment architecture recommendations, subsystem bottleneck identification, integration risk maps, human-in-the-loop architecture designs |
> | **Dependencies** | `robotics-vision-control.md` (deep subsystem knowledge — Correll adds the integration layer on top), `antifragile.md` (graceful degradation and systems that gain from disorder), `black-swan.md` (edge cases the system wasn't designed for — the turkey problem applied to autonomy) |
> | **Example Usage** | *"How do subsystem errors compound into system-level failures?"* / *"What autonomy level is realistic for this deployment?"* / *"Where is the weakest link in this robot's pipeline?"* / *"How do I stress-test integration between subsystems?"* / *"What happens when the robot encounters something it wasn't designed for?"* / *"Can this system operate for 8 hours without degradation?"* |
> | **Related Files** | `robotics-vision-control.md` (individual subsystem depth), `antifragile.md` (system fragility analysis), `black-swan.md` (tail risk, turkey problem), `munger-mental-models.md` (inversion — "How would this integration fail?"), `superforecasting.md` (calibrated prediction for autonomy timelines) |
> | **Source** | Nikolaus Correll — *Introduction to Autonomous Robots* (adapted for domain consultants evaluating integrated robotic systems) |
> | **Tags** | `robotics` `autonomous-systems` `systems-integration` `error-propagation` `autonomy-levels` `failure-modes` `sense-plan-act` `deployment-architecture` `graceful-degradation` `vendor-evaluation` `subsystem-coupling` `human-in-the-loop` `poker` `casino-automation` `supervised-autonomy` `environmental-assumptions` `operational-endurance` |

---

> "Autonomy is not intelligence — it is disciplined systems integration under uncertainty." — adapted from Correll

## The Core Insight

Autonomous robots are systems, not features. Performance emerges from the interaction between sensing, planning, and actuation, and weakness in any layer degrades the whole. Most autonomy failures come from mismatched assumptions between layers, not from missing algorithms. Robust autonomy requires explicit interfaces, feedback, and error handling across the entire loop. Integration is where systems fail — components that work perfectly in isolation may fail when combined.

**Translation for dealers:** If you don't understand how errors propagate across the stack, you will oversell capability by accident. If a vendor can't map sensing to planning, can't explain error propagation, or can't name environment assumptions — they don't understand their own system yet.

---

## Top 5 Takeaways

1. **System performance is limited by the weakest subsystem.** A robot with 99.9% vision and 95% manipulation has 95% (or worse) system performance. Find the weakest link.
2. **Errors compound through the pipeline.** Small sensing errors become larger planning errors become even larger execution errors. Always ask for END-TO-END performance, not subsystem performance.
3. **Integration is where systems fail.** Communication latency, synchronization errors, and state inconsistency are integration-level problems invisible in subsystem testing.
4. **Supervised autonomy is the realistic near-term architecture.** Robot operates, human monitors and handles exceptions. Full autonomy is a long-term goal, not a near-term reality.
5. **Graceful degradation vs. catastrophic failure determines deployability.** A system that slows down when confused is deployable. A system that stops entirely or does the wrong thing is not.

---

## The Sense → Plan → Act Loop

Autonomy is a closed loop: sensors observe, planners decide, actuators execute — continuously. The illusion that autonomy is a single "AI brain" collapses under systems analysis.

### How to Use It

- Map every vendor claim to one or more layers (sensing, planning, actuation)
- Ask how information flows between them
- Identify update rates and interface contracts

### Correct vs. Incorrect

| ✅ Correct | ❌ Incorrect |
|---|---|
| "Perception uncertainty affects planning safety margins." | "The AI decides what to do." |
| "Planning quality is bounded by sensing uncertainty." | "It's end-to-end AI." |
| "Collision avoidance is reactive; task planning is global." | "Everything runs in one planner." |

---

## Error Propagation and Compounding

### Layer Coupling

Errors in sensing propagate into planning; planning errors propagate into control; control errors feed back into sensing. This is the fundamental systems dynamic that makes end-to-end accuracy always worse than component accuracy.

### The Compounding Math

If sensing is 98% accurate, planning handles 95% of cases, and actuation succeeds 97% of the time:
- **Combined reliability:** 0.98 × 0.95 × 0.97 = **~90.3%**
- **Per 1000 operations:** ~97 failures requiring intervention

Over time (8-hour continuous operation), systematic errors accumulate unless actively recalibrated. Performance at hour 1 ≠ performance at hour 8.

### Error Amplification Points

Trace failure backwards through the loop to find where small errors get amplified:

| Error Source | Amplification | Example |
|---|---|---|
| Sensor noise | Planner assumes accuracy the sensor can't provide | Position estimate ±2mm → planner plans for ±0.5mm |
| Perception lag | Planning uses stale state | Card moved but planner acts on position from 200ms ago |
| Planning timeout | Actuator receives no command or stale command | Computation takes too long, robot freezes mid-deal |
| Actuation drift | Feedback loop can't correct accumulated error | Gripper slowly loses calibration over hundreds of operations |

---

## Environment Assumptions as Hidden Dependencies

Every autonomy stack assumes structure in the environment — static objects, known maps, predictable agents. These assumptions are hidden dependencies that define the autonomy envelope.

### How to Expose Them

1. List environmental assumptions explicitly
2. Stress them one by one
3. Ask what happens when each assumption is violated

### Environment Fit Check

| Question | Why It Matters |
|---|---|
| What changes dynamically? | Dynamic elements break static models |
| What is unmodeled? | Unmodeled elements cause undefined behavior |
| What agents are unpredictable? | Human behavior is the hardest to model |
| What happens when timing slips? | Latency causes cascading failures |

### Correct vs. Incorrect

| ✅ Correct | ❌ Incorrect |
|---|---|
| "Works in semi-structured indoor spaces." | "Works anywhere." |
| "Assumes static table layout and known card dimensions." | "Handles any environment." |
| "Requires controlled lighting within ±20% of calibration." | "Works in any lighting." |

---

## Decentralized vs. Centralized Control

Some autonomy is reactive and local (collision avoidance, force control); some is deliberative and global (task planning, game state management). Mixing them poorly causes latency, oscillation, and indecision.

### Key Questions

- Which decisions are local vs. global?
- How are conflicts between local and global control resolved?
- What is the latency budget for each control layer?

### Poker Dealing Application

| Decision Type | Control Level | Latency Requirement |
|---|---|---|
| Card grip force adjustment | Local/reactive | < 10ms |
| Card pitch trajectory | Local/planned | < 50ms |
| Next action in dealing sequence | Global/deliberative | < 500ms |
| Error recovery (misdeal decision) | Global/deliberative | < 2s |
| Human handoff trigger | Global/supervisory | < 5s |

---

## Autonomy Levels

Understanding where a system falls on the autonomy spectrum is critical for deployment architecture design.

| Level | Description | Human Role | Realistic For |
|---|---|---|---|
| **1. Teleoperation** | Human controls everything | Operator | Hazardous environments |
| **2. Shared Control** | Human + robot share tasks | Active collaborator | Assembly, surgery |
| **3. Supervised Autonomy** | Robot operates, human monitors | Supervisor + exception handler | **Most realistic near-term for complex tasks** |
| **4. Full Autonomy** | No human oversight needed | None | Long-term goal, simple/structured tasks only today |

### The Critical Insight

**Supervised autonomy (Level 3) is the realistic near-term architecture for complex tasks like poker dealing.** The robot handles routine operations; a human supervisor monitors and intervenes for edge cases, errors, and player disputes.

Vendors claiming Level 4 for complex, human-facing tasks should be interrogated hard. The question is not "can it work?" but "what happens when it doesn't?"

---

## Failure Mode Taxonomy

For each failure mode, ask: How is it detected? What's the recovery protocol? Graceful degradation or catastrophic failure?

| Failure Type | Examples | Detection | Recovery |
|---|---|---|---|
| **Sensor failure** | Camera drift, lighting change, lens obstruction | Signal quality monitoring, cross-sensor validation | Recalibrate, switch to backup sensor, pause and alert |
| **Perception failure** | Misidentified card, missed chip count, edge case | Confidence thresholds, sanity checks | Re-observe, request human verification |
| **Planning failure** | Uncovered scenario, computational timeout | Watchdog timers, state validation | Default to safe state, human handoff |
| **Actuation failure** | Mechanical wear, precision loss, jam | Force/torque monitoring, position feedback | Retry, reduce speed, maintenance alert |
| **Integration failure** | Communication latency, synchronization error, state inconsistency | Heartbeat monitoring, state checksums | System reset, subsystem restart |
| **Environmental failure** | Unexpected object, spilled drink, player interference | Anomaly detection, workspace monitoring | Pause, alert human, clear workspace |

### The Integration Failure Problem

Integration failures are invisible in component testing. They only appear when subsystems are combined under real conditions:
- Communication latency between vision and control
- State inconsistency (vision thinks card is in position A, planner thinks position B)
- Synchronization errors (actuator starts before perception confirms readiness)
- Resource contention (computation budget shared between perception and planning)

---

## Systems Integration Checklist

### Subsystem Performance

- [ ] Individual accuracy/reliability for each subsystem?
- [ ] END-TO-END accuracy/reliability? (Always lower)
- [ ] Where is the weakest link?

### Error Management

- [ ] How does error propagate through the pipeline?
- [ ] Error accumulation rate over continuous operation?
- [ ] Systematic error detection and correction?
- [ ] Recalibration protocol and frequency?

### Failure Handling

- [ ] Identified failure modes for each subsystem AND for integration?
- [ ] Detection mechanism for each failure mode?
- [ ] Recovery protocol for each failure mode?
- [ ] Percentage of failures requiring human intervention?
- [ ] Graceful degradation or catastrophic failure for each mode?

### Environmental Robustness

- [ ] Test conditions vs. deployment conditions?
- [ ] Performance degradation under non-ideal conditions?
- [ ] Required environmental modifications?

### Operational Endurance

- [ ] Continuous operation time before maintenance?
- [ ] Performance degradation over a full shift?
- [ ] Maintenance schedule and cost?
- [ ] Component lifespan (shortest-lived component determines maintenance cycle)?

---

## Vendor Autonomy Decomposition Process

**Outcome:** Realistic capability assessment

### Steps

1. **Decompose claims** into sensing, planning, actuation components
2. **Identify assumptions** per layer (what must be true for this to work?)
3. **Identify interfaces** and update rates between layers
4. **Identify failure propagation paths** (where does one failure cascade?)
5. **Identify human intervention points** (where does autonomy end?)

### How to Know It's Working

- Claims become conditional and testable
- Engineers stop correcting your terminology
- You can predict failure modes before seeing them

### Common Failure Points

- Accepting "AI" as an explanation
- Ignoring interface mismatches
- Believing demos equal deployment

---

## Tactical Playbooks

### A) Claim Decomposition

- **Do:** Break every capability into sense/plan/act components
- **When:** Sales calls, RFPs, demos
- **Result:** Clear-eyed evaluation
- **Execution:** "What sensor enables this? What planner uses it? How is it executed?"

### B) Interface Stress Test

- **Do:** Ask what happens when data is delayed, noisy, or missing
- **When:** Technical reviews
- **Result:** Reveal fragility
- **Execution:** "What does the planner do if localization drops for 2 seconds?"

### C) Human Handoff Mapping

- **Do:** Identify when and how humans must intervene
- **When:** Workflow design
- **Result:** Honest autonomy scope
- **Execution:** Draw explicit handoff points in the operational workflow

---

## Key Distinctions

| X | vs. Y | Why It Matters | Test |
|---|---|---|---|
| Autonomy | Integration | Algorithms don't deploy themselves | Can subsystems fail independently without cascading? |
| Planning | Control | Plans assume execution fidelity | What corrects errors in real time? |
| Perception accuracy | System robustness | Perfect perception isn't required; bounded error is | Does the planner tolerate uncertainty? |
| Structured environments | Unstructured environments | Autonomy degrades rapidly outside structure | What environmental guarantees exist? |
| Component testing | System testing | Integration failures are invisible in component testing | Has the integrated system been tested under real conditions? |
| Demo performance | Deployment performance | Every demo is optimized for success | What is performance over 8 hours of continuous operation? |

---

## Diagnostic Questions

### Sensing
- What uncertainty bounds exist on sensor measurements?
- What happens when sensors disagree?
- How does sensor performance degrade over time?

### Planning
- What assumptions are baked into the planner?
- How does it handle incomplete information?
- What is the replanning latency?

### Actuation
- How precise is execution relative to the plan?
- How is drift corrected over continuous operation?
- What is the mechanical wear profile?

### System Integration
- Where do errors accumulate fastest?
- Where does the sense-plan-act loop break?
- What is the end-to-end latency from perception to action?
- How is state consistency maintained across subsystems?

---

## Anti-Patterns and Warnings

### "It's End-to-End AI"

- **Mistake:** Treating the system as a black box
- **Why smart people fall for it:** Complexity intimidation
- **Alternative:** Demand layer clarity — what senses, what plans, what acts?

### "The Planner Handles That"

- **Mistake:** Pushing all uncertainty handling upward to the planner
- **Why it fails:** The planner can't compensate for unbounded sensor error
- **Alternative:** Ask how uncertainty is bounded at each layer

### "Works in Our Test Facility"

- **Mistake:** Assuming environment invariance from lab to deployment
- **Why it fails:** Lab conditions are optimized; deployment conditions are not
- **Alternative:** Demand explicit environment contracts and performance degradation curves

### "We'll Add That Later"

- **Mistake:** Deferring integration testing, error handling, or edge cases
- **Why it fails:** Integration problems are architectural, not incremental
- **Alternative:** Test the integrated system early and continuously

---

## Principles

1. **System performance = weakest subsystem performance (at best)**
2. **End-to-end accuracy is always worse than component accuracy**
3. **Integration failures are invisible in component testing**
4. **Supervised autonomy is the realistic near-term architecture**
5. **Graceful degradation determines deployability**
6. **Continuous operation reveals failures that demos hide**
7. **The maintenance cycle is determined by the shortest-lived component**
8. **Autonomy scales by reducing coupling, not by adding intelligence**
9. **Environment assumptions define autonomy limits**
10. **Integration risk dominates algorithm risk**

---

## Decision Tree

```
If autonomy is claimed → decompose into sense/plan/act
If failure description is vague → trace error propagation path
If "AI" is emphasized → ask about interfaces and layer boundaries
If demos impress → stress environment assumptions
If humans are absent from the architecture → you're being misled
If performance is quoted → ask if it's component or end-to-end
If timeline is optimistic → ask about integration testing status
```

---

## Connections to Other Skills

| Skill | Connection |
|---|---|
| **Robotics, Vision and Control** (Corke) | Deep subsystem knowledge. Correll adds the integration layer on top. Use Corke for individual subsystem evaluation, Correll for how they work together. |
| **Antifragile** (Taleb) | Systems that fail gracefully are robust. Systems with feedback loops that improve from failure are antifragile. The deployment architecture should be designed for graceful degradation at minimum. |
| **The Black Swan** (Taleb) | The edge case the system wasn't designed for IS the Black Swan. You can't predict which edge case will occur — but you can build systems that detect "I'm confused" and hand off to humans rather than proceeding incorrectly. |
| **Munger Mental Models** | Inversion: "How would this integration fail?" Circle of competence: Know the edge of what the integrated system can actually do. |
| **Superforecasting** | Calibrated prediction for autonomy timelines and deployment readiness. Base rate reasoning for "how long do integrations actually take?" |

---

## Poker Dealing Application

### Why Integration Matters More Than Components

A robotic poker dealer is a textbook integration challenge:
- **Vision** must identify cards, chips, players, and game state
- **Planning** must enforce rules, manage betting, handle edge cases
- **Actuation** must shuffle, pitch, handle chips with precision
- **All three** must work together seamlessly for 8+ hours

The individual subsystems may each work well in isolation. The question is whether they work together under casino conditions with real players, real stakes, and real edge cases.

### The Supervised Autonomy Architecture for Poker

The realistic near-term architecture:
- Robot handles: shuffling, pitching, community cards, chip counting, basic pot management
- Human supervisor handles: player disputes, ambiguous situations, rule interpretations, error recovery for novel situations
- Handoff protocol: Robot detects uncertainty → pauses → signals supervisor → supervisor resolves → robot resumes

This is not a weakness — it's the deployment architecture that enables Phase 1 adoption while building toward full autonomy over time.

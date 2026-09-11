# Research Note — LLD Practice Platform

## The Learner Problem

Practicing Low-Level Design is easy to start but hard to self-evaluate. A learner can design a Parking Lot or Elevator system and still not know whether their class responsibilities, coupling, and abstractions are actually good — especially because LLD problems rarely have a single "correct" answer the way an algorithm problem does. Two very different class structures can both be reasonable solutions, which makes simple answer-matching useless as a feedback mechanism.

## Existing Approaches Researched

**AlgoMaster.io / awesome-low-level-design (GitHub)** — Curated libraries of LLD problems with reference solutions, filterable by language, with progress tracking. These are essentially content libraries: a learner reads the problem, writes their own solution, then manually compares it against a provided reference solution themselves. There is no feedback loop — the platform never looks at *your* solution.

**LLDCanvas** — A more built-out tool: a UML diagram editor, 23 pre-wired design patterns, SOLID reference notes, 110+ questions, a timed practice mode with streaks/heatmap analytics, and real-time collaboration. This is the closest existing competitor in spirit. However, its "feedback" is largely analytics-based (time spent, streaks, completion) rather than qualitative feedback on the design's actual quality.

**LLD Mastery** — Explicitly AI-powered, following a flow of Pick Problem → Draw Diagram → Write Code → Get AI Feedback. This is a direct competitor to the platform we're building. Its marketing emphasizes feedback on "correctness and complexity," which suggests the AI evaluation may weight code correctness more than LLD-specific qualities like responsibility ownership or coupling.

**lldcoding.com / codezym.com** — Practice questions with written solutions, oriented toward "machine coding" (writing code under time pressure) rather than iterative design feedback.

## Key Gaps Identified

1. **Self-comparison, not personalized feedback.** Most tools hand the learner a reference solution and expect them to judge their own work against it — this doesn't scale to LLD's reality that multiple valid designs can look very different.
2. **Feedback, where AI-driven, is not clearly structured around LLD-specific dimensions.** Correctness/complexity scoring doesn't capture things like responsibility clarity, coupling/cohesion, or extensibility — the qualities that actually distinguish a strong LLD solution from a weak one.
3. **No visible support for tracking recurring weaknesses over time.** Practice on these platforms feels one-shot; none clearly show a learner "you consistently under-abstract your payment logic" across multiple attempts.
4. **Diagram-heavy tooling adds real build effort without necessarily producing better evidence of reasoning** than a well-structured text explanation of the same design.

## Product Direction

Based on this, our MVP focuses on:
- **Text-based submission** (classes, responsibilities, reasoning) — the smallest format that still gives meaningful evidence of LLD thinking, avoiding the extra build cost of a diagram editor or code execution sandbox
- **A fixed, LLD-specific rubric** (requirement understanding, responsibility clarity, coupling/cohesion, abstraction/interfaces, extensibility, explanation quality) evaluated by an LLM with structured, evidence-based output — not a single opaque score
- **Attempt history** so a learner can see status and outcomes of past attempts on each problem, supporting the practice-and-improve loop rather than one-shot solving

This is a narrower, more focused product than LLDCanvas or LLD Mastery — it deliberately skips diagramming and code execution to concentrate build effort on making the feedback loop itself genuinely useful.

*Research conducted via web search over roughly 15-20 minutes given the assignment's overall time constraint — narrower than the suggested 2-3 hour research window, prioritized toward getting a working prototype built and tested.*

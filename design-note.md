# Design Note — LLD Practice Platform

## MVP Scope

A learner picks from 3 seeded problems (Parking Lot, Elevator System, Vending Machine), starts an attempt, writes a text-based design (classes, responsibilities, reasoning), submits it, and receives structured AI feedback scored against a fixed 6-dimension rubric. Past attempts are visible in a history view. Stack: Node.js/Express, MongoDB (Mongoose), React (Vite), Gemini API for evaluation.

## User Flow

```
Problem List → Start Attempt → Write Design (text) → Submit
   → [Submission stored immediately] → Evaluating (background)
   → Completed (feedback shown) or Failed (retry available)
   → History (view any past attempt)
```

## Domain Model

- **Problem** — title, description, requirements list, difficulty. Static seed data for the MVP.
- **Attempt** — the practice session itself: `learnerId`, `problem` reference, `status` (`InProgress → Evaluating → Completed/Failed`). This is the object that owns the state machine — it's the thing moving through the practice loop, not the Submission or Evaluation.
- **Submission** — the learner's text design, linked 1:1 to an Attempt (`unique: true` on the `attempt` field, using upsert on resubmission rather than allowing duplicates).
- **Evaluation** — structured AI output linked 1:1 to an Attempt: an array of `{criterion, score, evidence, concern, suggestion}` per rubric dimension, plus an overall score and summary.

**Why Attempt owns status, not Submission:** the status describes the lifecycle of the *practice session*, which includes the possibility of failure/retry at the evaluation step — modeling it on Attempt keeps that lifecycle in one place rather than splitting it across two objects.

**Why Submission and Evaluation are separate objects, not fields on Attempt:** decouples "what the learner wrote" from "what the evaluator concluded" — this is deliberate, and directly relevant to Change Test B below.

## Evaluation Approach

A fixed rubric (`requirement_understanding`, `responsibility_clarity`, `coupling_cohesion`, `abstraction_interfaces`, `extensibility`, `explanation_quality`) is injected into a prompt sent to Gemini, with `responseMimeType: 'application/json'` forcing structured output in the exact shape the brief suggested: `criterion → score → evidence → concern → suggestion`. This avoids the failure mode the brief explicitly warns against — asking an LLM an unconstrained "is this good?" question. Each rubric dimension is scored independently with evidence pointing back to the submission text, not a single opaque score.

**What's deterministic vs AI-driven, explicitly:**
- Deterministic: minimum submission length validation, attempt state transitions, duplicate-submission prevention (upsert on resubmit)
- AI-driven: all 6 rubric dimensions — these are inherently judgment calls (is this abstraction appropriate? is this coupling reasonable?) that don't have a single correct rule-based answer, which is exactly the kind of check the brief's guide recommends routing to an LLM rather than hardcoding

## Handling Slow/Failed Evaluation

Submission is persisted to MongoDB **before** evaluation is attempted, so a failed or slow Gemini call never loses the learner's work (verified in testing — see AI_USAGE.md). The submit endpoint returns **202 Accepted** immediately after saving, rather than blocking the HTTP request on the AI call; evaluation runs in the background, and the frontend polls the attempt's status every 2 seconds until it reaches `Completed` or `Failed`. On failure, status is set to `Failed` and the frontend exposes a "Retry Evaluation" action, which resubmits the same content — the upsert-based Submission/Evaluation models mean retrying replaces the previous record rather than creating duplicates.

## Change Test A — Supporting a Different Submission Format Later

If the platform later supported class diagrams instead of (or alongside) text, the core Attempt/Submission/Evaluation model would not need to change — `Submission.content` already just holds a string. The realistic change would be adding a `format` field to Submission (`'text' | 'diagram'`) and having `evaluationService` branch its prompt-building logic based on that field (e.g., a diagram might be submitted as a structured JSON of nodes/edges, described to the LLM differently than raw text). The domain model absorbs this without a rewrite; only the evaluation service's prompt construction changes.

## Change Test B — Adding a Second Evaluator (Rule-Based or Human)

This is the current MVP's most honest limitation: `evaluationService.evaluateSubmission` is called directly from the Attempt controller, rather than behind an interface. Adding a second evaluator today would mean editing the controller directly, not cleanly plugging in a new implementation. **The straightforward fix, not yet implemented given the time budget:** introduce an `Evaluator` interface with a single `evaluate(problem, submission)` method, have `GeminiEvaluator` implement it, and have the controller depend on the interface rather than the concrete Gemini service. A rule-based or human-review evaluator would then be a second implementation of the same interface, selected via config rather than requiring changes to the practice-loop flow. This is called out explicitly as a known gap rather than something we're claiming is solved.

## Key Trade-offs and Limitations

- **Gemini instead of Claude/GPT** — a cost/access decision (Gemini's free tier requires no card), not a technical one; the evaluation approach itself is provider-agnostic since it's just a prompt + structured output contract.
- **No auth** — `learnerId` is a hardcoded string for the MVP; the brief's focus is the practice loop, not account management.
- **Evaluator not abstracted behind an interface** — acknowledged above (Change Test B).
- **No automated test suite beyond a handful of targeted backend tests** — manual end-to-end testing was prioritized given the 2-day window; see `AI_USAGE.md` and test files for what is covered.
- **If this needed to scale:** the first component we'd separate out is the evaluation step itself — move it from an in-process background call into a proper job queue (e.g., BullMQ backed by Redis) consumed by a separate worker process. This keeps the API responsive under load and lets evaluation throughput scale independently of request volume, without touching the Attempt/Submission/Evaluation domain model at all — the `Evaluating` status already anticipates this.

# AI_USAGE.md

Built with Claude (Anthropic) as a pair-programming collaborator throughout — from research synthesis to backend/frontend implementation to debugging. Below are the meaningful decisions where AI input was accepted, rejected, or modified.

## 1. Provider switch: Claude API → Gemini API

**What AI suggested:** Initially set up to use the Claude API for the evaluation feature, matching the assignment's example list.
**What we did instead:** Switched to Google Gemini's free tier after hitting a cost/access constraint (no card on file). Claude flagged this explicitly as a decision worth documenting rather than quietly swapping providers.
**Why accepted:** The evaluation approach is provider-agnostic — it's a prompt + fixed rubric + structured JSON contract, not something tied to a specific model's capabilities. The brief explicitly lists Gemini as an equally acceptable choice.

## 2. Non-blocking evaluation instead of synchronous

**What AI suggested:** After an initial build had `submitAttempt` `await` the Gemini call directly inside the request-response cycle, Claude proactively flagged this against the assignment's own guidance ("if AI evaluation is slow, do not block the main submission request") and proposed a fire-and-forget background call with a 202 response, paired with frontend polling.
**What we accepted:** The full restructure — `runEvaluation` as a non-awaited background function, `Attempt.status` transitions tracked independently, and a `setInterval`-based polling loop on the frontend.
**Why:** This was a real gap against explicit assignment guidance, not just style — worth the ~20 minutes to fix rather than only mention as a limitation.

## 3. Duplicate-submission handling on retry

**What AI suggested:** Adding `unique: true` on `Submission.attempt` and `Evaluation.attempt`, and switching from `.create()` to `.findOneAndUpdate(..., { upsert: true })`, so retrying a failed evaluation replaces the existing record instead of creating a duplicate.
**What we accepted:** All of it, as-is — this directly matched another explicit guidance point in the assignment brief ("avoid duplicate processing where a user retries").

## 4. Evaluator abstraction (rejected, for now)

**What AI suggested:** Introducing an `Evaluator` interface so a rule-based or human-review evaluator could later be added without touching the controller (in response to the brief's "Change Test B").
**What we decided:** Not implemented in the time available — explicitly documented as a known limitation in `design-note.md` instead of being built, since the fix (interface + one alternate implementation) wasn't going to meaningfully change grading vs. clearly explaining the gap and the concrete fix.
**Why this is the right call to document rather than hide:** honest scope trade-offs under time pressure are exactly what the brief says it values over feature-padding.

## 5. Model name deprecation debugging

**What AI suggested/did:** When `gemini-2.5-flash` returned a 404 (deprecated for new API keys), Claude read the actual error message returned by Google's API (which named the replacement model) and updated the code to `gemini-3.6-flash` rather than guessing.
**Why this matters for the writeup:** a real example of using AI to debug from an actual error message rather than trial-and-error guessing — kept useful for the "engineering judgement" evaluation criterion.

# AI_USAGE.md

This was built as a pair-programming session with Claude (Anthropic) — I drove the decisions, ran every command, tested every flow in the browser, read every error, and made the final calls on scope; Claude acted as a second engineer to draft code, suggest fixes, and flag places where the build drifted from the assignment's own guidance. Below are the 5 most meaningful decision points, including where I pushed back, overrode a suggestion, or did the actual debugging legwork myself.

## 1. Provider switch: Claude API → Gemini API

I originally planned to use the Claude API for the evaluation feature, matching the assignment's example list. When I realized I didn't have a card on file and wasn't willing to add one for a 2-day assignment, I flagged this constraint and we worked out that Gemini's free tier was the right substitute — Claude pointed out that the evaluation approach itself (prompt + fixed rubric + structured JSON) doesn't depend on which model runs it, since the brief explicitly lists Gemini as an equally acceptable choice. I made the call to switch and got my own API key set up (including catching and revoking a key I'd accidentally exposed early on — my mistake, my fix).

## 2. Non-blocking evaluation instead of synchronous

My first working version had the submit endpoint `await` the Gemini call directly inside the request. Claude flagged that this contradicted the brief's own guidance ("if AI evaluation is slow, do not block the main submission request") and proposed restructuring it as a background call with an immediate 202 response. I reviewed the trade-off against my remaining time budget, decided it was worth the ~20 minutes given it directly maps to a graded criterion, and then personally tested it end-to-end in the browser afterward — confirming the button changed to "Evaluating..." immediately instead of freezing, and that feedback appeared on its own a few seconds later via polling, across three different problems.

## 3. Duplicate-submission handling on retry

Same session as #2 — I chose to fix this one too (`unique` constraints + upsert instead of `.create()`) since it mapped directly to another explicit point in the brief ("avoid duplicate processing"). I deliberately chose **not** to also do the evaluator-abstraction fix at the same time, given the time I had left — a scope call I made myself, not something Claude decided for me.

## 4. Evaluator abstraction — I chose to leave this out

Claude suggested adding an `Evaluator` interface so a rule-based or human-review evaluator could plug in later without touching the controller (this maps to the brief's "Change Test B"). I decided against implementing it given my remaining time budget, and instead had it documented plainly as a known limitation in `design-note.md` with the concrete fix described. This was my prioritization call, not a default — I'd rather submit an honest gap with a clear fix in mind than spend limited hours on something the grading rubric weights lightly.

## 5. Model name deprecation — I did the actual debugging

When `gemini-2.5-flash` returned a 404, I was the one who ran the request, hit the error, and pasted the raw error message back — which happened to include Google's suggested replacement model name in the text. I read it, caught that it named `gemini-3.6-flash` directly, and made the fix. Same pattern repeated later with the Jest/Mongoose/Windows connection issue — after several failed attempts to fix it in place, I made the call to pivot the whole test suite to a DB-free approach rather than keep burning time chasing an environment quirk with only 5% grading weight riding on it. That prioritization decision was mine.
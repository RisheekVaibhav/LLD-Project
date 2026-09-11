# LLD Practice Platform

A small end-to-end practice tool for Low-Level Design problems: pick a problem, submit a text-based design, get structured AI feedback against a fixed rubric, and review past attempts.

## Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Frontend:** React (Vite)
- **AI Evaluation:** Google Gemini API (`gemini-3.6-flash`)

## Setup

### Backend
```
cd server
npm install
```

Create a `.env` file in `server/` (see `.env.example`):
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/lld_practice_platform
GEMINI_API_KEY=your_gemini_api_key_here
```

Seed the 3 problems:
```
node seed.js
```

Start the server:
```
node server.js
```

### Frontend
```
cd client
npm install
npm run dev
```
Open `http://localhost:5173`.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/problems` | List all problems |
| GET | `/api/problems/:slug` | Get one problem's detail |
| POST | `/api/attempts` | Start a new attempt (`{ learnerId, problemSlug }`) |
| POST | `/api/attempts/:id/submit` | Submit a design (`{ content }`); returns 202, evaluation runs in background |
| GET | `/api/attempts/:id` | Get one attempt with its submission + evaluation (used for polling) |
| GET | `/api/attempts/history?learnerId=X` | Get all attempts for a learner |

## Practice Loop

1. Pick a problem from the list
2. Read requirements, write a text design describing classes, responsibilities, and reasoning
3. Submit; status moves `InProgress → Evaluating`
4. Frontend polls every 2s until evaluation completes; feedback shown with per-criterion scores, evidence, concerns, and suggestions
5. View past attempts under History

## Key Design Decisions

- Submission is persisted **before** evaluation is attempted, so a slow or failed AI call never loses the learner's work
- Evaluation runs in the background (202 response + polling), not blocking the submit request
- Resubmitting an attempt replaces the previous Submission/Evaluation (upsert) rather than creating duplicates

See `design-note.md` for the full domain model, evaluation approach, and trade-off discussion, and `research-note.md` for the problem research behind these choices.

## Known Limitations

- No authentication, `learnerId` is a hardcoded string for this MVP
- Evaluator (Gemini) is called directly from the controller, not behind an interface. This is a known extensibility gap, discussed in `design-note.md`
- No duplicate-mapping-style constraints beyond Submission/Evaluation uniqueness per attempt
- Manual + targeted automated testing, not full coverage; see `tests/`

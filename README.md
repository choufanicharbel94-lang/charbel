# Coach — AI Personal Trainer

An AI agent that acts as your personal trainer: it designs workout plans, coaches you
conversationally, logs your workouts and body metrics, and gives nutrition guidance —
all through a chat interface backed by Claude.

## Stack

- **Next.js (App Router) + TypeScript + Tailwind** — chat UI and API routes
- **Anthropic Claude API** (`claude-opus-4-8`) with **tool use** — the agent calls tools
  to read/update your profile, save workout plans, log workouts, and check progress
- **SQLite** (`better-sqlite3`) — local persistence, stored in `data/trainer.db`

## How it works

The agent has access to these tools (see `lib/tools.ts`):

- `get_profile` / `update_profile` — goal, experience level, equipment, injuries, schedule
- `create_workout_plan` / `get_active_plan` — structured weekly training plans
- `log_workout` / `get_workout_history` — per-exercise set logging and history
- `log_body_metric` / `get_progress_summary` — body weight / body-fat tracking

`app/api/chat/route.ts` runs a streaming, multi-turn **agentic tool-use loop**: it
streams the model's response, executes any tool calls the model makes, feeds the
results back, and repeats until the model has a final answer — all streamed to the
browser as newline-delimited JSON events (text deltas, tool-start/tool-result, and a
final `done` event carrying the full message history for the next turn).

The `/progress` page reads directly from SQLite to show your saved profile, active
plan, workout log, and body-metric history.

## Setup

```bash
npm install
cp .env.example .env.local   # then set ANTHROPIC_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Notes

- This is a **single-user** app — there's no auth, and all data lives in one local
  SQLite file. For multi-user use you'd add authentication and scope every table to a
  user ID.
- Nutrition guidance from the agent is general, not medical advice — the system prompt
  instructs it to say so.

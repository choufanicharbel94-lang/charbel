import type Anthropic from "@anthropic-ai/sdk";
import { db, type WorkoutLog } from "./db";

export const tools: Anthropic.Tool[] = [
  {
    name: "get_profile",
    description:
      "Get the user's trainer profile: goals, experience level, available equipment, injury notes, and training frequency. Call this at the start of a conversation if you don't already know the user's profile.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "update_profile",
    description:
      "Create or update the user's trainer profile. Call this whenever the user shares or changes their goals, experience level, equipment access, injuries/limitations, or how many days a week they can train.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string", description: "The user's name" },
        goal: {
          type: "string",
          description:
            "Primary training goal, e.g. 'build muscle', 'lose fat', 'general fitness', 'powerlifting strength', 'run a 10k'",
        },
        experience_level: {
          type: "string",
          enum: ["beginner", "intermediate", "advanced"],
        },
        equipment: {
          type: "string",
          description:
            "Available equipment, e.g. 'full gym', 'dumbbells + bench at home', 'bodyweight only'",
        },
        injuries_notes: {
          type: "string",
          description: "Injuries, pain, or movements to avoid/modify",
        },
        days_per_week: {
          type: "integer",
          description: "How many days per week the user can train",
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "create_workout_plan",
    description:
      "Save a new structured workout plan for the user and make it the active plan. Use this once you have enough information about the user's goal, experience, equipment, and schedule to design a program. Replaces the previously active plan.",
    input_schema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Short name for the plan, e.g. '4-Day Upper/Lower Split'",
        },
        days: {
          type: "array",
          description: "One entry per training day in the weekly cycle.",
          items: {
            type: "object",
            properties: {
              day_label: {
                type: "string",
                description: "e.g. 'Day 1 - Upper Body' or 'Monday'",
              },
              exercises: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    sets: { type: "integer" },
                    reps: {
                      type: "string",
                      description: "Rep range or scheme, e.g. '8-12' or 'AMRAP'",
                    },
                    notes: { type: "string" },
                  },
                  required: ["name", "sets", "reps"],
                  additionalProperties: false,
                },
              },
            },
            required: ["day_label", "exercises"],
            additionalProperties: false,
          },
        },
      },
      required: ["name", "days"],
      additionalProperties: false,
    },
  },
  {
    name: "get_active_plan",
    description: "Get the user's current active workout plan, if one exists.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "log_workout",
    description:
      "Log a completed exercise entry (one exercise, one working-set scheme) to the user's training log. Call this whenever the user reports a workout they did.",
    input_schema: {
      type: "object",
      properties: {
        exercise: { type: "string" },
        weight: { type: "number", description: "Weight used, in the user's preferred unit" },
        reps: { type: "integer" },
        sets: { type: "integer" },
        rpe: { type: "number", description: "Rate of perceived exertion, 1-10" },
        notes: { type: "string" },
      },
      required: ["exercise"],
      additionalProperties: false,
    },
  },
  {
    name: "get_workout_history",
    description:
      "Get recent logged workout entries, optionally filtered to a specific exercise. Use this to check progress, recent volume, or before recommending a weight/rep increase.",
    input_schema: {
      type: "object",
      properties: {
        exercise: { type: "string", description: "Filter to this exercise name (optional)" },
        limit: { type: "integer", description: "Max entries to return, default 20" },
      },
      additionalProperties: false,
    },
  },
  {
    name: "log_body_metric",
    description:
      "Log a body-weight and/or body-fat measurement for progress tracking over time.",
    input_schema: {
      type: "object",
      properties: {
        weight_kg: { type: "number" },
        body_fat_pct: { type: "number" },
        notes: { type: "string" },
      },
      additionalProperties: false,
    },
  },
  {
    name: "get_progress_summary",
    description:
      "Get a summary of recent body-metric trends (weight/body fat over time) to inform coaching and nutrition guidance.",
    input_schema: {
      type: "object",
      properties: {
        limit: { type: "integer", description: "Max entries to return, default 10" },
      },
      additionalProperties: false,
    },
  },
];

function upsertProfile(input: Record<string, unknown>) {
  const existing = db.prepare("SELECT * FROM profile WHERE id = 1").get();
  const fields = ["name", "goal", "experience_level", "equipment", "injuries_notes", "days_per_week"] as const;

  if (!existing) {
    db.prepare(
      `INSERT INTO profile (id, name, goal, experience_level, equipment, injuries_notes, days_per_week)
       VALUES (1, @name, @goal, @experience_level, @equipment, @injuries_notes, @days_per_week)`
    ).run({
      name: null,
      goal: null,
      experience_level: null,
      equipment: null,
      injuries_notes: null,
      days_per_week: null,
      ...pick(input, fields),
    });
  } else {
    const sets = fields
      .filter((f) => input[f] !== undefined)
      .map((f) => `${f} = @${f}`)
      .join(", ");
    if (sets.length > 0) {
      db.prepare(`UPDATE profile SET ${sets}, updated_at = datetime('now') WHERE id = 1`).run(
        pick(input, fields)
      );
    }
  }
  return db.prepare("SELECT * FROM profile WHERE id = 1").get();
}

function pick<T extends readonly string[]>(obj: Record<string, unknown>, keys: T) {
  const out: Record<string, unknown> = {};
  for (const k of keys) out[k] = obj[k] ?? null;
  return out;
}

export function executeTool(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case "get_profile": {
      const profile = db.prepare("SELECT * FROM profile WHERE id = 1").get();
      return JSON.stringify(profile ?? { message: "No profile set yet." });
    }

    case "update_profile": {
      const profile = upsertProfile(input);
      return JSON.stringify({ ok: true, profile });
    }

    case "create_workout_plan": {
      db.prepare("UPDATE workout_plans SET is_active = 0 WHERE is_active = 1").run();
      const stmt = db.prepare(
        "INSERT INTO workout_plans (name, plan_json, is_active) VALUES (?, ?, 1)"
      );
      const result = stmt.run(String(input.name), JSON.stringify(input.days));
      return JSON.stringify({ ok: true, plan_id: result.lastInsertRowid });
    }

    case "get_active_plan": {
      const plan = db
        .prepare("SELECT * FROM workout_plans WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1")
        .get() as { name: string; plan_json: string; created_at: string } | undefined;
      if (!plan) return JSON.stringify({ message: "No active plan yet." });
      return JSON.stringify({
        name: plan.name,
        created_at: plan.created_at,
        days: JSON.parse(plan.plan_json),
      });
    }

    case "log_workout": {
      const stmt = db.prepare(
        `INSERT INTO workout_logs (exercise, weight, reps, sets, rpe, notes)
         VALUES (@exercise, @weight, @reps, @sets, @rpe, @notes)`
      );
      const result = stmt.run({
        exercise: String(input.exercise),
        weight: input.weight ?? null,
        reps: input.reps ?? null,
        sets: input.sets ?? null,
        rpe: input.rpe ?? null,
        notes: input.notes ?? null,
      });
      return JSON.stringify({ ok: true, log_id: result.lastInsertRowid });
    }

    case "get_workout_history": {
      const limit = typeof input.limit === "number" ? input.limit : 20;
      let rows: WorkoutLog[];
      if (input.exercise) {
        rows = db
          .prepare(
            "SELECT * FROM workout_logs WHERE exercise = ? ORDER BY logged_at DESC LIMIT ?"
          )
          .all(String(input.exercise), limit) as WorkoutLog[];
      } else {
        rows = db
          .prepare("SELECT * FROM workout_logs ORDER BY logged_at DESC LIMIT ?")
          .all(limit) as WorkoutLog[];
      }
      return JSON.stringify(rows);
    }

    case "log_body_metric": {
      const stmt = db.prepare(
        `INSERT INTO body_metrics (weight_kg, body_fat_pct, notes) VALUES (@weight_kg, @body_fat_pct, @notes)`
      );
      const result = stmt.run({
        weight_kg: input.weight_kg ?? null,
        body_fat_pct: input.body_fat_pct ?? null,
        notes: input.notes ?? null,
      });
      return JSON.stringify({ ok: true, metric_id: result.lastInsertRowid });
    }

    case "get_progress_summary": {
      const limit = typeof input.limit === "number" ? input.limit : 10;
      const rows = db
        .prepare("SELECT * FROM body_metrics ORDER BY logged_at DESC LIMIT ?")
        .all(limit);
      return JSON.stringify(rows);
    }

    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}

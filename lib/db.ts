import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, "trainer.db");

declare global {
  var __trainerDb: Database.Database | undefined;
}

function createConnection() {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT,
      goal TEXT,
      experience_level TEXT,
      equipment TEXT,
      injuries_notes TEXT,
      days_per_week INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS workout_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      plan_json TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS workout_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      logged_at TEXT NOT NULL DEFAULT (datetime('now')),
      exercise TEXT NOT NULL,
      weight REAL,
      reps INTEGER,
      sets INTEGER,
      rpe REAL,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS body_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      logged_at TEXT NOT NULL DEFAULT (datetime('now')),
      weight_kg REAL,
      body_fat_pct REAL,
      notes TEXT
    );
  `);
  return db;
}

// Reuse the connection across hot reloads / route invocations in dev.
export const db = globalThis.__trainerDb ?? createConnection();
if (process.env.NODE_ENV !== "production") {
  globalThis.__trainerDb = db;
}

export interface Profile {
  id: number;
  name: string | null;
  goal: string | null;
  experience_level: string | null;
  equipment: string | null;
  injuries_notes: string | null;
  days_per_week: number | null;
  created_at: string;
  updated_at: string;
}

export interface WorkoutPlan {
  id: number;
  name: string;
  plan_json: string;
  is_active: number;
  created_at: string;
}

export interface WorkoutLog {
  id: number;
  logged_at: string;
  exercise: string;
  weight: number | null;
  reps: number | null;
  sets: number | null;
  rpe: number | null;
  notes: string | null;
}

export interface BodyMetric {
  id: number;
  logged_at: string;
  weight_kg: number | null;
  body_fat_pct: number | null;
  notes: string | null;
}

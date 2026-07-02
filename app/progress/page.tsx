import Link from "next/link";
import { db, type Profile, type WorkoutLog, type BodyMetric } from "@/lib/db";

export const dynamic = "force-dynamic";

interface PlanDay {
  day_label: string;
  exercises: { name: string; sets: number; reps: string; notes?: string }[];
}

function getData() {
  const profile = db.prepare("SELECT * FROM profile WHERE id = 1").get() as Profile | undefined;
  const planRow = db
    .prepare("SELECT * FROM workout_plans WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1")
    .get() as { name: string; plan_json: string; created_at: string } | undefined;
  const logs = db
    .prepare("SELECT * FROM workout_logs ORDER BY logged_at DESC LIMIT 50")
    .all() as WorkoutLog[];
  const metrics = db
    .prepare("SELECT * FROM body_metrics ORDER BY logged_at DESC LIMIT 50")
    .all() as BodyMetric[];

  const plan = planRow
    ? { name: planRow.name, created_at: planRow.created_at, days: JSON.parse(planRow.plan_json) as PlanDay[] }
    : null;

  return { profile, plan, logs, metrics };
}

function fmtDate(s: string) {
  return new Date(s.replace(" ", "T") + "Z").toLocaleString();
}

export default function ProgressPage() {
  const { profile, plan, logs, metrics } = getData();

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-black">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-black sm:px-6">
        <span className="font-semibold text-zinc-900 dark:text-zinc-50">Your Progress</span>
        <Link href="/" className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400">
          ← Back to chat
        </Link>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Profile</h2>
          {profile ? (
            <dl className="grid grid-cols-2 gap-3 rounded-xl border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900 sm:grid-cols-3">
              <Field label="Name" value={profile.name} />
              <Field label="Goal" value={profile.goal} />
              <Field label="Experience" value={profile.experience_level} />
              <Field label="Equipment" value={profile.equipment} />
              <Field label="Days/week" value={profile.days_per_week?.toString() ?? null} />
              <Field label="Injuries / notes" value={profile.injuries_notes} />
            </dl>
          ) : (
            <EmptyState text="No profile yet — chat with Coach to get started." />
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Active plan</h2>
          {plan ? (
            <div className="space-y-3">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {plan.name} · created {fmtDate(plan.created_at)}
              </p>
              {plan.days.map((day, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <h3 className="mb-2 font-medium text-zinc-900 dark:text-zinc-50">{day.day_label}</h3>
                  <ul className="space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                    {day.exercises.map((ex, j) => (
                      <li key={j}>
                        {ex.name} — {ex.sets} × {ex.reps}
                        {ex.notes ? ` (${ex.notes})` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="No plan yet — ask Coach to build you one." />
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Recent workout logs
          </h2>
          {logs.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-2 font-medium">Date</th>
                    <th className="px-4 py-2 font-medium">Exercise</th>
                    <th className="px-4 py-2 font-medium">Sets × Reps</th>
                    <th className="px-4 py-2 font-medium">Weight</th>
                    <th className="px-4 py-2 font-medium">RPE</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-t border-zinc-100 dark:border-zinc-800">
                      <td className="px-4 py-2 text-zinc-500 dark:text-zinc-400">
                        {fmtDate(log.logged_at)}
                      </td>
                      <td className="px-4 py-2">{log.exercise}</td>
                      <td className="px-4 py-2">
                        {log.sets ?? "–"} × {log.reps ?? "–"}
                      </td>
                      <td className="px-4 py-2">{log.weight ?? "–"}</td>
                      <td className="px-4 py-2">{log.rpe ?? "–"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState text="No workouts logged yet." />
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Body metrics
          </h2>
          {metrics.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-2 font-medium">Date</th>
                    <th className="px-4 py-2 font-medium">Weight (kg)</th>
                    <th className="px-4 py-2 font-medium">Body fat %</th>
                    <th className="px-4 py-2 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((m) => (
                    <tr key={m.id} className="border-t border-zinc-100 dark:border-zinc-800">
                      <td className="px-4 py-2 text-zinc-500 dark:text-zinc-400">
                        {fmtDate(m.logged_at)}
                      </td>
                      <td className="px-4 py-2">{m.weight_kg ?? "–"}</td>
                      <td className="px-4 py-2">{m.body_fat_pct ?? "–"}</td>
                      <td className="px-4 py-2">{m.notes ?? "–"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState text="No body metrics logged yet." />
          )}
        </section>
      </main>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-zinc-400">{label}</dt>
      <dd className="text-zinc-900 dark:text-zinc-100">{value || "—"}</dd>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
      {text}
    </div>
  );
}

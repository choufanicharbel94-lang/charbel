import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const profile = db.prepare("SELECT * FROM profile WHERE id = 1").get() ?? null;

  const plan = db
    .prepare("SELECT * FROM workout_plans WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1")
    .get() as { name: string; plan_json: string; created_at: string } | undefined;

  const logs = db
    .prepare("SELECT * FROM workout_logs ORDER BY logged_at DESC LIMIT 50")
    .all();

  const metrics = db
    .prepare("SELECT * FROM body_metrics ORDER BY logged_at DESC LIMIT 50")
    .all();

  return Response.json({
    profile,
    plan: plan ? { name: plan.name, created_at: plan.created_at, days: JSON.parse(plan.plan_json) } : null,
    logs,
    metrics,
  });
}

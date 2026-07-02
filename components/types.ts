import type Anthropic from "@anthropic-ai/sdk";

export interface ToolActivity {
  id: string;
  name: string;
  input?: unknown;
  status: "running" | "done";
}

export interface UITurn {
  id: string;
  role: "user" | "assistant";
  text: string;
  tools: ToolActivity[];
}

export type ApiHistory = Anthropic.MessageParam[];

export type StreamEvent =
  | { type: "text"; text: string }
  | { type: "tool_start"; name: string; input: unknown }
  | { type: "tool_result"; name: string }
  | { type: "done"; messages: ApiHistory; warning?: string }
  | { type: "error"; message: string };

export const TOOL_LABELS: Record<string, string> = {
  get_profile: "Checking your profile",
  update_profile: "Updating your profile",
  create_workout_plan: "Building your workout plan",
  get_active_plan: "Looking up your current plan",
  log_workout: "Logging workout",
  get_workout_history: "Reviewing your workout history",
  log_body_metric: "Logging body metric",
  get_progress_summary: "Checking your progress",
};

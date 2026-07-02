import type Anthropic from "@anthropic-ai/sdk";
import { anthropic, MODEL } from "@/lib/anthropic";
import { tools, executeTool } from "@/lib/tools";

export const runtime = "nodejs";

const MAX_TOOL_ITERATIONS = 8;

const SYSTEM_PROMPT = `You are Coach, an AI personal trainer working in place of a private gym trainer. You help the user with:
- Personalized workout plans tailored to their goal, experience level, equipment, and schedule
- Conversational coaching: exercise technique cues, form tips, motivation, and answering training questions
- Logging workouts and body metrics, and tracking progress over time
- Practical nutrition guidance to support their training goal

Behavior:
- If you don't already know the user's profile (goal, experience level, equipment, injuries, days/week), call get_profile first. If it's empty, ask a few concise onboarding questions before designing a plan.
- Whenever the user shares or changes their goal, experience level, equipment, injuries, or schedule, call update_profile to save it.
- Once you have enough information, design a full weekly plan and save it with create_workout_plan. Explain your reasoning briefly, then present the plan clearly.
- Whenever the user reports a workout they completed, call log_workout for each exercise/set they mention.
- Whenever the user reports their body weight or body fat, call log_body_metric.
- Before giving advice about progressing weight/reps, or when asked about progress, call get_workout_history and/or get_progress_summary rather than guessing.
- Nutrition guidance should be practical and general (calorie/protein targets, meal timing around training, hydration). Always note you are not a substitute for a doctor or registered dietitian, especially for medical conditions or eating disorders.
- Be encouraging but direct, like a good coach. Keep responses focused — use short paragraphs or bullet points for plans, not walls of text.
- Never invent workout history or profile data — always use the tools to check.`;

export async function POST(req: Request) {
  const body = await req.json();
  const incomingMessages = (body?.messages ?? []) as Anthropic.MessageParam[];

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      };

      try {
        const convo: Anthropic.MessageParam[] = [...incomingMessages];

        for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
          const messageStream = anthropic.messages.stream({
            model: MODEL,
            max_tokens: 4096,
            system: SYSTEM_PROMPT,
            tools,
            messages: convo,
          });

          messageStream.on("text", (delta) => {
            send({ type: "text", text: delta });
          });

          const finalMessage = await messageStream.finalMessage();
          convo.push({ role: "assistant", content: finalMessage.content });

          if (finalMessage.stop_reason !== "tool_use") {
            send({ type: "done", messages: convo });
            return;
          }

          const toolUseBlocks = finalMessage.content.filter(
            (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
          );

          const toolResults: Anthropic.ToolResultBlockParam[] = [];
          for (const block of toolUseBlocks) {
            send({ type: "tool_start", name: block.name, input: block.input });
            let resultText: string;
            try {
              resultText = executeTool(block.name, block.input as Record<string, unknown>);
            } catch (err) {
              resultText = JSON.stringify({
                error: err instanceof Error ? err.message : String(err),
              });
            }
            send({ type: "tool_result", name: block.name });
            toolResults.push({
              type: "tool_result",
              tool_use_id: block.id,
              content: resultText,
            });
          }

          convo.push({ role: "user", content: toolResults });
        }

        send({
          type: "done",
          messages: convo,
          warning: "Reached max tool-use iterations for this turn.",
        });
      } catch (err) {
        send({ type: "error", message: err instanceof Error ? err.message : String(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}

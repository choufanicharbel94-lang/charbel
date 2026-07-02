"use client";

import { useEffect, useRef, useState } from "react";
import type Anthropic from "@anthropic-ai/sdk";
import MessageBubble from "./MessageBubble";
import type { ApiHistory, StreamEvent, UITurn } from "./types";

const WELCOME =
  "Hey, I'm Coach — your AI personal trainer. Tell me your goal (build muscle, lose fat, get stronger, general fitness...), your experience level, and what equipment you have access to, and I'll put together a plan.";

let idCounter = 0;
const nextId = () => `t${++idCounter}`;

export default function ChatWindow() {
  const [turns, setTurns] = useState<UITurn[]>([
    { id: nextId(), role: "assistant", text: WELCOME, tools: [] },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const historyRef = useRef<ApiHistory>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    setLoading(true);
    setInput("");

    const userTurn: UITurn = { id: nextId(), role: "user", text, tools: [] };
    const assistantTurn: UITurn = { id: nextId(), role: "assistant", text: "", tools: [] };
    setTurns((prev) => [...prev, userTurn, assistantTurn]);

    const nextHistory: ApiHistory = [
      ...historyRef.current,
      { role: "user", content: text },
    ];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextHistory }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Request failed: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as StreamEvent;
          applyEvent(event, assistantTurn.id);
        }
      }
      if (buffer.trim()) {
        const event = JSON.parse(buffer) as StreamEvent;
        applyEvent(event, assistantTurn.id);
      }
    } catch (err) {
      setTurns((prev) =>
        prev.map((t) =>
          t.id === assistantTurn.id
            ? {
                ...t,
                text:
                  t.text ||
                  `Sorry, something went wrong: ${
                    err instanceof Error ? err.message : String(err)
                  }`,
              }
            : t
        )
      );
    } finally {
      setLoading(false);
    }
  }

  function applyEvent(event: StreamEvent, assistantTurnId: string) {
    if (event.type === "text") {
      setTurns((prev) =>
        prev.map((t) =>
          t.id === assistantTurnId ? { ...t, text: t.text + event.text } : t
        )
      );
    } else if (event.type === "tool_start") {
      setTurns((prev) =>
        prev.map((t) =>
          t.id === assistantTurnId
            ? {
                ...t,
                tools: [
                  ...t.tools,
                  { id: nextId(), name: event.name, input: event.input, status: "running" },
                ],
              }
            : t
        )
      );
    } else if (event.type === "tool_result") {
      setTurns((prev) =>
        prev.map((t) => {
          if (t.id !== assistantTurnId) return t;
          const idx = [...t.tools].reverse().findIndex(
            (tool) => tool.name === event.name && tool.status === "running"
          );
          if (idx === -1) return t;
          const realIdx = t.tools.length - 1 - idx;
          const tools = [...t.tools];
          tools[realIdx] = { ...tools[realIdx], status: "done" };
          return { ...t, tools };
        })
      );
    } else if (event.type === "done") {
      historyRef.current = event.messages as Anthropic.MessageParam[];
    } else if (event.type === "error") {
      setTurns((prev) =>
        prev.map((t) =>
          t.id === assistantTurnId
            ? { ...t, text: t.text || `Error: ${event.message}` }
            : t
        )
      );
    }
  }

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {turns.map((turn) => (
            <MessageBubble key={turn.id} turn={turn} />
          ))}
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="border-t border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-black sm:px-6"
      >
        <div className="mx-auto flex max-w-2xl items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder="Message Coach..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 sm:text-base"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

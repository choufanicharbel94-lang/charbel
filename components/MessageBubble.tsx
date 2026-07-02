import type { UITurn } from "./types";
import { TOOL_LABELS } from "./types";

function formatText(text: string) {
  // Lightweight markdown-ish rendering: bold + bullet lines. Keeps deps at zero.
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = (key: string) => {
    if (listBuffer.length === 0) return;
    nodes.push(
      <ul key={key} className="list-disc pl-5 space-y-1">
        {listBuffer.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ul>
    );
    listBuffer = [];
  };

  lines.forEach((line, i) => {
    const bulletMatch = /^\s*[-*]\s+(.*)/.exec(line);
    if (bulletMatch) {
      listBuffer.push(bulletMatch[1]);
      return;
    }
    flushList(`list-${i}`);
    if (line.trim() === "") {
      nodes.push(<div key={`br-${i}`} className="h-2" />);
    } else {
      nodes.push(
        <p key={`p-${i}`} className="leading-relaxed">
          {renderInline(line)}
        </p>
      );
    }
  });
  flushList("list-end");
  return nodes;
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default function MessageBubble({ turn }: { turn: UITurn }) {
  const isUser = turn.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm sm:text-base ${
          isUser
            ? "bg-emerald-600 text-white rounded-br-sm"
            : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-sm"
        }`}
      >
        {turn.tools.length > 0 && (
          <div className="mb-2 flex flex-col gap-1">
            {turn.tools.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400"
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    t.status === "running" ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                  }`}
                />
                {TOOL_LABELS[t.name] ?? t.name}
                {t.status === "done" && " ✓"}
              </div>
            ))}
          </div>
        )}
        {turn.text ? (
          <div className="space-y-1">{formatText(turn.text)}</div>
        ) : turn.tools.length === 0 ? (
          <span className="inline-flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce" />
          </span>
        ) : null}
      </div>
    </div>
  );
}

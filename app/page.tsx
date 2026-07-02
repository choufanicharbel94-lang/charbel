import Link from "next/link";
import ChatWindow from "@/components/ChatWindow";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col min-h-0 bg-zinc-50 dark:bg-black">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-black sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
            C
          </div>
          <span className="font-semibold text-zinc-900 dark:text-zinc-50">Coach</span>
        </div>
        <Link
          href="/progress"
          className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
        >
          View progress →
        </Link>
      </header>
      <ChatWindow />
    </div>
  );
}

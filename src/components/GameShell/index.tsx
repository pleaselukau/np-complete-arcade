import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

type GameShellProps = {
  title: string;
  controls?: ReactNode;
  rightPanel?: ReactNode;
  children: ReactNode; // center canvas area
};

export default function GameShell({ title, controls, rightPanel, children }: GameShellProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            <div className="mt-1 text-sm text-slate-300">Phase 0 foundation</div>
          </div>

          <Button asChild variant="secondary">
            <Link to="/">← Back</Link>
          </Button>
        </header>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_340px]">
          {/* Center area */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <div className="flex flex-wrap items-center gap-2">{controls}</div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
              {children}
            </div>
          </div>

          {/* Right panel */}
          <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            {rightPanel}
          </aside>
        </div>
      </div>
    </div>
  );
}

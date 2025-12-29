import { getGameCompletedCount } from "@/engine/storage/progressSummary";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const GAMES = [
  { id: "coloring", title: "Graph Coloring" },
  { id: "vertexcover", title: "Vertex Cover / Independent Set" },
  { id: "hamiltonian", title: "Hamiltonian Path" },
  { id: "tsp", title: "Traveling Salesperson (TSP)" },
  { id: "knapsack", title: "Knapsack" },
  { id: "sat", title: "3SAT Playground" },
  { id: "jobshop", title: "Job-Shop Scheduling" },
  { id: "sudoku", title: "Sudoku (Exact Cover / CSP)" },
] as const;

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-4xl font-bold">NP-Complete Arcade</h1>
          <p className="mt-2 text-slate-300 max-w-3xl">
            Interactive, puzzle-based mini-games to build intuition for major NP-complete
            problem families.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GAMES.map((g) => {
            const completedCount = getGameCompletedCount(g.id);

            return (
              <Link key={g.id} to={`/game/${g.id}`}>
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 hover:bg-slate-800 transition">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-lg font-semibold">{g.title}</div>
                    {completedCount > 0 ? (
                      <div className="text-xs rounded-full bg-emerald-500/15 text-emerald-200 border border-emerald-500/30 px-2 py-1">
                        Completed: {completedCount}
                      </div>
                    ) : (
                      <div className="text-xs rounded-full bg-slate-800 text-slate-300 border border-slate-700 px-2 py-1">
                        Not started
                      </div>
                    )}
                  </div>

                  <div className="mt-2 text-sm text-slate-300">Play →</div>
                </div>
              </Link>
            );
          })}

        </div>

        <div className="mt-10">
          <Button asChild variant="secondary">
            <a href="https://en.wikipedia.org/wiki/NP-completeness" target="_blank" rel="noreferrer">
              What is NP-complete?
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

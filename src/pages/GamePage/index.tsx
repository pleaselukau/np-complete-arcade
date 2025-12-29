import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function GamePage() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Game: {id}</h1>
            <p className="mt-1 text-slate-300">
              Phase 0 placeholder — GameShell + Pixi canvas coming next.
            </p>
          </div>

          <Button asChild variant="secondary">
            <Link to="/">← Back</Link>
          </Button>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="text-slate-300">Canvas area placeholder</div>
          <div className="mt-4 h-64 rounded-xl border border-dashed border-slate-700 grid place-items-center">
            <span className="text-slate-400">PixiStage will render here</span>
          </div>
        </div>
      </div>
    </div>
  );
}

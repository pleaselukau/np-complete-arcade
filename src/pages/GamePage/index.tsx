import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import GameShell from "@/components/GameShell";
import PixiStage from "@/components/PixiStage";
import { Button } from "@/components/ui/button";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

export default function GamePage() {
  const { id } = useParams();
  const gameId = id ?? "unknown";

  const [explainMode, setExplainMode] = useState(true);

  const title = useMemo(() => `Game: ${gameId}`, [gameId]);

  return (
    <GameShell
      title={title}
      controls={
        <>
          <Button variant="secondary" onClick={() => alert("Reset (Phase 0 placeholder)")}>
            Reset
          </Button>
          <Button variant="secondary" onClick={() => alert("Hint (Phase 0 placeholder)")}>
            Hint
          </Button>
          <Button onClick={() => alert("Level selector (Phase 0 placeholder)")}>Level 1</Button>
        </>
      }
      rightPanel={
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Explain mode</div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setExplainMode((v) => !v)}
            >
              {explainMode ? "On" : "Off"}
            </Button>
          </div>

          {explainMode ? (
            <div className="text-sm text-slate-300 space-y-3">
              <p>
                Phase 0 placeholder explanation panel. Later this will explain why{" "}
                <span className="text-slate-200">{gameId}</span> is NP-complete and the
                intuition behind constraints.
              </p>
              <p>
                KaTeX check: <InlineMath math={"P \\neq NP"} />
              </p>
            </div>
          ) : (
            <div className="text-sm text-slate-400">Explain mode is off.</div>
          )}

          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-sm">
            Win/Fail feedback placeholder
          </div>
        </div>
      }
    >
      <PixiStage />
    </GameShell>
  );
}

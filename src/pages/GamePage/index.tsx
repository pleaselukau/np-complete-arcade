import EngineProvider from "@/engine/core/EngineProvider";
import { useEngine } from "@/engine/core/EngineProvider";
import { attachPointerDebug } from "@/engine/input/pointer";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import GameShell from "@/components/GameShell";
import PixiStage from "@/components/PixiStage";
import { Button } from "@/components/ui/button";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import { getLevelList, loadLevel } from "@/engine/storage/levelLoader";
import type { BaseLevel } from "@/engine/validation/levelSchemas";
import { getBestScore, isLevelComplete, markLevelComplete } from "@/engine/storage/progress";

function GameControls() {
  const { dispatch } = useEngine();
  return (
    <>
      <Button variant="secondary" onClick={() => dispatch({ type: "RESET" })}>
        Reset
      </Button>
      <Button variant="secondary" onClick={() => dispatch({ type: "HINT" })}>
        Hint
      </Button>
      <Button variant="secondary" onClick={() => dispatch({ type: "MARK_COMPLETE" })}>
        Mark Complete
      </Button>
    </>
  );
}
function BoundStage() {
  const { bindPixi } = useEngine();

  return (
    <PixiStage
      onAppReady={({ app, world, ui }) => {
        bindPixi({ app, world, ui });
        const detach = attachPointerDebug(app, (p) => {
          console.log("pointer click (screen):", p);
        });
      }}
    />
  );
}



export default function GamePage() {
  const { id } = useParams();
  const gameId = id ?? "coloring";

  const levels = useMemo(() => getLevelList(gameId), [gameId]);
  const [levelNum, setLevelNum] = useState<number>(levels[0] ?? 1);

  const [level, setLevel] = useState<BaseLevel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [explainMode, setExplainMode] = useState(true);

  useEffect(() => {
    setLevelNum(levels[0] ?? 1);
  }, [levels]);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setLevel(null);

    loadLevel(gameId, levelNum)
      .then((l) => {
        if (cancelled) return;
        setLevel(l);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
      });

    return () => {
      cancelled = true;
    };
  }, [gameId, levelNum]);

  const title = useMemo(() => `Game: ${gameId}`, [gameId]);

  const completed = isLevelComplete(gameId, levelNum);
  const bestScore = getBestScore(gameId, levelNum);

  return (
    <EngineProvider gameId={gameId} levelNum={levelNum} level={level}>
      <GameShell
        title={title}
        controls={<GameControls />}
        rightPanel={
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Explain mode</div>
              <Button variant="secondary" size="sm" onClick={() => setExplainMode((v) => !v)}>
                {explainMode ? "On" : "Off"}
              </Button>
            </div>

            {explainMode ? (
              <div className="text-sm text-slate-300 space-y-3">
                <p className="text-slate-200 font-medium">
                  {level ? level.title : "Loading level..."}
                </p>
                <p>{level ? level.objective : "—"}</p>
                <p>
                  KaTeX check: <InlineMath math={"P \\neq NP"} />
                </p>
              </div>
            ) : (
              <div className="text-sm text-slate-400">Explain mode is off.</div>
            )}

            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-sm">
              {error ? (
                <div className="text-red-300">Error loading level: {error}</div>
              ) : level ? (
                <div className="text-slate-300">
                  Loaded JSON: <span className="text-slate-200">{level.id}</span>
                </div>
              ) : (
                <div className="text-slate-400">Loading…</div>
              )}
            </div>
          </div>
        }
      >
        <BoundStage />


      </GameShell>
    </EngineProvider>
  );
}

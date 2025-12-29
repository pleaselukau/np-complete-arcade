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
    <GameShell
      title={title}
      controls={
        <>
          <Button variant="secondary" onClick={() => alert("Reset (Phase 0 placeholder)")}>
            Reset
          </Button>

          <Button
            variant="secondary"
            onClick={() => alert(level?.hint ?? "No hint available.")}
            disabled={!level}
          >
            Hint
          </Button>

          <Button
            variant="secondary"
            onClick={() => {
              // Phase 0 "win" is a manual button click.
              const fakeScore = 100;
              markLevelComplete(gameId, levelNum, fakeScore);
              alert("Saved: level completed ✅");
            }}
            disabled={!level}
          >
            Mark Complete
          </Button>

          <Button
            onClick={() => {
              const idx = levels.indexOf(levelNum);
              const next = levels[(idx + 1) % levels.length] ?? levelNum;
              setLevelNum(next);
            }}
            disabled={levels.length === 0}
          >
            Level {levelNum}
          </Button>

          <div className="ml-2 text-sm text-slate-300">
            {completed ? "Completed ✅" : "Not completed"}
            {bestScore !== null ? ` • Best: ${bestScore}` : ""}
          </div>
        </>
      }
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
      <PixiStage />
    </GameShell>
  );
}

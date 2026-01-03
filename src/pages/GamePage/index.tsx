import * as PIXI from "pixi.js";
import type { NodeId } from "@/engine/graph/types";
import { buildGraphFromList } from "@/engine/graph/utils";
import { runForceLayout } from "@/engine/graph/layout";
import { renderGraph } from "@/engine/graph/render";
import EngineProvider from "@/engine/core/EngineProvider";
import { useEngine } from "@/engine/core/EngineProvider";
import { useArcadeStore } from "@/engine/state/arcadeStore";
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
import { initColoring, onActionColoring, validateColoring } from "@/games/coloring/module";
import { colorToHex } from "@/games/coloring/colors";


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
      }}
    />
  );
}

function ColoringScene() {
  const { pixi, level } = useEngine();
  const setStatus = useArcadeStore((s) => s.setStatus);

  const [state, setState] = useState(() =>
    level.data ? initColoring(level.data) : { colors: {} }
  );
  const setHoveredNodeId = useArcadeStore((s) => s.setHoveredNodeId);
  const setSelectedNodeId = useArcadeStore((s) => s.setSelectedNodeId);


  // Re-init when level changes
  useEffect(() => {
    if (!level.data) return;
    setState(initColoring(level.data));
    setStatus({ win: false, errors: [], score: null });
  }, [level.data, setStatus]);

  useEffect(() => {
    const world = pixi.world;
    const ui = pixi.ui;
    if (!world || !ui) return;
    if (!level.data) return;

    const payload: any = level.data.payload;
    if (!payload?.nodes || !payload?.edges) return;

    world.removeChildren();
    ui.removeChildren();

    const g0 = buildGraphFromList({ nodes: payload.nodes, edges: payload.edges });
    const laidOut = runForceLayout(g0, { width: 900, height: 520 });

    const handles = renderGraph(world, laidOut);

    const initial = initColoring(level.data);

    // Apply initial fills
    for (const nodeId of payload.nodes as string[]) {
      handles.setNodeFill(nodeId, colorToHex(initial.colors[nodeId] ?? null));
    }

    // initial validate
    const res0 = validateColoring(initial, level.data);
    setStatus({ win: res0.win, errors: res0.errors, score: res0.score });

    // Attach node click: cycle color
    for (const [id, node] of handles.nodesById.entries()) {
      node.on("pointerover", () => {
        handles.setHovered(id);
        setHoveredNodeId(id);
      });

      node.on("pointerout", () => {
        handles.setHovered(null);
        setHoveredNodeId(null);
      });

      node.on("pointerdown", () => {
        handles.setSelected(id);
        setSelectedNodeId(id);

        setState((prev) => {
          const next = onActionColoring(prev, { type: "CYCLE_NODE_COLOR", nodeId: id });

          handles.setNodeFill(id, colorToHex(next.colors[id] ?? null));

          const res = validateColoring(next, level.data!);
          setStatus({ win: res.win, errors: res.errors, score: res.score });

          return next;
        });
      });
    }


    // initial validate
    setStatus({ win: res0.win, errors: res0.errors, score: res0.score });

    return () => {
      setHoveredNodeId(null);
      setSelectedNodeId(null);
      handles.destroy();
      ui.removeChildren();
      world.removeChildren();
    };
  }, [pixi.world, pixi.ui, level.data, setStatus]);

  return null;
}






export default function GamePage() {
  const { id } = useParams();
  const gameId = id ?? "coloring";

  const levels = useMemo(() => getLevelList(gameId), [gameId]);
  const [levelNum, setLevelNum] = useState<number>(levels[0] ?? 1);

  const [level, setLevel] = useState<BaseLevel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const explainMode = useArcadeStore((s) => s.explainMode);
  const setExplainMode = useArcadeStore((s) => s.setExplainMode);
  const selectedNodeId = useArcadeStore((s) => s.selectedNodeId);
  const hoveredNodeId = useArcadeStore((s) => s.hoveredNodeId);

  const win = useArcadeStore((s) => s.win);
  const errors = useArcadeStore((s) => s.errors);
  const score = useArcadeStore((s) => s.score);



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
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-sm space-y-1">
              <div className="text-slate-300">
                Selected node: <span className="text-slate-200">{selectedNodeId ?? "—"}</span>
              </div>
              <div className="text-slate-300">
                Hovered node: <span className="text-slate-200">{hoveredNodeId ?? "—"}</span>
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-sm space-y-2">
              <div className="text-slate-300">
                Score: <span className="text-slate-200">{score ?? "—"}</span>
              </div>

              {win ? (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2 text-emerald-200">
                  ✅ You win! Proper coloring achieved.
                </div>
              ) : errors.length > 0 ? (
                <div className="space-y-1">
                  <div className="text-red-300 font-medium">Conflicts:</div>
                  <ul className="list-disc pl-5 text-red-200">
                    {errors.slice(0, 4).map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                  {errors.length > 4 ? <div className="text-red-300">…and more</div> : null}
                </div>
              ) : (
                <div className="text-slate-400">No conflicts yet — keep coloring.</div>
              )}
            </div>


          </div>
        }
      >
        <BoundStage />
        <ColoringScene />


      </GameShell>
    </EngineProvider>
  );
}

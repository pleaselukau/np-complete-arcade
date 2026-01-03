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

function GraphScene() {
  const { pixi, level } = useEngine();
  const setHoveredNodeId = useArcadeStore((s) => s.setHoveredNodeId);
  const setSelectedNodeId = useArcadeStore((s) => s.setSelectedNodeId);
  useEffect(() => {
    const world = pixi.world;
    const ui = pixi.ui;
    if (!world || !ui) return;

    const payload: any = level.data?.payload;
    if (!payload?.nodes || !payload?.edges) return;

    // Clear layers (prevents stacking)
    world.removeChildren();
    ui.removeChildren();

    const g0 = buildGraphFromList({ nodes: payload.nodes, edges: payload.edges });
    const laidOut = runForceLayout(g0, { width: 900, height: 520 }); // OK for now

    const handles = renderGraph(world, laidOut);

    // HUD
    const txt = new PIXI.Text({
      text: "Hover / select / drag ✅ (Phase 1 Task 5)",
      style: { fill: 0xe2e8f0, fontSize: 16, fontFamily: "Arial" },
    });
    txt.x = 14;
    txt.y = 10;
    ui.addChild(txt);

    // Interaction state (local)
    let draggingId: NodeId | null = null;

    for (const [id, node] of handles.nodesById.entries()) {
      node.on("pointerover", () => {
        handles.setHovered(id);
        setHoveredNodeId(id);
      });
      node.on("pointerout", () => {
        handles.setHovered(null);
        setHoveredNodeId(null);
      });

      node.on("pointerdown", (e: PIXI.FederatedPointerEvent) => {
        draggingId = id;
        handles.setSelected(id);
        setSelectedNodeId(id);
        (node as any).capturePointer?.(e.pointerId);
      });

      node.on("pointerup", (e: PIXI.FederatedPointerEvent) => {
        draggingId = null;
        (node as any).releasePointer?.(e.pointerId);
      });

      node.on("pointerupoutside", (e: PIXI.FederatedPointerEvent) => {
        draggingId = null;
        (node as any).releasePointer?.(e.pointerId);
      });

      node.on("pointermove", (e: PIXI.FederatedPointerEvent) => {
        if (!draggingId || draggingId !== id) return;

        const p = e.getLocalPosition(world);
        laidOut.nodes[id].x = p.x;
        laidOut.nodes[id].y = p.y;
        node.x = p.x;
        node.y = p.y;

        handles.redrawEdges();
      });
    }

    // Cleanup listeners & graphics on re-render
    return () => {
      handles.destroy();
      ui.removeChildren();
      world.removeChildren();
      setHoveredNodeId(null);
      setSelectedNodeId(null);

    };
  }, [pixi.world, pixi.ui, level.data]);

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

          </div>
        }
      >
        <BoundStage />
        <GraphScene />


      </GameShell>
    </EngineProvider>
  );
}

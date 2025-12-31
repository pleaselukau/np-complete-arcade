import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type * as PIXI from "pixi.js";
import type { BaseLevel } from "@/engine/validation/levelSchemas";
import type { EngineAction, EngineContextValue } from "@/engine/core/types";

const EngineContext = createContext<EngineContextValue | null>(null);

export function useEngine() {
  const ctx = useContext(EngineContext);
  if (!ctx) throw new Error("useEngine must be used inside <EngineProvider />");
  return ctx;
}

type EngineProviderProps = {
  gameId: string;
  levelNum: number;
  level: BaseLevel | null;
  children: React.ReactNode;
};

export default function EngineProvider({ gameId, levelNum, level, children }: EngineProviderProps) {
  const [app, setApp] = useState<PIXI.Application | null>(null);
  const [world, setWorld] = useState<PIXI.Container | null>(null);
  const [ui, setUi] = useState<PIXI.Container | null>(null);

  // stable transform seam for future pan/zoom
  const [worldTransform] = useState({ x: 0, y: 0, scale: 1 });

  const bindPixi = useCallback(
    (payload: { app: PIXI.Application; world: PIXI.Container; ui: PIXI.Container }) => {
      setApp(payload.app);
      setWorld(payload.world);
      setUi(payload.ui);
    },
    []
  );

  const dispatch = useCallback((action: EngineAction) => {
    // eslint-disable-next-line no-console
    console.log("[engine dispatch]", action);
  }, []);

  const value = useMemo<EngineContextValue>(() => {
    const screenToWorld = (p: { x: number; y: number }) => ({
      x: (p.x - worldTransform.x) / worldTransform.scale,
      y: (p.y - worldTransform.y) / worldTransform.scale,
    });

    const worldToScreen = (p: { x: number; y: number }) => ({
      x: p.x * worldTransform.scale + worldTransform.x,
      y: p.y * worldTransform.scale + worldTransform.y,
    });

    return {
      pixi: { app, world, ui, screenToWorld, worldToScreen },
      level: { gameId, levelNum, data: level },
      dispatch,
      bindPixi,
    };
  }, [app, world, ui, gameId, levelNum, level, worldTransform, dispatch, bindPixi]);

  return <EngineContext.Provider value={value}>{children}</EngineContext.Provider>;
}

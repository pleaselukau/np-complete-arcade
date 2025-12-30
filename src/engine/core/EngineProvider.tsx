import { createContext, useContext, useMemo, useRef, useState } from "react";
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
  const appRef = useRef<PIXI.Application | null>(null);
  const worldRef = useRef<PIXI.Container | null>(null);
  const uiRef = useRef<PIXI.Container | null>(null);

  // We store a stable transform seam for future pan/zoom.
  // For now, identity.
  const [worldTransform] = useState({ x: 0, y: 0, scale: 1 });

  const value = useMemo<EngineContextValue>(() => {
    const screenToWorld = (p: { x: number; y: number }) => {
      return {
        x: (p.x - worldTransform.x) / worldTransform.scale,
        y: (p.y - worldTransform.y) / worldTransform.scale,
      };
    };

    const worldToScreen = (p: { x: number; y: number }) => {
      return {
        x: p.x * worldTransform.scale + worldTransform.x,
        y: p.y * worldTransform.scale + worldTransform.y,
      };
    };

    const dispatch = (action: EngineAction) => {
      // Phase 1 Task 2: seam only.
      // Next tasks will route to game module onAction + validate.
      // Keep this centralized.
      // eslint-disable-next-line no-console
      console.log("[engine dispatch]", action);
    };

    return {
      pixi: {
        app: appRef.current,
        world: worldRef.current,
        ui: uiRef.current,
        screenToWorld,
        worldToScreen,
      },
      level: { gameId, levelNum, data: level },
      dispatch,
    };
  }, [gameId, levelNum, level, worldTransform]);

  return <EngineContext.Provider value={value}>{children}</EngineContext.Provider>;
}

// Helpers to connect PixiStage → EngineProvider
export function bindPixiToEngine(payload: {
  app: any;
  world: any;
  ui: any;
  setApp: (app: any) => void;
}) {
  
}

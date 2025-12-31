import type * as PIXI from "pixi.js";
import type { BaseLevel } from "@/engine/validation/levelSchemas";

export type EngineAction =
  | { type: "RESET" }
  | { type: "HINT" }
  | { type: "SELECT_NODE"; nodeId: string | null }
  | { type: "SELECT_EDGE"; edgeId: string | null }
  | { type: "MARK_COMPLETE" };

export type EngineContextValue = {
  pixi: {
    app: PIXI.Application | null;
    world: PIXI.Container | null;
    ui: PIXI.Container | null;
    screenToWorld: (p: { x: number; y: number }) => { x: number; y: number };
    worldToScreen: (p: { x: number; y: number }) => { x: number; y: number };
  };
  level: {
    gameId: string;
    levelNum: number;
    data: BaseLevel | null;
  };
  
  dispatch: (action: EngineAction) => void;
  bindPixi: (payload: { app: PIXI.Application; world: PIXI.Container; ui: PIXI.Container }) => void;

};

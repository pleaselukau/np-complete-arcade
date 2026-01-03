import type { BaseLevel } from "@/engine/validation/levelSchemas";
import { adjacency } from "@/engine/graph/utils";
import { buildGraphFromList } from "@/engine/graph/utils";
import type { ColoringAction, ColoringState, ColorId } from "@/games/coloring/types";

export function initColoring(level: BaseLevel): ColoringState {
  const payload: any = level.payload ?? {};
  const nodes: string[] = payload.nodes ?? [];
  const colors: Record<string, ColorId | null> = {};
  for (const id of nodes) colors[id] = null;
  return { colors };
}

export function onActionColoring(state: ColoringState, action: ColoringAction): ColoringState {
  if (action.type === "RESET") {
    const next: ColoringState = { colors: { ...state.colors } };
    for (const k of Object.keys(next.colors)) next.colors[k] = null;
    return next;
  }

  if (action.type === "CYCLE_NODE_COLOR") {
    const cur = state.colors[action.nodeId] ?? null;
    const nextVal: ColorId | null =
      cur === null ? 1 : cur === 1 ? 2 : cur === 2 ? 3 : null;
    return {
      ...state,
      colors: { ...state.colors, [action.nodeId]: nextVal },
    };
  }

  return state;
}

export function validateColoring(state: ColoringState, level: BaseLevel) {
  const payload: any = level.payload ?? {};
  const maxColors: number = payload.maxColors ?? 3;

  const nodes: string[] = payload.nodes ?? [];
  const edges: [string, string][] = payload.edges ?? [];

  const graph = buildGraphFromList({ nodes, edges });
  const adj = adjacency(graph);

  const errors: string[] = [];

  // max color constraint
  for (const [nodeId, c] of Object.entries(state.colors)) {
    if (c !== null && c > maxColors) {
      errors.push(`Node ${nodeId} uses color ${c}, but maxColors is ${maxColors}.`);
    }
  }

  // edge conflicts
  for (const u of nodes) {
    const cu = state.colors[u];
    if (cu === null) continue;
    for (const v of adj[u] ?? []) {
      if (u < v) {
        const cv = state.colors[v];
        if (cv !== null && cv === cu) {
          errors.push(`Conflict: ${u} and ${v} share color ${cu}.`);
        }
      }
    }
  }

  const allColored = nodes.every((n) => state.colors[n] !== null);
  const win = errors.length === 0 && allColored;

  const coloredCount = nodes.filter((n) => state.colors[n] !== null).length;
  const score = Math.round((coloredCount / Math.max(nodes.length, 1)) * 100);

  return { win, errors, score };
}

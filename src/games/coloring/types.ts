export type ColorId = 1 | 2 | 3;

export type ColoringState = {
  // nodeId -> color (1..3) or null
  colors: Record<string, ColorId | null>;
};

export type ColoringAction =
  | { type: "CYCLE_NODE_COLOR"; nodeId: string }
  | { type: "RESET" };

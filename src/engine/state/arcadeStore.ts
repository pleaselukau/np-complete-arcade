import { create } from "zustand";

type ToolMode = "select" | "drag"; // can expand later

type ArcadeState = {
  // UI
  explainMode: boolean;
  toolMode: ToolMode;

  // Selection / hover (cross-cutting)
  selectedNodeId: string | null;
  hoveredNodeId: string | null;

  setExplainMode: (v: boolean) => void;
  setToolMode: (m: ToolMode) => void;

  setSelectedNodeId: (id: string | null) => void;
  setHoveredNodeId: (id: string | null) => void;
};

export const useArcadeStore = create<ArcadeState>((set) => ({
  explainMode: true,
  toolMode: "select",

  selectedNodeId: null,
  hoveredNodeId: null,

  setExplainMode: (v) => set({ explainMode: v }),
  setToolMode: (m) => set({ toolMode: m }),

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setHoveredNodeId: (id) => set({ hoveredNodeId: id }),
}));

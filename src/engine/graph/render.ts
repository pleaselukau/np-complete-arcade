import * as PIXI from "pixi.js";
import type { Graph, NodeId } from "@/engine/graph/types";

export type GraphRenderHandles = {
  container: PIXI.Container;
  redrawEdges: () => void;
  setHovered: (id: NodeId | null) => void;
  setSelected: (id: NodeId | null) => void;
  nodesById: Map<NodeId, PIXI.Container>;
  destroy: () => void;
  setNodeFill: (id: NodeId, hex: number) => void;
};

export function renderGraph(world: PIXI.Container, graph: Graph): GraphRenderHandles {
  const container = new PIXI.Container();
  container.name = "graph-layer";

  const edgesGfx = new PIXI.Graphics();
  edgesGfx.name = "edges";
  container.addChild(edgesGfx);

  const nodeLayer = new PIXI.Container();
  nodeLayer.name = "nodes";
  container.addChild(nodeLayer);

  const nodesById = new Map<NodeId, PIXI.Container>();

  let hovered: NodeId | null = null;
  let selected: NodeId | null = null;

  const drawNodeStyle = (node: PIXI.Container, id: NodeId) => {
    const circle = node.getChildByName("circle") as PIXI.Graphics | null;
    if (!circle) return;

    const isHovered = hovered === id;
    const isSelected = selected === id;

    circle.clear();
    circle.circle(0, 0, 18);

    // fill
    const fill = (node as any).__fill ?? 0x0f172a;
    circle.fill(fill);

    // stroke color based on state
    const strokeColor = isSelected ? 0x22c55e : isHovered ? 0x60a5fa : 0x94a3b8;
    const strokeWidth = isSelected ? 3 : 2;

    circle.stroke({ width: strokeWidth, color: strokeColor });
  };

  const redrawEdges = () => {
    edgesGfx.clear();
    edgesGfx.beginPath();

    for (const e of Object.values(graph.edges)) {
      const u = graph.nodes[e.u];
      const v = graph.nodes[e.v];
      if (!u || !v) continue;

      edgesGfx.moveTo(u.x, u.y);
      edgesGfx.lineTo(v.x, v.y);
    }

    edgesGfx.stroke({ width: 2, color: 0x334155, alpha: 1 });
  };

  // Initial edges
  redrawEdges();

  // Create nodes
  for (const n of Object.values(graph.nodes)) {
    const node = new PIXI.Container();
    node.x = n.x;
    node.y = n.y;

    node.eventMode = "static";
    node.cursor = "pointer";
    (node as any).__nodeId = n.id;

    const circle = new PIXI.Graphics();
    circle.name = "circle";
    node.addChild(circle);

    const label = new PIXI.Text({
      text: n.id,
      style: { fill: 0xe2e8f0, fontSize: 14, fontFamily: "Arial" },
    });
    label.anchor.set(0.5);
    node.addChild(label);

    nodeLayer.addChild(node);
    nodesById.set(n.id, node);

    drawNodeStyle(node, n.id);
  }

  const setHovered = (id: NodeId | null) => {
    const prev = hovered;
    hovered = id;

    if (prev && nodesById.has(prev)) drawNodeStyle(nodesById.get(prev)!, prev);
    if (id && nodesById.has(id)) drawNodeStyle(nodesById.get(id)!, id);
  };

  const setSelected = (id: NodeId | null) => {
    const prev = selected;
    selected = id;

    if (prev && nodesById.has(prev)) drawNodeStyle(nodesById.get(prev)!, prev);
    if (id && nodesById.has(id)) drawNodeStyle(nodesById.get(id)!, id);
  };

  world.addChild(container);
  const setNodeFill = (id: NodeId, hex: number) => {
    const node = nodesById.get(id);
    if (!node) return;
    (node as any).__fill = hex;
    drawNodeStyle(node, id);
  };

  return {
    container,
    redrawEdges,
    setHovered,
    setSelected,
    setNodeFill,
    nodesById,
    destroy: () => {
      try {
        container.destroy({ children: true });
      } catch {
        // ignore
      }
    },
  };
}

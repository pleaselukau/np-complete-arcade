import * as PIXI from "pixi.js";
import type { Graph } from "@/engine/graph/types";

export type GraphRenderHandles = {
  container: PIXI.Container;
  destroy: () => void;
};

export function renderGraph(world: PIXI.Container, graph: Graph): GraphRenderHandles {
  const container = new PIXI.Container();
  container.name = "graph-layer";

  const edgesGfx = new PIXI.Graphics();
  edgesGfx.name = "edges";
  container.addChild(edgesGfx);

  // Draw edges
	edgesGfx.clear();
	edgesGfx.beginPath();

	for (const e of Object.values(graph.edges)) {
		const u = graph.nodes[e.u];
		const v = graph.nodes[e.v];
		if (!u || !v) continue;

		edgesGfx.moveTo(u.x, u.y);
		edgesGfx.lineTo(v.x, v.y);
	}

	edgesGfx.stroke({ width: 2, color: 0x334155 });

  // Draw nodes
  const nodeLayer = new PIXI.Container();
  nodeLayer.name = "nodes";
  container.addChild(nodeLayer);

  for (const n of Object.values(graph.nodes)) {
    const node = new PIXI.Container();
    node.x = n.x;
    node.y = n.y;
    node.eventMode = "static"; // for future click/hover
    node.cursor = "pointer";

    const circle = new PIXI.Graphics();
    circle.circle(0, 0, 18);
    circle.fill(0x0f172a);
    circle.stroke({ width: 2, color: 0x94a3b8 });
    node.addChild(circle);

    const label = new PIXI.Text({
      text: n.id,
      style: { fill: 0xe2e8f0, fontSize: 14, fontFamily: "Arial" },
    });
    label.anchor.set(0.5);
    node.addChild(label);

    nodeLayer.addChild(node);
  }

  world.addChild(container);

  return {
    container,
    destroy: () => {
      try {
        container.destroy({ children: true });
      } catch {
        // ignore
      }
    },
  };
}

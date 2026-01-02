import { forceCenter, forceLink, forceManyBody, forceSimulation } from "d3-force";
import type { Graph, GraphNode, NodeId } from "@/engine/graph/types";

type SimNode = {
  id: NodeId;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
};

type SimLink = {
  source: NodeId;
  target: NodeId;
};

export function runForceLayout(
  graph: Graph,
  opts: {
    width: number;
    height: number;
    ticks?: number;
    linkDistance?: number;
    chargeStrength?: number;
  }
): Graph {
  const {
    width,
    height,
    ticks = 250,
    linkDistance = 90,
    chargeStrength = -350,
  } = opts;

  const simNodes: SimNode[] = Object.values(graph.nodes).map((n) => ({
    id: n.id,
    // seed near center for stability
    x: width / 2 + (Math.random() - 0.5) * 50,
    y: height / 2 + (Math.random() - 0.5) * 50,
  }));

  const simLinks: SimLink[] = Object.values(graph.edges).map((e) => ({
    source: e.u,
    target: e.v,
  }));

  const sim = forceSimulation(simNodes)
    .force("charge", forceManyBody().strength(chargeStrength))
    .force("center", forceCenter(width / 2, height / 2))
    .force(
      "link",
      forceLink(simLinks)
        .id((d: any) => d.id)
        .distance(linkDistance)
        .strength(1)
    )
    .stop();

  for (let i = 0; i < ticks; i++) sim.tick();

  // write results back into canonical graph
  const nextNodes: Record<NodeId, GraphNode> = { ...graph.nodes };
  for (const sn of simNodes) {
    const n = nextNodes[sn.id];
    if (!n) continue;
    n.x = sn.x ?? n.x;
    n.y = sn.y ?? n.y;
  }

  return { ...graph, nodes: nextNodes };
}

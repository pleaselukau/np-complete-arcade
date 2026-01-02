import type { Graph, NodeId } from "@/engine/graph/types";

export function edgeIdUndirected(u: NodeId, v: NodeId): string {
  return u < v ? `${u}|${v}` : `${v}|${u}`;
}

export function buildGraphFromList(input: {
  nodes: NodeId[];
  edges: [NodeId, NodeId][];
}): Graph {
  const nodes: Graph["nodes"] = {};
  for (const id of input.nodes) {
    nodes[id] = { id, x: 0, y: 0 };
  }

  const edges: Graph["edges"] = {};
  for (const [u, v] of input.edges) {
    if (!nodes[u] || !nodes[v]) continue;
    const id = edgeIdUndirected(u, v);
    edges[id] = { id, u, v };
  }

  return { nodes, edges };
}

export function adjacency(graph: Graph): Record<NodeId, NodeId[]> {
  const adj: Record<NodeId, NodeId[]> = {};
  for (const id of Object.keys(graph.nodes)) adj[id] = [];

  for (const e of Object.values(graph.edges)) {
    adj[e.u].push(e.v);
    adj[e.v].push(e.u);
  }
  return adj;
}

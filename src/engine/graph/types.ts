export type NodeId = string;

export type GraphNode<T = unknown> = {
  id: NodeId;
  x: number;
  y: number;
  data?: T;
};

export type GraphEdge<T = unknown> = {
  id: string;
  u: NodeId;
  v: NodeId;
  data?: T;
};

export type Graph<TN = unknown, TE = unknown> = {
  nodes: Record<NodeId, GraphNode<TN>>;
  edges: Record<string, GraphEdge<TE>>;
};

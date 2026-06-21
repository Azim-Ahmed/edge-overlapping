export type Pt = { x: number; y: number };

export type Hop = { segIndex: number; at: number; side: 1 | -1 };

/**
 * Tuning options for the overlapping (hop) edge. All values have sensible defaults;
 * override them globally via `createHopEdge(options)` or per-edge via `edge.data`.
 */
export type HopEdgeOptions = {
  /** Radius of the hop (bridge) arc drawn where wires cross. Default: 6 */
  hopRadius?: number;
  /** Horizontal offset of the first sibling branch when edges fan out. Default: 18 */
  fanStart?: number;
  /** Horizontal spacing between successive sibling branches. Default: 14 */
  fanStep?: number;
  /** Floating-point tolerance for treating segments as axis-aligned / intersecting. Default: 0.5 */
  epsilon?: number;
};

/** Per-edge overrides accepted on `edge.data`. */
export type HopEdgeData = {
  hopRadius?: number;
  fanStart?: number;
  fanStep?: number;
  epsilon?: number;
};

export const DEFAULT_HOP_EDGE_OPTIONS: Required<HopEdgeOptions> = {
  hopRadius: 6,
  fanStart: 18,
  fanStep: 14,
  epsilon: 0.5,
};

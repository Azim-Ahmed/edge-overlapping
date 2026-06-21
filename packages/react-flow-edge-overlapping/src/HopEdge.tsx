import {
  BaseEdge,
  useStore,
  type EdgeProps,
  type ReactFlowState,
} from "@xyflow/react";
import { useMemo } from "react";
import { branchXFor, buildPolyline, computeHops, getHandlePos, polylineToPath } from "./geometry";
import { DEFAULT_HOP_EDGE_OPTIONS, type HopEdgeData, type HopEdgeOptions } from "./types";

const edgesSelector = (s: ReactFlowState) => s.edges;
const nodesSelector = (s: ReactFlowState) => s.nodeLookup;

/**
 * Create a React Flow edge component that renders overlapping (hop) edges, where
 * crossing wires draw a small bridge arc. Pass the result into `edgeTypes`.
 *
 * @example
 * const edgeTypes = { hop: createHopEdge({ hopRadius: 8 }) };
 */
export function createHopEdge(options: HopEdgeOptions = {}) {
  const defaults = { ...DEFAULT_HOP_EDGE_OPTIONS, ...options };

  function HopEdgeComponent({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    source,
    target,
    sourceHandleId,
    targetHandleId,
    data,
    style,
    markerEnd,
  }: EdgeProps) {
    const allEdges = useStore(edgesSelector);
    const nodeLookup = useStore(nodesSelector) as unknown as Map<string, any>;

    const path = useMemo(() => {
      const d = (data ?? {}) as HopEdgeData;
      const hopRadius = d.hopRadius ?? defaults.hopRadius;
      const fanStart = d.fanStart ?? defaults.fanStart;
      const fanStep = d.fanStep ?? defaults.fanStep;
      const epsilon = d.epsilon ?? defaults.epsilon;

      const meIdx = allEdges.findIndex((e) => e.id === id);
      const meEdge = allEdges[meIdx];
      const myBranch = meEdge
        ? branchXFor(meEdge, allEdges, sourceX, targetX, fanStart, fanStep)
        : (sourceX + targetX) / 2;
      const me = buildPolyline(sourceX, sourceY, targetX, targetY, myBranch);

      // Precompute other polylines + their array indices
      const othersData = allEdges
        .map((e, idx) => ({ e, idx }))
        .filter(({ e }) => e.id !== id)
        .map(({ e, idx }) => {
          const sp = getHandlePos(nodeLookup, e.source, e.sourceHandle, "source");
          const tp = getHandlePos(nodeLookup, e.target, e.targetHandle, "target");
          if (!sp || !tp) return null;
          const oBranch = branchXFor(e, allEdges, sp.x, tp.x, fanStart, fanStep);
          return { idx, poly: buildPolyline(sp.x, sp.y, tp.x, tp.y, oBranch) };
        })
        .filter((x): x is { idx: number; poly: ReturnType<typeof buildPolyline> } => x !== null);

      const hops = computeHops(me, meIdx, othersData, epsilon);
      return polylineToPath(me, hops, hopRadius);
    }, [
      id,
      sourceX,
      sourceY,
      targetX,
      targetY,
      source,
      target,
      sourceHandleId,
      targetHandleId,
      data,
      allEdges,
      nodeLookup,
    ]);

    return <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />;
  }

  HopEdgeComponent.displayName = "HopEdge";
  return HopEdgeComponent;
}

/** Default-configured overlapping (hop) edge. Register it directly in `edgeTypes`. */
export const HopEdge = createHopEdge();

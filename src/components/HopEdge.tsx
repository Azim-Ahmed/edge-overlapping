import { BaseEdge, useStore, type EdgeProps, type ReactFlowState, type Edge as RFEdge } from "@xyflow/react";
import { useMemo } from "react";

type Pt = { x: number; y: number };
type Hop = { segIndex: number; at: number; side: 1 | -1 };

function buildPolyline(sx: number, sy: number, tx: number, ty: number, branchX?: number): Pt[] {
  const midX = branchX ?? (sx + tx) / 2;
  return [
    { x: sx, y: sy },
    { x: midX, y: sy },
    { x: midX, y: ty },
    { x: tx, y: ty },
  ];
}

function polylineToPath(points: Pt[], hops: Hop[]): string {
  const HOP_R = 6;
  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const horizontal = a.y === b.y;
    const segHops = hops.filter((h) => h.segIndex === i).sort((h1, h2) => h1.at - h2.at);

    if (segHops.length === 0) {
      d += ` L ${b.x} ${b.y}`;
      continue;
    }

    if (horizontal) {
      const dir = b.x > a.x ? 1 : -1;
      for (const h of segHops) {
        const cx = a.x + dir * h.at;
        const before = cx - dir * HOP_R;
        const after = cx + dir * HOP_R;
        d += ` L ${before} ${a.y}`;
        // arc bumps "up" (negative y) regardless of dir
        const sweep = dir === 1 ? 1 : 0;
        d += ` A ${HOP_R} ${HOP_R} 0 0 ${sweep} ${after} ${a.y}`;
      }
      d += ` L ${b.x} ${b.y}`;
    } else {
      const dir = b.y > a.y ? 1 : -1;
      for (const h of segHops) {
        const cy = a.y + dir * h.at;
        const before = cy - dir * HOP_R;
        const after = cy + dir * HOP_R;
        d += ` L ${a.x} ${before}`;
        const sweep = dir === 1 ? 0 : 1;
        d += ` A ${HOP_R} ${HOP_R} 0 0 ${sweep} ${a.x} ${after}`;
      }
      d += ` L ${b.x} ${b.y}`;
    }
  }
  return d;
}

const edgesSelector = (s: ReactFlowState) => s.edges;
const nodesSelector = (s: ReactFlowState) => s.nodeLookup;

function getHandlePos(
  nodeLookup: Map<string, any>,
  nodeId: string,
  handleId: string | null | undefined,
  type: "source" | "target",
): Pt | null {
  const n = nodeLookup.get(nodeId);
  if (!n) return null;
  const abs = n.internals?.positionAbsolute ?? n.position;
  const hbs = n.internals?.handleBounds?.[type] ?? [];
  let hb = handleId ? hbs.find((h: any) => h.id === handleId) : null;
  if (!hb) hb = hbs[0];
  if (hb) {
    return { x: abs.x + hb.x + hb.width / 2, y: abs.y + hb.y + hb.height / 2 };
  }
  const w = n.measured?.width ?? 150;
  const h = n.measured?.height ?? 40;
  if (type === "source") return { x: abs.x + w, y: abs.y + h / 2 };
  return { x: abs.x, y: abs.y + h / 2 };
}

const FAN_STEP = 14;
const FAN_START = 18;

function branchXFor(edge: RFEdge, allEdges: RFEdge[], sx: number, tx: number): number {
  const siblings = allEdges
    .filter((e) => e.source === edge.source && (e.sourceHandle ?? null) === (edge.sourceHandle ?? null))
    .sort((a, b) => a.id.localeCompare(b.id));
  const idx = siblings.findIndex((e) => e.id === edge.id);
  const fallback = (sx + tx) / 2;
  if (siblings.length <= 1 || idx < 0) return fallback;
  const branch = sx + FAN_START + idx * FAN_STEP;
  if (tx > sx) return Math.min(branch, tx - 10);
  return Math.max(branch, tx + 10);
}

const EPS = 0.5;

export function HopEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  source,
  target,
  sourceHandleId,
  targetHandleId,
  style,
  markerEnd,
}: EdgeProps) {
  const allEdges = useStore(edgesSelector);
  const nodeLookup = useStore(nodesSelector) as unknown as Map<string, any>;

  const path = useMemo(() => {
    const meIdx = allEdges.findIndex((e) => e.id === id);
    const meEdge = allEdges[meIdx];
    const myBranch = meEdge
      ? branchXFor(meEdge, allEdges, sourceX, targetX)
      : (sourceX + targetX) / 2;
    const me = buildPolyline(sourceX, sourceY, targetX, targetY, myBranch);

    const hops: Hop[] = [];

    // Precompute other polylines + their array indices
    const othersData = allEdges
      .map((e, idx) => ({ e, idx }))
      .filter(({ e }) => e.id !== id)
      .map(({ e, idx }) => {
        const sp = getHandlePos(nodeLookup, e.source, e.sourceHandle, "source");
        const tp = getHandlePos(nodeLookup, e.target, e.targetHandle, "target");
        if (!sp || !tp) return null;
        const oBranch = branchXFor(e, allEdges, sp.x, tp.x);
        return { idx, poly: buildPolyline(sp.x, sp.y, tp.x, tp.y, oBranch) };
      })
      .filter((x): x is { idx: number; poly: Pt[] } => x !== null);

    for (let i = 0; i < me.length - 1; i++) {
      const a = me[i];
      const b = me[i + 1];
      const myH = Math.abs(a.y - b.y) < EPS;
      const myV = Math.abs(a.x - b.x) < EPS;
      if (!myH && !myV) continue;

      for (const { idx: oIdx, poly: op } of othersData) {
        // Rule: only the edge that renders ON TOP (later in array) draws the hop.
        // This guarantees the bump is visible above the wire underneath.
        if (oIdx > meIdx) continue;

        for (let j = 0; j < op.length - 1; j++) {
          const oa = op[j];
          const ob = op[j + 1];
          const oH = Math.abs(oa.y - ob.y) < EPS;
          const oV = Math.abs(oa.x - ob.x) < EPS;

          if (myH && oV) {
            const xMin = Math.min(a.x, b.x);
            const xMax = Math.max(a.x, b.x);
            const yMin = Math.min(oa.y, ob.y);
            const yMax = Math.max(oa.y, ob.y);
            if (oa.x > xMin + EPS && oa.x < xMax - EPS && a.y > yMin + EPS && a.y < yMax - EPS) {
              const dir = b.x > a.x ? 1 : -1;
              hops.push({ segIndex: i, at: dir * (oa.x - a.x), side: 1 });
            }
          } else if (myV && oH) {
            const yMin = Math.min(a.y, b.y);
            const yMax = Math.max(a.y, b.y);
            const xMin = Math.min(oa.x, ob.x);
            const xMax = Math.max(oa.x, ob.x);
            if (oa.y > yMin + EPS && oa.y < yMax - EPS && a.x > xMin + EPS && a.x < xMax - EPS) {
              const dir = b.y > a.y ? 1 : -1;
              hops.push({ segIndex: i, at: dir * (oa.y - a.y), side: 1 });
            }
          }
        }
      }
    }

    return polylineToPath(me, hops);
  }, [id, sourceX, sourceY, targetX, targetY, source, target, sourceHandleId, targetHandleId, allEdges, nodeLookup]);

  return <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />;
}

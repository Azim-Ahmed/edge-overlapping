import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { R as ReactFlowProvider, u as useNodesState, a as useEdgesState, b as useReactFlow, i as index, B as Background, c as BackgroundVariant, M as MiniMap, C as Controls, d as useStore, e as BaseEdge, H as Handle } from "../_libs/xyflow__react.mjs";
import { S as SITE } from "./router-BRaRX4I_.mjs";
import { G as GitBranch, F as Flag, a as Globe, D as Database, C as Cpu, R as Rocket, S as ShieldCheck, b as FlaskConical, H as Hammer, c as Clock, Z as Zap } from "../_libs/lucide-react.mjs";
import { M as MarkerType, P as Position } from "../_libs/xyflow__system.mjs";
import "../_libs/classcat.mjs";
import "../_libs/zustand.mjs";
import "../_libs/use-sync-external-store.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/d3-zoom.mjs";
import "../_libs/d3-transition.mjs";
import "../_libs/d3-dispatch.mjs";
import "../_libs/d3-timer.mjs";
import "../_libs/d3-interpolate.mjs";
import "../_libs/d3-color.mjs";
import "../_libs/d3-selection.mjs";
import "../_libs/d3-ease.mjs";
import "../_libs/d3-drag.mjs";
function buildPolyline(sx, sy, tx, ty, branchX) {
  const midX = branchX ?? (sx + tx) / 2;
  return [
    { x: sx, y: sy },
    { x: midX, y: sy },
    { x: midX, y: ty },
    { x: tx, y: ty }
  ];
}
function polylineToPath(points, hops) {
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
const edgesSelector = (s) => s.edges;
const nodesSelector = (s) => s.nodeLookup;
function getHandlePos(nodeLookup, nodeId, handleId, type) {
  const n = nodeLookup.get(nodeId);
  if (!n) return null;
  const abs = n.internals?.positionAbsolute ?? n.position;
  const hbs = n.internals?.handleBounds?.[type] ?? [];
  let hb = handleId ? hbs.find((h2) => h2.id === handleId) : null;
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
function branchXFor(edge, allEdges, sx, tx) {
  const siblings = allEdges.filter((e) => e.source === edge.source && (e.sourceHandle ?? null) === (edge.sourceHandle ?? null)).sort((a, b) => a.id.localeCompare(b.id));
  const idx = siblings.findIndex((e) => e.id === edge.id);
  const fallback = (sx + tx) / 2;
  if (siblings.length <= 1 || idx < 0) return fallback;
  const branch = sx + FAN_START + idx * FAN_STEP;
  if (tx > sx) return Math.min(branch, tx - 10);
  return Math.max(branch, tx + 10);
}
const EPS = 0.5;
function HopEdge({
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
  markerEnd
}) {
  const allEdges = useStore(edgesSelector);
  const nodeLookup = useStore(nodesSelector);
  const path = reactExports.useMemo(() => {
    const meIdx = allEdges.findIndex((e) => e.id === id);
    const meEdge = allEdges[meIdx];
    const myBranch = meEdge ? branchXFor(meEdge, allEdges, sourceX, targetX) : (sourceX + targetX) / 2;
    const me = buildPolyline(sourceX, sourceY, targetX, targetY, myBranch);
    const hops = [];
    const othersData = allEdges.map((e, idx) => ({ e, idx })).filter(({ e }) => e.id !== id).map(({ e, idx }) => {
      const sp = getHandlePos(nodeLookup, e.source, e.sourceHandle, "source");
      const tp = getHandlePos(nodeLookup, e.target, e.targetHandle, "target");
      if (!sp || !tp) return null;
      const oBranch = branchXFor(e, allEdges, sp.x, tp.x);
      return { idx, poly: buildPolyline(sp.x, sp.y, tp.x, tp.y, oBranch) };
    }).filter((x) => x !== null);
    for (let i = 0; i < me.length - 1; i++) {
      const a = me[i];
      const b = me[i + 1];
      const myH = Math.abs(a.y - b.y) < EPS;
      const myV = Math.abs(a.x - b.x) < EPS;
      if (!myH && !myV) continue;
      for (const { idx: oIdx, poly: op } of othersData) {
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
  return /* @__PURE__ */ jsxRuntimeExports.jsx(BaseEdge, { id, path, style, markerEnd });
}
const ICON_MAP = {
  zap: Zap,
  clock: Clock,
  hammer: Hammer,
  flask: FlaskConical,
  shield: ShieldCheck,
  rocket: Rocket,
  cpu: Cpu,
  database: Database,
  globe: Globe,
  flag: Flag,
  branch: GitBranch
};
function NodeIcon({
  name,
  size = 14,
  className = ""
}) {
  const C = name && ICON_MAP[name] ? ICON_MAP[name] : Cpu;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(C, { size, className });
}
const TRIGGER_V = {
  green: "from-emerald-500 to-teal-600 shadow-emerald-200",
  blue: "from-blue-500 to-indigo-600 shadow-blue-200",
  purple: "from-purple-500 to-violet-600 shadow-purple-200"
};
function TriggerNode({
  data
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `relative flex items-center gap-2 rounded-full bg-gradient-to-r ${TRIGGER_V[data.variant ?? "green"]} px-4 py-2.5 shadow-lg`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(NodeIcon, { name: data.icon, size: 13, className: "text-white/80" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "whitespace-nowrap text-[13px] font-semibold tracking-tight text-white", children: data.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Handle,
          {
            id: "out",
            type: "source",
            position: Position.Right,
            className: "!h-3 !w-3 !border-2 !border-white !bg-white/40"
          }
        )
      ]
    }
  );
}
const PROCESS_V = {
  blue: {
    border: "border-blue-200",
    bar: "bg-blue-400",
    badge: "bg-blue-50 border-blue-200",
    icon: "text-blue-500"
  },
  purple: {
    border: "border-purple-200",
    bar: "bg-purple-400",
    badge: "bg-purple-50 border-purple-200",
    icon: "text-purple-500"
  },
  green: {
    border: "border-green-200",
    bar: "bg-green-400",
    badge: "bg-green-50 border-green-200",
    icon: "text-green-500"
  },
  orange: {
    border: "border-orange-200",
    bar: "bg-orange-400",
    badge: "bg-orange-50 border-orange-200",
    icon: "text-orange-500"
  },
  rose: {
    border: "border-rose-200",
    bar: "bg-rose-400",
    badge: "bg-rose-50 border-rose-200",
    icon: "text-rose-500"
  },
  cyan: {
    border: "border-cyan-200",
    bar: "bg-cyan-400",
    badge: "bg-cyan-50 border-cyan-200",
    icon: "text-cyan-500"
  }
};
function ProcessNode({
  data
}) {
  const v = PROCESS_V[data.variant ?? "blue"];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `relative flex min-w-[160px] overflow-hidden rounded-xl border bg-white shadow-sm ${v.border}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-1 shrink-0 ${v.bar}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 px-3 py-3 pr-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: `flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${v.badge}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(NodeIcon, { name: data.icon, size: 15, className: v.icon })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[12px] font-semibold leading-tight text-slate-800", children: data.label }),
            data.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 truncate text-[10px] leading-tight text-slate-400", children: data.description })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Handle,
          {
            id: "in",
            type: "target",
            position: Position.Left,
            className: "!h-2.5 !w-2.5 !border-2 !border-white !bg-slate-300"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Handle,
          {
            id: "out",
            type: "source",
            position: Position.Right,
            className: "!h-2.5 !w-2.5 !border-2 !border-white !bg-slate-300"
          }
        )
      ]
    }
  );
}
function DecisionNode({ data }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center justify-center", style: { width: 110, height: 110 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "absolute rounded-md border-2 border-amber-400 bg-amber-50",
        style: { width: 78, height: 78, transform: "rotate(45deg)" }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative z-10 px-3 text-center text-[11px] font-bold leading-tight text-amber-800", children: data.label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Handle,
      {
        id: "in",
        type: "target",
        position: Position.Left,
        className: "!h-2.5 !w-2.5 !border-2 !border-white !bg-amber-400"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Handle,
      {
        id: "yes",
        type: "source",
        position: Position.Right,
        className: "!h-2.5 !w-2.5 !border-2 !border-white !bg-green-400"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Handle,
      {
        id: "no",
        type: "source",
        position: Position.Bottom,
        className: "!h-2.5 !w-2.5 !border-2 !border-white !bg-red-400"
      }
    )
  ] });
}
const TERMINAL_V = {
  slate: "from-slate-600 to-slate-800 shadow-slate-300",
  green: "from-emerald-500 to-green-700 shadow-green-200",
  red: "from-rose-500 to-red-700 shadow-red-200"
};
function TerminalNode({
  data
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `relative flex items-center gap-2 rounded-full bg-gradient-to-r ${TERMINAL_V[data.variant ?? "slate"]} px-4 py-2.5 shadow-lg`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Handle,
          {
            id: "in",
            type: "target",
            position: Position.Left,
            className: "!h-3 !w-3 !border-2 !border-white !bg-white/40"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NodeIcon, { name: data.icon, size: 13, className: "text-white/80" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "whitespace-nowrap text-[13px] font-semibold tracking-tight text-white", children: data.label })
      ]
    }
  );
}
const nodeTypes = {
  trigger: TriggerNode,
  process: ProcessNode,
  decision: DecisionNode,
  terminal: TerminalNode
};
const edgeTypes = { hop: HopEdge };
const STROKE = (c) => ({
  stroke: c,
  strokeWidth: 2,
  strokeLinecap: "round"
});
const ARROW = (c) => ({ type: MarkerType.ArrowClosed, width: 12, height: 12, color: c });
const nodes = [
  {
    id: "push",
    type: "trigger",
    position: { x: 40, y: 70 },
    data: { label: "Push Code", icon: "zap", variant: "green" }
  },
  {
    id: "schedule",
    type: "trigger",
    position: { x: 40, y: 270 },
    data: { label: "Scheduled", icon: "clock", variant: "blue" }
  },
  {
    id: "build",
    type: "process",
    position: { x: 360, y: 100 },
    data: {
      label: "Build & Lint",
      description: "Compile + type-check",
      icon: "hammer",
      variant: "blue"
    }
  },
  {
    id: "test",
    type: "process",
    position: { x: 460, y: 250 },
    data: {
      label: "Run Tests",
      description: "Unit & integration",
      icon: "flask",
      variant: "purple"
    }
  },
  {
    id: "quality",
    type: "process",
    position: { x: 680, y: 170 },
    data: {
      label: "Quality Gate",
      description: "Coverage & security",
      icon: "shield",
      variant: "green"
    }
  },
  {
    id: "deploy",
    type: "terminal",
    position: { x: 900, y: 190 },
    data: { label: "Deploy", icon: "rocket", variant: "green" }
  }
];
const edges = [
  {
    id: "e_sb",
    source: "schedule",
    sourceHandle: "out",
    target: "build",
    targetHandle: "in",
    type: "hop",
    style: STROKE("#6366f1"),
    markerEnd: ARROW("#6366f1")
  },
  {
    id: "e_pt",
    source: "push",
    sourceHandle: "out",
    target: "test",
    targetHandle: "in",
    type: "hop",
    style: STROKE("#10b981"),
    markerEnd: ARROW("#10b981")
  },
  {
    id: "e_bq",
    source: "build",
    sourceHandle: "out",
    target: "quality",
    targetHandle: "in",
    type: "hop",
    style: STROKE("#3b82f6"),
    markerEnd: ARROW("#3b82f6")
  },
  {
    id: "e_tq",
    source: "test",
    sourceHandle: "out",
    target: "quality",
    targetHandle: "in",
    type: "hop",
    style: STROKE("#a855f7"),
    markerEnd: ARROW("#a855f7")
  },
  {
    id: "e_qd",
    source: "quality",
    sourceHandle: "out",
    target: "deploy",
    targetHandle: "in",
    type: "hop",
    style: STROKE("#22c55e"),
    markerEnd: ARROW("#22c55e")
  }
];
const PALETTE = [
  { kind: "trigger", label: "Trigger" },
  { kind: "process", label: "Process" },
  { kind: "decision", label: "Decision" },
  { kind: "terminal", label: "End" }
];
function PaletteItem({ kind, label }) {
  let preview;
  if (kind === "trigger") {
    preview = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-2.5 py-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 9, className: "text-white/80" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-semibold text-white", children: "Start" })
    ] });
  } else if (kind === "process") {
    preview = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-7 w-full items-center overflow-hidden rounded-lg border border-blue-200 bg-white", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full w-1 bg-blue-400" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 px-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Cpu, { size: 9, className: "text-blue-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-semibold text-slate-700", children: "Step" })
      ] })
    ] });
  } else if (kind === "decision") {
    preview = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex h-7 w-10 items-center justify-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-5 w-5 rotate-45 rounded-sm border border-amber-400 bg-amber-50" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute text-[8px] font-bold text-amber-700", children: "?" })
    ] });
  } else {
    preview = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 rounded-full bg-gradient-to-r from-slate-600 to-slate-800 px-2.5 py-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { size: 9, className: "text-white/80" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-semibold text-white", children: "End" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      draggable: true,
      onDragStart: (e) => {
        e.dataTransfer.setData("application/node-kind", kind);
        e.dataTransfer.effectAllowed = "move";
      },
      title: `Drag to canvas: ${label}`,
      className: "flex w-full cursor-grab flex-col items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 p-2 transition-colors hover:border-slate-300 hover:bg-white active:cursor-grabbing",
      children: [
        preview,
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-medium text-slate-500", children: label })
      ]
    }
  );
}
function CircuitFlowInner() {
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(edges);
  const wrapperRef = reactExports.useRef(null);
  const { screenToFlowPosition } = useReactFlow();
  const idCounter = reactExports.useRef(1e3);
  const refreshHops = reactExports.useCallback(() => {
    setFlowEdges((eds) => eds.map((e) => ({ ...e, data: { ...e.data, _r: Date.now() } })));
  }, [setFlowEdges]);
  const onInit = reactExports.useCallback((instance) => {
    instance.fitView({ padding: 0.22 });
  }, []);
  const onDragOver = reactExports.useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);
  const onDrop = reactExports.useCallback(
    (e) => {
      e.preventDefault();
      const kind = e.dataTransfer.getData("application/node-kind");
      if (!kind) return;
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const newId = `N${++idCounter.current}`;
      const defaults = {
        trigger: { label: "Trigger", icon: "zap", variant: "green" },
        process: { label: "Process", description: "Description", icon: "cpu", variant: "blue" },
        decision: { label: "Decision?" },
        terminal: { label: "End", icon: "flag", variant: "slate" }
      };
      setFlowNodes((ns) => [...ns, { id: newId, type: kind, position, data: defaults[kind] }]);
    },
    [screenToFlowPosition, setFlowNodes]
  );
  const onConnect = reactExports.useCallback(
    (conn) => {
      if (!conn.source || !conn.target) return;
      const color = "#94a3b8";
      setFlowEdges((eds) => [
        ...eds,
        {
          id: `e${++idCounter.current}`,
          source: conn.source,
          target: conn.target,
          sourceHandle: conn.sourceHandle ?? void 0,
          targetHandle: conn.targetHandle ?? void 0,
          type: "hop",
          style: STROKE(color),
          markerEnd: ARROW(color)
        }
      ]);
    },
    [setFlowEdges]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-screen w-screen flex-col bg-slate-50 font-sans text-slate-700", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-5 py-3 shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GitBranch, { size: 15, className: "text-white" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-sm font-bold leading-tight text-slate-800", children: SITE.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] leading-tight text-slate-400", children: SITE.tagline })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-emerald-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-medium text-slate-500", children: "Lapping edges active" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-0 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "z-10 flex w-28 shrink-0 flex-col gap-2 border-r border-slate-200 bg-white p-3 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400", children: "Nodes" }),
        PALETTE.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(PaletteItem, { ...p }, p.kind)),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-auto pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px] leading-relaxed text-slate-400", children: "Drag onto canvas, then connect handles to wire up." }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: wrapperRef, className: "relative flex-1", onDrop, onDragOver, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        index,
        {
          nodes: flowNodes,
          edges: flowEdges,
          onNodesChange,
          onEdgesChange,
          onNodeDragStop: refreshHops,
          onConnect,
          onInit,
          nodeTypes,
          edgeTypes,
          proOptions: { hideAttribution: true },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Background, { variant: BackgroundVariant.Dots, gap: 20, size: 1.5, color: "#e2e8f0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              MiniMap,
              {
                pannable: true,
                zoomable: true,
                maskColor: "rgba(241,245,249,0.75)",
                style: { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8 },
                nodeColor: (n) => n.type === "trigger" ? "#10b981" : n.type === "terminal" ? "#475569" : n.type === "decision" ? "#f59e0b" : "#3b82f6",
                nodeStrokeWidth: 0
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Controls, { showInteractive: false })
          ]
        }
      ) })
    ] })
  ] });
}
function CircuitFlow() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ReactFlowProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircuitFlowInner, {}) });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(CircuitFlow, {});
export {
  SplitComponent as component
};

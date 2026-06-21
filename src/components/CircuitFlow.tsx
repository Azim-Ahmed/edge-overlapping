import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  BackgroundVariant,
  useReactFlow,
  useEdgesState,
  useNodesState,
  MarkerType,
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
  type ReactFlowInstance,
} from "@xyflow/react";
import { useCallback, useRef } from "react";
import "@xyflow/react/dist/style.css";
import {
  Zap,
  Clock,
  Hammer,
  FlaskConical,
  ShieldCheck,
  Rocket,
  Cpu,
  Database,
  Globe,
  Flag,
  GitBranch,
} from "lucide-react";
import { SITE } from "@/lib/site";
import { HopEdge } from "react-flow-edge-overlapping";

/* ─────────────────────────────────────────
   Icon lookup
───────────────────────────────────────── */
const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
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
  branch: GitBranch,
};

function NodeIcon({
  name,
  size = 14,
  className = "",
}: {
  name?: string;
  size?: number;
  className?: string;
}) {
  const C = name && ICON_MAP[name] ? ICON_MAP[name] : Cpu;
  return <C size={size} className={className} />;
}

/* ─────────────────────────────────────────
   Trigger Node — rounded pill, gradient
───────────────────────────────────────── */
const TRIGGER_V = {
  green: "from-emerald-500 to-teal-600 shadow-emerald-200",
  blue: "from-blue-500 to-indigo-600 shadow-blue-200",
  purple: "from-purple-500 to-violet-600 shadow-purple-200",
} as const;

function TriggerNode({
  data,
}: {
  data: { label: string; icon?: string; variant?: keyof typeof TRIGGER_V };
}) {
  return (
    <div
      className={`relative flex items-center gap-2 rounded-full bg-linear-to-r ${TRIGGER_V[data.variant ?? "green"]} px-4 py-2.5 shadow-lg`}
    >
      <NodeIcon name={data.icon} size={13} className="text-white/80" />
      <span className="whitespace-nowrap text-[13px] font-semibold tracking-tight text-white">
        {data.label}
      </span>
      <Handle
        id="out"
        type="source"
        position={Position.Right}
        className="h-3! w-3! border-2! border-white! bg-white/40!"
      />
    </div>
  );
}

/* ─────────────────────────────────────────
   Process Node — card with accent bar
───────────────────────────────────────── */
const PROCESS_V = {
  blue: {
    border: "border-blue-200",
    bar: "bg-blue-400",
    badge: "bg-blue-50 border-blue-200",
    icon: "text-blue-500",
  },
  purple: {
    border: "border-purple-200",
    bar: "bg-purple-400",
    badge: "bg-purple-50 border-purple-200",
    icon: "text-purple-500",
  },
  green: {
    border: "border-green-200",
    bar: "bg-green-400",
    badge: "bg-green-50 border-green-200",
    icon: "text-green-500",
  },
  orange: {
    border: "border-orange-200",
    bar: "bg-orange-400",
    badge: "bg-orange-50 border-orange-200",
    icon: "text-orange-500",
  },
  rose: {
    border: "border-rose-200",
    bar: "bg-rose-400",
    badge: "bg-rose-50 border-rose-200",
    icon: "text-rose-500",
  },
  cyan: {
    border: "border-cyan-200",
    bar: "bg-cyan-400",
    badge: "bg-cyan-50 border-cyan-200",
    icon: "text-cyan-500",
  },
} as const;

function ProcessNode({
  data,
}: {
  data: { label: string; description?: string; icon?: string; variant?: keyof typeof PROCESS_V };
}) {
  const v = PROCESS_V[data.variant ?? "blue"];
  return (
    <div
      className={`relative flex min-w-[160px] overflow-hidden rounded-xl border bg-white shadow-sm ${v.border}`}
    >
      <div className={`w-1 shrink-0 ${v.bar}`} />
      <div className="flex items-center gap-3 px-3 py-3 pr-4">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${v.badge}`}
        >
          <NodeIcon name={data.icon} size={15} className={v.icon} />
        </div>
        <div className="min-w-0">
          <p className="text-[12px] font-semibold leading-tight text-slate-800">{data.label}</p>
          {data.description && (
            <p className="mt-0.5 truncate text-[10px] leading-tight text-slate-400">
              {data.description}
            </p>
          )}
        </div>
      </div>
      <Handle
        id="in"
        type="target"
        position={Position.Left}
        className="h-2.5! w-2.5! border-2! border-white! bg-slate-300!"
      />
      <Handle
        id="out"
        type="source"
        position={Position.Right}
        className="h-2.5! w-2.5! border-2! border-white! bg-slate-300!"
      />
    </div>
  );
}

/* ─────────────────────────────────────────
   Decision Node — diamond
───────────────────────────────────────── */
function DecisionNode({ data }: { data: { label: string } }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 110, height: 110 }}>
      <div
        className="absolute rounded-md border-2 border-amber-400 bg-amber-50"
        style={{ width: 78, height: 78, transform: "rotate(45deg)" }}
      />
      <span className="relative z-10 px-3 text-center text-[11px] font-bold leading-tight text-amber-800">
        {data.label}
      </span>
      <Handle
        id="in"
        type="target"
        position={Position.Left}
        className="h-2.5! w-2.5! border-2! border-white! bg-amber-400!"
      />
      <Handle
        id="yes"
        type="source"
        position={Position.Right}
        className="h-2.5! w-2.5! border-2! border-white! bg-green-400!"
      />
      <Handle
        id="no"
        type="source"
        position={Position.Bottom}
        className="h-2.5! w-2.5! border-2! border-white! bg-red-400!"
      />
    </div>
  );
}

/* ─────────────────────────────────────────
   Terminal Node — pill, dark
───────────────────────────────────────── */
const TERMINAL_V = {
  slate: "from-slate-600 to-slate-800 shadow-slate-300",
  green: "from-emerald-500 to-green-700 shadow-green-200",
  red: "from-rose-500 to-red-700 shadow-red-200",
} as const;

function TerminalNode({
  data,
}: {
  data: { label: string; icon?: string; variant?: keyof typeof TERMINAL_V };
}) {
  return (
    <div
      className={`relative flex items-center gap-2 rounded-full bg-linear-to-r ${TERMINAL_V[data.variant ?? "slate"]} px-4 py-2.5 shadow-lg`}
    >
      <Handle
        id="in"
        type="target"
        position={Position.Left}
        className="h-3! w-3! border-2! border-white! bg-white/40!"
      />
      <NodeIcon name={data.icon} size={13} className="text-white/80" />
      <span className="whitespace-nowrap text-[13px] font-semibold tracking-tight text-white">
        {data.label}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────
   Registry
───────────────────────────────────────── */
const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  process: ProcessNode,
  decision: DecisionNode,
  terminal: TerminalNode,
};

const edgeTypes: EdgeTypes = { hop: HopEdge };

/* ─────────────────────────────────────────
   Initial graph — CI/CD pipeline
   
   Two wires intentionally cross to showcase the overlapping (hop) edge feature:
     • schedule → build  (goes up-right,  placed FIRST  → drawn underneath)
     • push     → test   (goes down-right, placed SECOND → draws the hop arc)
   
   Verified crossing: push→test's vertical segment at x≈315
   intersects schedule→build's horizontal segment at y≈120.
───────────────────────────────────────── */
const STROKE = (c: string): React.CSSProperties => ({
  stroke: c,
  strokeWidth: 2,
  strokeLinecap: "round",
});
const ARROW = (c: string) => ({ type: MarkerType.ArrowClosed, width: 12, height: 12, color: c });

const nodes: Node[] = [
  {
    id: "push",
    type: "trigger",
    position: { x: 40, y: 70 },
    data: { label: "Push Code", icon: "zap", variant: "green" },
  },
  {
    id: "schedule",
    type: "trigger",
    position: { x: 40, y: 270 },
    data: { label: "Scheduled", icon: "clock", variant: "blue" },
  },
  {
    id: "build",
    type: "process",
    position: { x: 360, y: 100 },
    data: {
      label: "Build & Lint",
      description: "Compile + type-check",
      icon: "hammer",
      variant: "blue",
    },
  },
  {
    id: "test",
    type: "process",
    position: { x: 460, y: 250 },
    data: {
      label: "Run Tests",
      description: "Unit & integration",
      icon: "flask",
      variant: "purple",
    },
  },
  {
    id: "quality",
    type: "process",
    position: { x: 680, y: 170 },
    data: {
      label: "Quality Gate",
      description: "Coverage & security",
      icon: "shield",
      variant: "green",
    },
  },
  {
    id: "deploy",
    type: "terminal",
    position: { x: 900, y: 190 },
    data: { label: "Deploy", icon: "rocket", variant: "green" },
  },
];

const edges: Edge[] = [
  {
    id: "e_sb",
    source: "schedule",
    sourceHandle: "out",
    target: "build",
    targetHandle: "in",
    type: "hop",
    style: STROKE("#6366f1"),
    markerEnd: ARROW("#6366f1"),
  },
  {
    id: "e_pt",
    source: "push",
    sourceHandle: "out",
    target: "test",
    targetHandle: "in",
    type: "hop",
    style: STROKE("#10b981"),
    markerEnd: ARROW("#10b981"),
  },
  {
    id: "e_bq",
    source: "build",
    sourceHandle: "out",
    target: "quality",
    targetHandle: "in",
    type: "hop",
    style: STROKE("#3b82f6"),
    markerEnd: ARROW("#3b82f6"),
  },
  {
    id: "e_tq",
    source: "test",
    sourceHandle: "out",
    target: "quality",
    targetHandle: "in",
    type: "hop",
    style: STROKE("#a855f7"),
    markerEnd: ARROW("#a855f7"),
  },
  {
    id: "e_qd",
    source: "quality",
    sourceHandle: "out",
    target: "deploy",
    targetHandle: "in",
    type: "hop",
    style: STROKE("#22c55e"),
    markerEnd: ARROW("#22c55e"),
  },
];

/* ─────────────────────────────────────────
   Palette
───────────────────────────────────────── */
type NodeKind = "trigger" | "process" | "decision" | "terminal";

const PALETTE: Array<{ kind: NodeKind; label: string }> = [
  { kind: "trigger", label: "Trigger" },
  { kind: "process", label: "Process" },
  { kind: "decision", label: "Decision" },
  { kind: "terminal", label: "End" },
];

function PaletteItem({ kind, label }: { kind: NodeKind; label: string }) {
  let preview: React.ReactNode;
  if (kind === "trigger") {
    preview = (
      <div className="flex items-center gap-1 rounded-full bg-linear-to-r from-emerald-500 to-teal-600 px-2.5 py-1">
        <Zap size={9} className="text-white/80" />
        <span className="text-[9px] font-semibold text-white">Start</span>
      </div>
    );
  } else if (kind === "process") {
    preview = (
      <div className="flex h-7 w-full items-center overflow-hidden rounded-lg border border-blue-200 bg-white">
        <div className="h-full w-1 bg-blue-400" />
        <div className="flex items-center gap-1.5 px-1.5">
          <Cpu size={9} className="text-blue-500" />
          <span className="text-[9px] font-semibold text-slate-700">Step</span>
        </div>
      </div>
    );
  } else if (kind === "decision") {
    preview = (
      <div className="relative flex h-7 w-10 items-center justify-center">
        <div className="h-5 w-5 rotate-45 rounded-sm border border-amber-400 bg-amber-50" />
        <span className="absolute text-[8px] font-bold text-amber-700">?</span>
      </div>
    );
  } else {
    preview = (
      <div className="flex items-center gap-1 rounded-full bg-linear-to-r from-slate-600 to-slate-800 px-2.5 py-1">
        <Flag size={9} className="text-white/80" />
        <span className="text-[9px] font-semibold text-white">End</span>
      </div>
    );
  }

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/node-kind", kind);
        e.dataTransfer.effectAllowed = "move";
      }}
      title={`Drag to canvas: ${label}`}
      className="flex w-full cursor-grab flex-col items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 p-2 transition-colors hover:border-slate-300 hover:bg-white active:cursor-grabbing"
    >
      {preview}
      <span className="text-[10px] font-medium text-slate-500">{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────
   Main canvas
───────────────────────────────────────── */
function CircuitFlowInner() {
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(edges);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  const idCounter = useRef(1000);

  const refreshHops = useCallback(() => {
    setFlowEdges((eds) => eds.map((e) => ({ ...e, data: { ...e.data, _r: Date.now() } })));
  }, [setFlowEdges]);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    instance.fitView({ padding: 0.22 });
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const kind = e.dataTransfer.getData("application/node-kind") as NodeKind | "";
      if (!kind) return;
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const newId = `N${++idCounter.current}`;
      const defaults: Record<NodeKind, Record<string, unknown>> = {
        trigger: { label: "Trigger", icon: "zap", variant: "green" },
        process: { label: "Process", description: "Description", icon: "cpu", variant: "blue" },
        decision: { label: "Decision?" },
        terminal: { label: "End", icon: "flag", variant: "slate" },
      };
      setFlowNodes((ns) => [...ns, { id: newId, type: kind, position, data: defaults[kind] }]);
    },
    [screenToFlowPosition, setFlowNodes],
  );

  const onConnect = useCallback(
    (conn: {
      source: string | null;
      target: string | null;
      sourceHandle?: string | null;
      targetHandle?: string | null;
    }) => {
      if (!conn.source || !conn.target) return;
      const color = "#94a3b8";
      setFlowEdges((eds) => [
        ...eds,
        {
          id: `e${++idCounter.current}`,
          source: conn.source!,
          target: conn.target!,
          sourceHandle: conn.sourceHandle ?? undefined,
          targetHandle: conn.targetHandle ?? undefined,
          type: "hop",
          style: STROKE(color),
          markerEnd: ARROW(color),
        },
      ]);
    },
    [setFlowEdges],
  );

  return (
    <div className="flex h-screen w-screen flex-col bg-slate-50 font-sans text-slate-700">
      {/* Header */}
      <header className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-5 py-3 shadow-sm">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 shadow-md">
          <GitBranch size={15} className="text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold leading-tight text-slate-800">{SITE.name}</h1>
          <p className="text-[10px] leading-tight text-slate-400">{SITE.tagline}</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-[10px] font-medium text-slate-500">Overlapping edges active</span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Sidebar */}
        <aside className="z-10 flex w-28 shrink-0 flex-col gap-2 border-r border-slate-200 bg-white p-3 shadow-sm">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Nodes
          </p>
          {PALETTE.map((p) => (
            <PaletteItem key={p.kind} {...p} />
          ))}
          <div className="mt-auto pt-2">
            <p className="text-[9px] leading-relaxed text-slate-400">
              Drag onto canvas, then connect handles to wire up.
            </p>
          </div>
        </aside>

        {/* Canvas */}
        <div ref={wrapperRef} className="relative flex-1" onDrop={onDrop} onDragOver={onDragOver}>
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeDragStop={refreshHops}
            onConnect={onConnect}
            onInit={onInit}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} color="#e2e8f0" />
            <MiniMap
              pannable
              zoomable
              maskColor="rgba(241,245,249,0.75)"
              style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8 }}
              nodeColor={(n) =>
                n.type === "trigger"
                  ? "#10b981"
                  : n.type === "terminal"
                    ? "#475569"
                    : n.type === "decision"
                      ? "#f59e0b"
                      : "#3b82f6"
              }
              nodeStrokeWidth={0}
            />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

export function CircuitFlow() {
  return (
    <ReactFlowProvider>
      <CircuitFlowInner />
    </ReactFlowProvider>
  );
}

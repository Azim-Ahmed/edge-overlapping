<div align="center">

# react-flow-edge-overlapping

**Circuit-style "hop" edges for [React Flow](https://reactflow.dev) / `@xyflow/react`.**

When two wires cross, the edge on top draws a small bridge arc over the one underneath — just like an electrical schematic.

[![npm version](https://img.shields.io/npm/v/react-flow-edge-overlapping.svg?color=6366f1)](https://www.npmjs.com/package/react-flow-edge-overlapping)
[![npm downloads](https://img.shields.io/npm/dm/react-flow-edge-overlapping.svg?color=10b981)](https://www.npmjs.com/package/react-flow-edge-overlapping)
[![bundle size](https://img.shields.io/bundlephobia/minzip/react-flow-edge-overlapping?color=f59e0b)](https://bundlephobia.com/package/react-flow-edge-overlapping)
[![license](https://img.shields.io/npm/l/react-flow-edge-overlapping.svg?color=64748b)](./LICENSE)

</div>

---

## Why?

By default, React Flow edges that cross just overlap in a flat, ambiguous tangle. In schematics, dense diagrams, and circuit-style flows you usually want the wire on top to **hop** over the one beneath it so the routing stays readable. This package is a drop-in custom edge that does exactly that.

## Features

- **Automatic hop arcs** — detects crossings and draws a clean bridge over the wire underneath.
- **Smart fan-out** — edges leaving the same source handle spread apart instead of stacking.
- **Deterministic layering** — only the edge rendered on top draws the hop, so bumps are always visible.
- **Zero CSS** — pure SVG; color and width come from the standard React Flow `style` prop.
- **Fully typed** — ships TypeScript declarations, ESM + CJS builds.
- **Tiny & tree-shakeable** — no runtime dependencies beyond your existing React Flow.

## Table of contents

- [Install](#install)
- [Quick start](#quick-start)
- [Configuration](#configuration)
- [Notes & gotchas](#notes--gotchas)
- [API reference](#api-reference)
- [Support](#support)
- [License](#license)

## Install

```bash
npm install react-flow-edge-overlapping
# or
bun add react-flow-edge-overlapping
# or
pnpm add react-flow-edge-overlapping
```

Peer dependencies (you almost certainly already have these):

```bash
npm install @xyflow/react react react-dom
```

> Requires `@xyflow/react` v12+, React 18 or 19.

## Quick start

Register the edge in `edgeTypes` and give your edges `type: "hop"`:

```tsx
import { ReactFlow } from "@xyflow/react";
import { HopEdge } from "react-flow-edge-overlapping";
import "@xyflow/react/dist/style.css";

const edgeTypes = { hop: HopEdge };

const nodes = [
  { id: "a", position: { x: 0, y: 0 }, data: { label: "A" } },
  { id: "b", position: { x: 320, y: 80 }, data: { label: "B" } },
];

const edges = [
  {
    id: "a-b",
    source: "a",
    target: "b",
    type: "hop",
    style: { stroke: "#6366f1", strokeWidth: 2 },
  },
];

export default function App() {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <ReactFlow nodes={nodes} edges={edges} edgeTypes={edgeTypes} />
    </div>
  );
}
```

Colors and stroke width come from the standard React Flow `style` prop on each edge, so the hop edge automatically matches whatever theme you already use.

## Configuration

### Global (per edge type)

Use `createHopEdge(options)` to build a configured component once and reuse it:

```tsx
import { createHopEdge } from "react-flow-edge-overlapping";

const edgeTypes = {
  hop: createHopEdge({
    hopRadius: 8, // bridge arc radius        (default 6)
    fanStart: 20, // first sibling offset      (default 18)
    fanStep: 16, // spacing between siblings  (default 14)
    epsilon: 0.5, // intersection tolerance    (default 0.5)
  }),
};
```

| Option      | Type     | Default | Description                                                  |
| ----------- | -------- | ------- | ------------------------------------------------------------ |
| `hopRadius` | `number` | `6`     | Radius of the bridge arc drawn where wires cross.            |
| `fanStart`  | `number` | `18`    | Horizontal offset of the first branch when edges fan out.    |
| `fanStep`   | `number` | `14`    | Spacing between successive sibling branches.                 |
| `epsilon`   | `number` | `0.5`   | Tolerance for treating segments as aligned / intersecting.   |

### Per edge

Any option can be overridden on a single edge via `edge.data`:

```ts
const edges = [
  { id: "a-b", source: "a", target: "b", type: "hop", data: { hopRadius: 10 } },
];
```

## Notes & gotchas

- **Layering matters.** Only the edge rendered **on top** (later in the `edges` array) draws the hop, so the bridge is always visible above the wire underneath.
- **Recompute on drag.** After dragging nodes, trigger a re-render of edges so hops recompute against the new positions — e.g. bump a value in each edge's `data` inside `onNodeDragStop`:

```tsx
const onNodeDragStop = useCallback(() => {
  setEdges((eds) => eds.map((e) => ({ ...e, data: { ...e.data, _t: Date.now() } })));
}, [setEdges]);
```

## API reference

| Export                   | Description                                    |
| ------------------------ | ---------------------------------------------- |
| `HopEdge`                | Default-configured edge component.             |
| `createHopEdge(options)` | Factory returning a configured edge component. |
| `HopEdgeOptions`         | Options type for `createHopEdge`.              |
| `HopEdgeData`            | Per-edge `data` override type.                 |

<details>
<summary>Advanced: geometry helpers</summary>

These pure functions power the edge and are exported for advanced/custom routing:

`buildPolyline`, `polylineToPath`, `branchXFor`, `getHandlePos`, `computeHops`, plus the `Pt`, `Hop`, and `DEFAULT_HOP_EDGE_OPTIONS` exports.

</details>

## Support

If this package saves you time, check out more React Flow templates and examples on [VisualFlow](https://www.visualflow.dev/) — production-ready workflow builders, automation UIs, and diagram tools you can ship in days.

[![VisualFlow](https://img.shields.io/badge/VisualFlow-React%20Flow%20Templates-6366f1?style=for-the-badge)](https://www.visualflow.dev/)

If you'd like to support ongoing open-source work, you can also buy me a coffee:

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/azimahmed)

## License

[MIT](./LICENSE)

# react-flow-edge-overlapping

Overlapping (hop) edges for [React Flow](https://reactflow.dev) / `@xyflow/react`.

When two wires cross, the edge on top draws a small bridge arc ("hop") over the
one underneath — exactly like a circuit / electrical schematic. Sibling edges
leaving the same source handle are automatically fanned out so they don't
perfectly overlap. The edge is pure SVG, ships **zero CSS**, and is fully
configurable.

## Install

```bash
npm install react-flow-edge-overlapping
# or
bun add react-flow-edge-overlapping
```

This package has peer dependencies you almost certainly already have:

```bash
npm install @xyflow/react react react-dom
```

## Usage

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

Colors and stroke width come from the standard React Flow `style` prop on each
edge, so the hop edge fits whatever theme you already use.

## Configuration

### Global (per edge type)

Use `createHopEdge(options)` to build a configured component:

```tsx
import { createHopEdge } from "react-flow-edge-overlapping";

const edgeTypes = {
  hop: createHopEdge({
    hopRadius: 8, // bridge arc radius (default 6)
    fanStart: 20, // first sibling branch offset (default 18)
    fanStep: 16, // spacing between sibling branches (default 14)
    epsilon: 0.5, // intersection tolerance (default 0.5)
  }),
};
```

### Per edge

Any option can be overridden on a single edge via `edge.data`:

```ts
const edges = [
  { id: "a-b", source: "a", target: "b", type: "hop", data: { hopRadius: 10 } },
];
```

## Notes

- Only the edge rendered **on top** (later in the `edges` array) draws the hop,
  so the bridge is always visible above the wire underneath.
- After dragging nodes, trigger a re-render of edges (e.g. bump a value in each
  edge's `data` in `onNodeDragStop`) so hops recompute against new positions.

## API

| Export                      | Description                                                  |
| --------------------------- | ------------------------------------------------------------ |
| `HopEdge`                   | Default-configured edge component.                           |
| `createHopEdge(options)`    | Factory returning a configured edge component.               |
| `HopEdgeOptions`            | Options type for `createHopEdge`.                            |
| `HopEdgeData`               | Per-edge `data` override type.                               |
| `buildPolyline`, `polylineToPath`, `branchXFor`, `getHandlePos`, `computeHops` | Pure geometry helpers for advanced use. |

## Development & publishing (maintainers)

This package lives in a bun workspace; the repo root app is the live demo.

```bash
# from packages/react-flow-edge-overlapping
bun run build          # emits dist/ (ESM + CJS + .d.ts) via tsup
npm pack --dry-run     # preview the exact files that will be published

# publish to the public npm registry (first publish of a non-scoped package)
npm login
npm publish --access public --otp=YOUR_6_DIGIT_CODE
```

Bump the version with `npm version patch|minor|major` before publishing. The
`prepublishOnly` script rebuilds `dist/` automatically on `npm publish`.

## License

MIT

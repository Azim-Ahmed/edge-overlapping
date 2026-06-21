<div align="center">

# Edge Overlapping

**A visual flow builder with circuit-style "hop" edges, plus the publishable npm package that powers them.**

Design flow diagrams with draggable nodes and orthogonal wires that hop over crossings — just like a real schematic.

</div>

---

## What's in this repo

This is a [Bun](https://bun.sh) workspaces monorepo with two parts:

| Path                                                                       | What it is                                                                     |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [`packages/react-flow-edge-overlapping`](./packages/react-flow-edge-overlapping) | The publishable npm package — circuit-style hop edges for React Flow. |
| `src/`                                                                      | A [TanStack Start](https://tanstack.com/start) demo app that uses the package as a live playground. |

## The package

`react-flow-edge-overlapping` is a drop-in custom edge for [React Flow](https://reactflow.dev) / `@xyflow/react`. When two wires cross, the edge on top draws a small bridge arc ("hop") over the one underneath.

```bash
npm install react-flow-edge-overlapping
```

```tsx
import { HopEdge } from "react-flow-edge-overlapping";

const edgeTypes = { hop: HopEdge };
// give edges `type: "hop"` and you're done.
```

See the [package README](./packages/react-flow-edge-overlapping/README.md) for full docs, configuration, and the API reference.

## Running the demo

Requires [Bun](https://bun.sh).

```bash
bun install        # install deps and link the workspace package
bun run dev        # start the demo app on http://localhost:8080
```

Then drag nodes around the canvas and watch the wires hop over each other.

### Other scripts

| Command            | Description                          |
| ------------------ | ------------------------------------ |
| `bun run dev`      | Start the demo dev server.           |
| `bun run build`    | Build the demo app for production.    |
| `bun run lint`     | Lint the codebase.                   |
| `bun run format`   | Format with Prettier.               |

## Building & publishing the package

```bash
cd packages/react-flow-edge-overlapping
bun run build               # emits dist/ (ESM + CJS + .d.ts) via tsup
npm pack --dry-run          # preview the exact files that will be published
npm publish --access public --otp=YOUR_6_DIGIT_CODE
```

## Tech stack

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [@xyflow/react](https://reactflow.dev) (React Flow v12)
- [TanStack Start](https://tanstack.com/start) + [Vite](https://vite.dev) (demo app)
- [Tailwind CSS](https://tailwindcss.com) (demo styling)
- [tsup](https://tsup.egoist.dev) (package bundling)

## License

[MIT](./LICENSE)

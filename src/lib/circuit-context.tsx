import { createContext } from "react";

export const WIRE_HOT = "#ef4444";
export const WIRE_LOW = "#16a34a";

export const SignalsContext = createContext<Map<string, boolean>>(new Map());

export type NodeDataUpdater = (id: string, patch: Record<string, unknown>) => void;

export const NodeDataContext = createContext<NodeDataUpdater>(() => {});

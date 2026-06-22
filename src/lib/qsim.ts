// Loads the wasm-pack ESM bundle once and wraps Sim with a friendly API.
// wasm-pack --target web emits an async default init() plus the Sim class.
import init, { Sim } from "../qsim-pkg/qsim";

let ready: Promise<void> | null = null;
export function ensureReady(): Promise<void> {
  if (!ready) ready = init().then(() => undefined);
  return ready;
}

export type GateType =
  | "H" | "X" | "Y" | "Z" | "S" | "T"
  | "RX" | "RY" | "RZ" | "CNOT" | "CZ";

export interface Gate {
  type: GateType;
  target: number;
  control?: number;
  theta?: number;
  col: number;
}

export interface Circuit {
  id: string;
  name: string;
  qubits: number;
  gates: Gate[];
}

// Run a circuit from scratch and return { probs, counts? }.
// Call ensureReady() before this (the UI awaits it once on mount).
export function run(circuit: Circuit, shots?: number): {
  probs: Float64Array;
  counts?: Float64Array;
} {
  const sim = new Sim(circuit.qubits);
  // apply gates in column order, then by target for determinism
  const ordered = [...circuit.gates].sort((a, b) =>
    a.col - b.col || a.target - b.target);
  for (const g of ordered) {
    switch (g.type) {
      case "H": sim.h(g.target); break;
      case "X": sim.x(g.target); break;
      case "Y": sim.y(g.target); break;
      case "Z": sim.z(g.target); break;
      case "S": sim.s(g.target); break;
      case "T": sim.t(g.target); break;
      case "RX": sim.rx(g.target, g.theta ?? 0); break;
      case "RY": sim.ry(g.target, g.theta ?? 0); break;
      case "RZ": sim.rz(g.target, g.theta ?? 0); break;
      case "CNOT": sim.cnot(g.control ?? 0, g.target); break;
      case "CZ": sim.cz(g.control ?? 0, g.target); break;
    }
  }
  const probs = Float64Array.from(sim.probabilities());
  if (!shots) return { probs };
  const rand = Float64Array.from({ length: shots }, () => Math.random());
  const counts = Float64Array.from(sim.sample(rand));
  return { probs, counts };
}

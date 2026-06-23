"use client";

import { useState } from "react";
import { Zap, Coins, Link2, Share2, FlaskConical, BarChart2, TrendingUp, RotateCcw } from "lucide-react";
import type { Circuit, Gate } from "@/types";

const ACCENT = "#14B8A6";
const N_QUBITS = 6;

interface Example {
  id: string;
  label: string;
  Icon: React.ElementType;
  circuit: Circuit;
  does: string;
  look: string;
}

const EXAMPLES: Example[] = [
  {
    id: "fair-coin",
    label: "Fair coin",
    Icon: Coins,
    circuit: {
      id: "local",
      name: "Fair coin",
      qubits: N_QUBITS,
      gates: [
        { type: "H", target: 0, col: 0 },
      ] as Gate[],
    },
    does: "One Hadamard puts q0 into a perfect 50/50 superposition.",
    look: "Two bars at 50% — q0 is 0 or 1 with equal odds. A true coin flip, not a pseudo-random one.",
  },
  {
    id: "bell-pair",
    label: "Bell pair",
    Icon: Link2,
    circuit: {
      id: "local",
      name: "Bell pair",
      qubits: N_QUBITS,
      gates: [
        { type: "H", target: 0, col: 0 },
        { type: "CNOT", target: 1, control: 0, col: 1 },
      ] as Gate[],
    },
    does: "Entangles q0 and q1 — the hello world of quantum.",
    look: "Only the two states where q0 and q1 agree (both 0 or both 1) show up, 50% each. The mismatched states are forbidden. Measure one qubit and the other is instantly fixed — no classical coins can do that.",
  },
  {
    id: "ghz",
    label: "GHZ",
    Icon: Share2,
    circuit: {
      id: "local",
      name: "GHZ state",
      qubits: N_QUBITS,
      gates: [
        { type: "H", target: 0, col: 0 },
        { type: "CNOT", target: 1, control: 0, col: 1 },
        { type: "CNOT", target: 2, control: 1, col: 2 },
      ] as Gate[],
    },
    does: "Extends entanglement to three qubits (Greenberger–Horne–Zeilinger state).",
    look: "Only all-three-zero and all-three-one, 50% each. All three rise or fall together — there's no way to factor this into independent qubits.",
  },
  {
    id: "deutsch",
    label: "Deutsch's algorithm",
    Icon: FlaskConical,
    circuit: {
      id: "local",
      name: "Deutsch's algorithm",
      qubits: N_QUBITS,
      gates: [
        { type: "X", target: 1, col: 0 },
        { type: "H", target: 0, col: 1 },
        { type: "H", target: 1, col: 1 },
        { type: "CNOT", target: 1, control: 0, col: 2 },
        { type: "H", target: 0, col: 3 },
      ] as Gate[],
    },
    does: "Decides if a hidden 1-bit function is constant or balanced in one query (classical needs two). This loads the balanced case.",
    look: "Watch q0 only: it reads 1 (deterministically) = the function is balanced. The CNOT in t2 is the function — delete it and re-run to see q0 flip to 0 (constant). q1 is the ancilla; ignore it.",
  },
  // ── Grover's search: step-through in 3 presets ──────────────────────────
  {
    id: "grover-0",
    label: "Grover — 0 iter",
    Icon: BarChart2,
    circuit: {
      id: "local",
      name: "Grover — 0 iterations",
      qubits: N_QUBITS,
      gates: [
        { type: "H", target: 0, col: 0 },
        { type: "H", target: 1, col: 0 },
      ] as Gate[],
    },
    does: "Uniform superposition over N=4 states — the flat baseline before any search.",
    look: "All four bars at 25%. No interference yet; the oracle hasn't run. Load step 1 to start the search.",
  },
  {
    id: "grover-1",
    label: "Grover — 1 iter",
    Icon: TrendingUp,
    circuit: {
      id: "local",
      name: "Grover — 1 iteration",
      qubits: N_QUBITS,
      gates: [
        // Init
        { type: "H", target: 0, col: 0 },
        { type: "H", target: 1, col: 0 },
        // Oracle: CZ phase-flips |11⟩ directly
        { type: "CZ", target: 1, control: 0, col: 1 },
        // Diffuser: H X CZ X H
        { type: "H", target: 0, col: 2 },
        { type: "H", target: 1, col: 2 },
        { type: "X", target: 0, col: 3 },
        { type: "X", target: 1, col: 3 },
        { type: "CZ", target: 1, control: 0, col: 4 },
        { type: "X", target: 0, col: 5 },
        { type: "X", target: 1, col: 5 },
        { type: "H", target: 0, col: 6 },
        { type: "H", target: 1, col: 6 },
      ] as Gate[],
    },
    does: "One oracle + diffuser: interference amplifies the marked state |110000⟩ (q0 and q1 both 1) and suppresses the rest.",
    look: "The |110000⟩ bar hits 100% — one step, perfect certainty. Compare with step 0: amplitude concentrated entirely by interference, not elimination. This is optimal for N=4.",
  },
  {
    id: "grover-2",
    label: "Grover — 2 iter",
    Icon: RotateCcw,
    circuit: {
      id: "local",
      name: "Grover — 2 iterations",
      qubits: N_QUBITS,
      gates: [
        // Init
        { type: "H", target: 0, col: 0 },
        { type: "H", target: 1, col: 0 },
        // Oracle 1
        { type: "CZ", target: 1, control: 0, col: 1 },
        // Diffuser 1
        { type: "H", target: 0, col: 2 },
        { type: "H", target: 1, col: 2 },
        { type: "X", target: 0, col: 3 },
        { type: "X", target: 1, col: 3 },
        { type: "CZ", target: 1, control: 0, col: 4 },
        { type: "X", target: 0, col: 5 },
        { type: "X", target: 1, col: 5 },
        { type: "H", target: 0, col: 6 },
        { type: "H", target: 1, col: 6 },
        // Oracle 2
        { type: "CZ", target: 1, control: 0, col: 7 },
        // Diffuser 2
        { type: "H", target: 0, col: 8 },
        { type: "H", target: 1, col: 8 },
        { type: "X", target: 0, col: 9 },
        { type: "X", target: 1, col: 9 },
        { type: "CZ", target: 1, control: 0, col: 10 },
        { type: "X", target: 0, col: 11 },
        { type: "X", target: 1, col: 11 },
        { type: "H", target: 0, col: 12 },
        { type: "H", target: 1, col: 12 },
      ] as Gate[],
    },
    does: "A second iteration: Grover is a rotation, not a ratchet. It overshoots.",
    look: "All four bars back to 25% — the rotation went past the target and came full circle. Optimal for N=4 is exactly 1 iteration. A third step would amplify again, then overshoot again; it cycles.",
  },
];

export function TryThis({
  onLoad,
  currentGates,
}: {
  onLoad: (c: Circuit) => void;
  currentGates: Gate[];
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pendingExample, setPendingExample] = useState<Example | null>(null);

  function handleClick(ex: Example) {
    if (currentGates.length > 0 && ex.id !== activeId) {
      setPendingExample(ex);
    } else {
      load(ex);
    }
  }

  function load(ex: Example) {
    onLoad(ex.circuit);
    setActiveId(ex.id);
    setPendingExample(null);
  }

  const active = EXAMPLES.find((e) => e.id === activeId) ?? null;

  return (
    <div style={{ marginBottom: "2rem" }}>
      <div
        style={{
          fontFamily: "var(--font-bebas)",
          fontSize: "1rem",
          letterSpacing: "0.04em",
          color: "#111",
          marginBottom: "0.75rem",
        }}
      >
        Try this
      </div>

      {/* Example buttons */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: active || pendingExample ? "0.875rem" : 0 }}>
        {EXAMPLES.map((ex) => {
          const isActive = activeId === ex.id;
          return (
            <button
              key={ex.id}
              onClick={() => handleClick(ex)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                border: `1.5px solid ${isActive ? ACCENT : "#E5E5E5"}`,
                borderRadius: "0.75rem",
                background: isActive ? `${ACCENT}12` : "#fff",
                color: isActive ? ACCENT : "#374151",
                fontFamily: "var(--font-jakarta)",
                fontSize: "0.825rem",
                fontWeight: isActive ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.1s",
              }}
            >
              <ex.Icon size={13} />
              {ex.label}
            </button>
          );
        })}
      </div>

      {/* Confirm overlay — only shown when about to clobber a non-empty grid */}
      {pendingExample && (
        <div
          style={{
            marginTop: "0.75rem",
            padding: "10px 14px",
            border: "1.5px solid #F59E0B",
            borderRadius: "0.75rem",
            background: "#FFFBEB",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontFamily: "var(--font-jakarta)",
            fontSize: "0.825rem",
            color: "#92400E",
          }}
        >
          <span style={{ flex: 1 }}>
            This replaces your current grid. Continue?
          </span>
          <button
            onClick={() => load(pendingExample)}
            style={{
              padding: "4px 12px",
              border: "none",
              borderRadius: "0.5rem",
              background: ACCENT,
              color: "#fff",
              fontFamily: "var(--font-jakarta)",
              fontWeight: 600,
              fontSize: "0.78rem",
              cursor: "pointer",
            }}
          >
            Yes, load it
          </button>
          <button
            onClick={() => setPendingExample(null)}
            style={{
              padding: "4px 10px",
              border: "1px solid #D1D5DB",
              borderRadius: "0.5rem",
              background: "#fff",
              color: "#374151",
              fontFamily: "var(--font-jakarta)",
              fontSize: "0.78rem",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Explanation callout */}
      {active && !pendingExample && (
        <div
          style={{
            marginTop: "0.75rem",
            padding: "12px 14px",
            border: `1.5px solid ${ACCENT}44`,
            borderRadius: "0.75rem",
            background: `${ACCENT}08`,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-jakarta)",
              fontWeight: 600,
              fontSize: "0.875rem",
              color: "#111",
              marginBottom: "4px",
            }}
          >
            {active.label}
          </div>
          <p
            style={{
              fontFamily: "var(--font-jakarta)",
              fontSize: "0.825rem",
              color: "#374151",
              margin: "0 0 6px",
              lineHeight: 1.5,
            }}
          >
            {active.does}
          </p>
          <p
            style={{
              fontFamily: "var(--font-jakarta)",
              fontSize: "0.825rem",
              color: "#374151",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            <span style={{ fontWeight: 600, color: ACCENT }}>What to look for: </span>
            {active.look}
          </p>
          <a
            href="/about"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              marginTop: "8px",
              fontFamily: "var(--font-jakarta)",
              fontSize: "0.75rem",
              color: ACCENT,
              textDecoration: "none",
            }}
          >
            <Zap size={11} />
            How the engine works
          </a>
        </div>
      )}
    </div>
  );
}

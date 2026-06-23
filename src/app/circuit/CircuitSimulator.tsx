"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ensureReady, run } from "@/lib/qsim";
import { basisLabel } from "@/lib/format";
import { SavedCircuits } from "./SavedCircuits";
import { TryThis } from "./TryThis";
import type { Gate, GateType, Circuit } from "@/types";

const ACCENT = "#14B8A6";
const N_QUBITS = 6;
const N_COLS = 14;
const SINGLE_GATES: GateType[] = ["H", "X", "Y", "Z", "S", "T", "RX", "RY", "RZ"];
const TWO_QUBIT_GATES: GateType[] = ["CNOT", "CZ"];
const DEFAULT_THETA = Math.PI / 2;
const DEFAULT_SHOTS = 512;

function emptyCircuit(): Circuit {
  return { id: "local", name: "Untitled", qubits: N_QUBITS, gates: [] };
}

function GateChip({
  type,
  selected,
  onClick,
}: {
  type: GateType;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "4px 10px",
        borderRadius: "6px",
        border: selected ? `2px solid ${ACCENT}` : "2px solid #E5E5E5",
        background: selected ? `${ACCENT}18` : "#fff",
        color: selected ? ACCENT : "#374151",
        fontFamily: "var(--font-jakarta)",
        fontSize: "0.8rem",
        fontWeight: selected ? 600 : 400,
        cursor: "pointer",
        transition: "all 0.1s",
      }}
    >
      {type}
    </button>
  );
}

type SaveStatus = "idle" | "naming" | "saving" | "saved" | "error";

export function CircuitSimulator({ signedIn }: { signedIn: boolean }) {
  const [ready, setReady] = useState(false);
  const [circuit, setCircuit] = useState<Circuit>(emptyCircuit);
  const [selectedGate, setSelectedGate] = useState<GateType>("H");
  const [pendingControl, setPendingControl] = useState<number | null>(null);
  const [probs, setProbs] = useState<Float64Array | null>(null);
  const [counts, setCounts] = useState<Float64Array | null>(null);
  const [shots, setShots] = useState(DEFAULT_SHOTS);
  const [showHistogram, setShowHistogram] = useState(false);
  const [theta, setTheta] = useState(DEFAULT_THETA);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [nameDraft, setNameDraft] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ensureReady().then(() => setReady(true));
  }, []);

  const simulate = useCallback(
    (c: Circuit) => {
      if (!ready) return;
      const result = run(c);
      setProbs(result.probs);
      setCounts(null);
      setShowHistogram(false);
    },
    [ready]
  );

  useEffect(() => {
    if (ready) simulate(circuit);
  }, [ready, circuit, simulate]);

  useEffect(() => {
    if (saveStatus === "naming") nameInputRef.current?.focus();
  }, [saveStatus]);

  function handleCellClick(row: number, col: number) {
    const isTwoQubit = TWO_QUBIT_GATES.includes(selectedGate);

    if (isTwoQubit) {
      if (pendingControl === null) {
        setPendingControl(row);
        return;
      }
      const control = pendingControl;
      setPendingControl(null);
      if (control === row) return;
      const gate: Gate = {
        type: selectedGate,
        target: row,
        control,
        col,
      };
      const next = {
        ...circuit,
        gates: [
          ...circuit.gates.filter((g) => !(g.col === col && (g.target === row || g.target === control))),
          gate,
        ],
      };
      setCircuit(next);
      return;
    }

    const existing = circuit.gates.find((g) => g.col === col && g.target === row);
    if (existing) {
      setCircuit({ ...circuit, gates: circuit.gates.filter((g) => g !== existing) });
      return;
    }

    const gate: Gate = {
      type: selectedGate,
      target: row,
      col,
      ...( ["RX", "RY", "RZ"].includes(selectedGate) ? { theta } : {}),
    };
    setCircuit({ ...circuit, gates: [...circuit.gates, gate] });
  }

  function handleRunShots() {
    if (!ready) return;
    const result = run(circuit, shots);
    setProbs(result.probs);
    setCounts(result.counts ?? null);
    setShowHistogram(true);
  }

  function handleClear() {
    setCircuit(emptyCircuit());
    setCounts(null);
    setShowHistogram(false);
    setSaveStatus("idle");
  }

  function handleLoad(c: Circuit) {
    setCircuit(c);
    setCounts(null);
    setShowHistogram(false);
    setSaveStatus("idle");
  }

  function handleSaveClick() {
    if (saveStatus === "saving") return;
    if (circuit.id === "local") {
      setNameDraft(circuit.name === "Untitled" ? "" : circuit.name);
      setSaveStatus("naming");
    } else {
      doSave(circuit.name);
    }
  }

  async function doSave(name: string) {
    setSaveStatus("saving");
    try {
      const id = circuit.id === "local" ? crypto.randomUUID() : circuit.id;
      const toSave: Circuit = { ...circuit, id, name: name.trim() || "Untitled" };
      setCircuit(toSave);
      const res = await fetch("/api/circuits", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toSave),
      });
      if (!res.ok) throw new Error("save failed");
      setSaveStatus("saved");
      setRefreshKey((k) => k + 1);
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }

  const maxProb = probs ? Math.max(...Array.from(probs)) : 1;
  const maxCount = counts ? Math.max(...Array.from(counts)) : 1;
  const size = 1 << N_QUBITS;

  const CELL_W = 54;
  const CELL_H = 44;

  function cellBg(row: number, col: number): string {
    if (pendingControl === row) return `${ACCENT}33`;
    const g = circuit.gates.find((g) => g.col === col && g.target === row);
    if (g) return ACCENT;
    return col % 2 === 0 ? "#FAFAFA" : "#F4F4F4";
  }

  function cellLabel(row: number, col: number): string | null {
    if (pendingControl === row) return "•";
    const g = circuit.gates.find((g) => g.col === col && g.target === row);
    if (!g) return null;
    if (g.control !== undefined) {
      if (g.target === row) return g.type === "CNOT" ? "⊕" : "Z";
      if (g.control === row) return "•";
    }
    return g.type;
  }

  return (
    <div style={{ fontFamily: "var(--font-jakarta)" }}>
      {/* Try this — example presets, above the palette */}
      <TryThis onLoad={handleLoad} currentGates={circuit.gates} />

      {/* Gate palette */}
      <div style={{ marginBottom: "1rem" }}>
        <div
          style={{
            fontSize: "0.7rem",
            color: "#9CA3AF",
            marginBottom: "6px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Single-qubit
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
          {SINGLE_GATES.map((g) => (
            <GateChip
              key={g}
              type={g}
              selected={selectedGate === g}
              onClick={() => { setSelectedGate(g); setPendingControl(null); }}
            />
          ))}
        </div>
        <div
          style={{
            fontSize: "0.7rem",
            color: "#9CA3AF",
            marginBottom: "6px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Two-qubit — click control qubit row first, then target
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {TWO_QUBIT_GATES.map((g) => (
            <GateChip
              key={g}
              type={g}
              selected={selectedGate === g}
              onClick={() => { setSelectedGate(g); setPendingControl(null); }}
            />
          ))}
        </div>
        {["RX", "RY", "RZ"].includes(selectedGate) && (
          <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "12px" }}>
            <label style={{ fontSize: "0.8rem", color: "#374151" }}>
              θ (rad):
            </label>
            <input
              type="number"
              step={0.1}
              value={theta}
              onChange={(e) => setTheta(parseFloat(e.target.value) || 0)}
              style={{
                width: "80px",
                padding: "4px 8px",
                border: "1px solid #E5E5E5",
                borderRadius: "6px",
                fontFamily: "var(--font-jakarta)",
                fontSize: "0.85rem",
              }}
            />
            <span style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>
              π/2 ≈ 1.571
            </span>
          </div>
        )}
      </div>

      {/* Circuit grid */}
      {!ready ? (
        <div style={{ color: "#9CA3AF", fontSize: "0.875rem", padding: "2rem 0" }}>
          Loading simulator…
        </div>
      ) : (
        <div style={{ overflowX: "auto", marginBottom: "1.5rem" }}>
          <div style={{ display: "inline-block", minWidth: "max-content" }}>
            {/* Column headers */}
            <div style={{ display: "flex", marginLeft: 40 }}>
              {Array.from({ length: N_COLS }, (_, c) => (
                <div
                  key={c}
                  style={{
                    width: CELL_W,
                    textAlign: "center",
                    fontSize: "0.65rem",
                    color: "#9CA3AF",
                    paddingBottom: "4px",
                  }}
                >
                  t{c}
                </div>
              ))}
            </div>

            {/* Rows */}
            {Array.from({ length: N_QUBITS }, (_, row) => (
              <div key={row} style={{ display: "flex", alignItems: "center" }}>
                {/* Qubit label */}
                <div
                  style={{
                    width: 40,
                    fontSize: "0.75rem",
                    color: "#374151",
                    fontWeight: 500,
                    flexShrink: 0,
                  }}
                >
                  q{row}
                </div>
                {/* Cells */}
                {Array.from({ length: N_COLS }, (_, col) => {
                  const label = cellLabel(row, col);
                  const bg = cellBg(row, col);
                  const hasGate = !!circuit.gates.find(
                    (g) => g.col === col && (g.target === row || g.control === row)
                  );
                  return (
                    <div
                      key={col}
                      onClick={() => handleCellClick(row, col)}
                      title={hasGate ? "Click to remove" : `Place ${selectedGate}`}
                      style={{
                        width: CELL_W,
                        height: CELL_H,
                        background: bg,
                        border: "1px solid #E5E5E5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        color: hasGate ? "#fff" : "#9CA3AF",
                        userSelect: "none",
                        transition: "background 0.1s",
                        position: "relative",
                      }}
                    >
                      {/* Horizontal wire */}
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          right: 0,
                          top: "50%",
                          height: 1,
                          background: "#D1D5DB",
                          zIndex: 0,
                        }}
                      />
                      {label && (
                        <span style={{ position: "relative", zIndex: 1 }}>{label}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "1.5rem", alignItems: "center" }}>
        <button
          onClick={handleClear}
          style={{
            padding: "8px 16px",
            border: "1px solid #E5E5E5",
            borderRadius: "0.75rem",
            background: "#fff",
            fontFamily: "var(--font-jakarta)",
            fontSize: "0.85rem",
            cursor: "pointer",
            color: "#374151",
          }}
        >
          Clear
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label style={{ fontSize: "0.85rem", color: "#374151" }}>Shots:</label>
          <input
            type="number"
            min={1}
            max={10000}
            value={shots}
            onChange={(e) => setShots(Math.max(1, parseInt(e.target.value) || 1))}
            style={{
              width: "72px",
              padding: "6px 8px",
              border: "1px solid #E5E5E5",
              borderRadius: "8px",
              fontFamily: "var(--font-jakarta)",
              fontSize: "0.85rem",
            }}
          />
          <button
            onClick={handleRunShots}
            style={{
              padding: "8px 16px",
              border: "none",
              borderRadius: "0.75rem",
              background: ACCENT,
              color: "#fff",
              fontFamily: "var(--font-jakarta)",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            Run {shots} shots
          </button>
        </div>
        {signedIn && (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {saveStatus === "naming" ? (
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <input
                  ref={nameInputRef}
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  placeholder="Circuit name"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") doSave(nameDraft);
                    if (e.key === "Escape") setSaveStatus("idle");
                  }}
                  style={{ padding: "6px 10px", border: `1px solid ${ACCENT}`, borderRadius: "0.75rem", fontFamily: "var(--font-jakarta)", fontSize: "0.85rem", outline: "none", width: "160px" }}
                />
                <button
                  onClick={() => doSave(nameDraft)}
                  style={{ padding: "6px 14px", border: "none", borderRadius: "0.75rem", background: ACCENT, color: "#fff", fontFamily: "var(--font-jakarta)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
                >
                  Save
                </button>
                <button
                  onClick={() => setSaveStatus("idle")}
                  style={{ padding: "6px 10px", border: "1px solid #E5E5E5", borderRadius: "0.75rem", background: "#fff", color: "#9CA3AF", fontFamily: "var(--font-jakarta)", fontSize: "0.85rem", cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={handleSaveClick}
                disabled={saveStatus === "saving"}
                style={{
                  padding: "8px 16px",
                  border: `1px solid ${saveStatus === "error" ? "#FF3B30" : ACCENT}`,
                  borderRadius: "0.75rem",
                  background: "#fff",
                  color: saveStatus === "error" ? "#FF3B30" : ACCENT,
                  fontFamily: "var(--font-jakarta)",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: saveStatus === "saving" ? "default" : "pointer",
                  opacity: saveStatus === "saving" ? 0.6 : 1,
                }}
              >
                {saveStatus === "saving"
                  ? "Saving…"
                  : saveStatus === "saved"
                  ? "Saved ✓"
                  : circuit.id !== "local"
                  ? `Save "${circuit.name}"`
                  : "Save circuit"}
              </button>
            )}
            {saveStatus === "error" && (
              <span style={{ fontSize: "0.75rem", color: "#FF3B30", fontFamily: "var(--font-jakarta)" }}>
                Save failed — please try again.
              </span>
            )}
          </div>
        )}
        {!signedIn && (
          <span style={{ fontSize: "0.78rem", color: "#9CA3AF" }}>
            <a href="/signin" style={{ color: ACCENT }}>Sign in</a> to save circuits.
          </span>
        )}
      </div>

      {/* Probability bars (live) */}
      {probs && (
        <div style={{ marginBottom: "2rem" }}>
          <div
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: "1.1rem",
              letterSpacing: "0.04em",
              color: "#111",
              marginBottom: "0.75rem",
            }}
          >
            State probabilities
          </div>
          <div style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.7rem", color: "#9CA3AF", marginBottom: "0.5rem", letterSpacing: "0.02em" }}>
            Reading order: q0 first (q0 is the top wire)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {Array.from({ length: size }, (_, i) => {
              const p = probs[i];
              if (p < 0.0001 && maxProb > 0.01) return null;
              const pct = maxProb > 0 ? (p / maxProb) * 100 : 0;
              return (
                <div
                  key={i}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span
                    style={{
                      width: "84px",
                      fontSize: "0.72rem",
                      color: "#374151",
                      fontWeight: 500,
                      flexShrink: 0,
                      textAlign: "right",
                      fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {basisLabel(i, N_QUBITS)}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: "18px",
                      background: "#F3F4F6",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: ACCENT,
                        borderRadius: "4px",
                        transition: "width 0.2s ease",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      width: "44px",
                      fontSize: "0.72rem",
                      color: "#9CA3AF",
                      flexShrink: 0,
                    }}
                  >
                    {(p * 100).toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Measurement histogram */}
      {showHistogram && counts && (
        <div>
          <div
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: "1.1rem",
              letterSpacing: "0.04em",
              color: "#111",
              marginBottom: "0.75rem",
            }}
          >
            Measurement histogram ({shots} shots)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {Array.from({ length: size }, (_, i) => {
              const c = counts[i];
              if (c === 0 && maxCount > 0) return null;
              const pct = maxCount > 0 ? (c / maxCount) * 100 : 0;
              return (
                <div
                  key={i}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span
                    style={{
                      width: "84px",
                      fontSize: "0.72rem",
                      color: "#374151",
                      fontWeight: 500,
                      flexShrink: 0,
                      textAlign: "right",
                      fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {basisLabel(i, N_QUBITS)}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: "18px",
                      background: "#F3F4F6",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: "#6366F1",
                        borderRadius: "4px",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      width: "44px",
                      fontSize: "0.72rem",
                      color: "#9CA3AF",
                      flexShrink: 0,
                    }}
                  >
                    {c}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* My circuits panel — signed-in only */}
      {signedIn && (
        <SavedCircuits onLoad={handleLoad} refreshKey={refreshKey} />
      )}
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ensureReady, run } from "@/lib/qsim";
import { basisLabel } from "@/lib/format";
import type { Circuit } from "@/types";

const ACCENT = "#14B8A6";
const LR = 0.5;
const MAX_ITER = 200;
const CONV_THRESH = 1e-4;
const SHIFT = Math.PI / 2;
const STEP_MS = 200;

// ── circuit factories ─────────────────────────────────────────────────────────

function d1Circuit(theta: number): Circuit {
  return {
    id: "vqc", name: "", qubits: 1,
    gates: [{ type: "RY", target: 0, col: 0, theta }],
  };
}

function d2Circuit(a: number, b: number): Circuit {
  return {
    id: "vqc", name: "", qubits: 2,
    gates: [
      { type: "RY", target: 0, col: 0, theta: a },
      { type: "CNOT", target: 1, control: 0, col: 1 },
      { type: "RY", target: 1, col: 2, theta: b },
    ],
  };
}

// ── loss functions (evaluated by running the actual Sim) ──────────────────────

function lossD1(theta: number): number {
  const { probs } = run(d1Circuit(theta));
  return (probs[1] - 1) ** 2;
}

function lossD2(a: number, b: number): number {
  const { probs } = run(d2Circuit(a, b));
  const [P00, P10, P01, P11] = [probs[0], probs[1], probs[2], probs[3]];
  return (P01 + P10) + (0.5 - P00) ** 2 + (0.5 - P11) ** 2;
}

// ── optimizer state ───────────────────────────────────────────────────────────

interface D1State { theta: number; iter: number; hist: number[]; done: boolean }
interface D2State { a: number; b: number; iter: number; hist: number[]; done: boolean }

function initD1(): D1State {
  return { theta: Math.random() * 2 * Math.PI, iter: 0, hist: [], done: false };
}
function initD2(): D2State {
  return { a: Math.random() * 2 * Math.PI, b: Math.random() * 2 * Math.PI, iter: 0, hist: [], done: false };
}

// ── loss curve SVG ────────────────────────────────────────────────────────────

function LossCurve({ hist }: { hist: number[] }) {
  const W = 340, H = 84;
  const PL = 34, PB = 18, PT = 6, PR = 8;
  const iw = W - PL - PR;
  const ih = H - PT - PB;

  if (hist.length < 2) {
    return (
      <svg width={W} height={H} style={{ display: "block", maxWidth: "100%" }}>
        <text x={W / 2} y={H / 2 + 4} textAnchor="middle" fill="#D1D5DB"
          fontSize={11} fontFamily="var(--font-jakarta)">
          Step to see the loss curve
        </text>
      </svg>
    );
  }

  const maxL = Math.max(...hist, 0.001);

  function px(i: number) { return PL + (i / (hist.length - 1)) * iw; }
  function py(l: number) { return PT + (1 - Math.min(l / maxL, 1)) * ih; }

  const pts = hist.map((l, i) => `${px(i).toFixed(1)},${py(l).toFixed(1)}`).join(" ");
  const last = hist[hist.length - 1];

  return (
    <svg width={W} height={H} style={{ display: "block", maxWidth: "100%" }}>
      {/* axes */}
      <line x1={PL} y1={PT} x2={PL} y2={H - PB} stroke="#E5E5E5" strokeWidth={1} />
      <line x1={PL} y1={H - PB} x2={W - PR} y2={H - PB} stroke="#E5E5E5" strokeWidth={1} />
      {/* y ticks */}
      {[0, 0.5, 1].map(f => (
        <text key={f} x={PL - 4} y={py(f * maxL) + 4} textAnchor="end"
          fill="#9CA3AF" fontSize={9} fontFamily="var(--font-jakarta)">
          {(f * maxL).toFixed(2)}
        </text>
      ))}
      {/* x labels */}
      <text x={PL} y={H - 3} fill="#9CA3AF" fontSize={9} fontFamily="var(--font-jakarta)">0</text>
      <text x={W - PR} y={H - 3} textAnchor="end" fill="#9CA3AF" fontSize={9}
        fontFamily="var(--font-jakarta)">{hist.length - 1}</text>
      {/* line */}
      <polyline points={pts} fill="none" stroke={ACCENT} strokeWidth={1.5}
        strokeLinejoin="round" strokeLinecap="round" />
      {/* endpoint dot */}
      <circle cx={px(hist.length - 1).toFixed(1)} cy={py(last).toFixed(1)} r={3} fill={ACCENT} />
    </svg>
  );
}

// ── prob bar ──────────────────────────────────────────────────────────────────

function ProbBar({ label, value }: { label: string; value: number }) {
  const pct = Math.max(0, Math.min(100, value * 100));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{
        width: 48, textAlign: "right", flexShrink: 0,
        fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
        fontSize: "0.72rem", color: "#374151", fontWeight: 500,
      }}>{label}</span>
      <div style={{ flex: 1, height: 16, background: "#F3F4F6", borderRadius: 4, overflow: "hidden" }}>
        <div style={{
          width: `${pct.toFixed(1)}%`, height: "100%",
          background: ACCENT, borderRadius: 4, transition: "width 0.1s ease",
        }} />
      </div>
      <span style={{ width: 44, fontSize: "0.72rem", color: "#9CA3AF", flexShrink: 0 }}>
        {pct.toFixed(1)}%
      </span>
    </div>
  );
}

// ── controls ──────────────────────────────────────────────────────────────────

function CtrlBtn({ label, onClick, primary, disabled }: {
  label: string; onClick: () => void; primary?: boolean; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "6px 14px",
        border: primary ? "none" : "1px solid #E5E5E5",
        borderRadius: "0.75rem",
        background: primary ? ACCENT : "#fff",
        color: primary ? "#fff" : "#374151",
        fontFamily: "var(--font-jakarta)",
        fontWeight: primary ? 600 : 400,
        fontSize: "0.825rem",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {label}
    </button>
  );
}

// ── LearnPanel ────────────────────────────────────────────────────────────────

export function LearnPanel() {
  const [open, setOpen] = useState(false);
  const [wasmReady, setWasmReady] = useState(false);
  const [tab, setTab] = useState<"flip" | "bell">("flip");
  const [running, setRunning] = useState(false);
  const [tick, setTick] = useState(0);

  const d1 = useRef<D1State>(initD1());
  const d2 = useRef<D2State>(initD2());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    ensureReady().then(() => setWasmReady(true));
  }, []);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  function stopInterval() {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setRunning(false);
  }

  function stepD1Once(): boolean {
    const s = d1.current;
    if (s.done || s.iter >= MAX_ITER) { s.done = true; return true; }
    const grad = 0.5 * (lossD1(s.theta + SHIFT) - lossD1(s.theta - SHIFT));
    s.theta -= LR * grad;
    const loss = lossD1(s.theta);
    s.hist = [...s.hist, loss];
    s.iter++;
    s.done = loss < CONV_THRESH || s.iter >= MAX_ITER;
    return s.done;
  }

  function stepD2Once(): boolean {
    const s = d2.current;
    if (s.done || s.iter >= MAX_ITER) { s.done = true; return true; }
    const ga = 0.5 * (lossD2(s.a + SHIFT, s.b) - lossD2(s.a - SHIFT, s.b));
    const gb = 0.5 * (lossD2(s.a, s.b + SHIFT) - lossD2(s.a, s.b - SHIFT));
    s.a -= LR * ga;
    s.b -= LR * gb;
    const loss = lossD2(s.a, s.b);
    s.hist = [...s.hist, loss];
    s.iter++;
    s.done = loss < CONV_THRESH || s.iter >= MAX_ITER;
    return s.done;
  }

  function doStep(): boolean {
    return tab === "flip" ? stepD1Once() : stepD2Once();
  }

  function handleStep() {
    if (!wasmReady) return;
    const done = doStep();
    setTick(t => t + 1);
    if (done) stopInterval();
  }

  function handleRun() {
    if (!wasmReady) return;
    if (running) { stopInterval(); return; }
    setRunning(true);
    intervalRef.current = setInterval(() => {
      const done = doStep();
      setTick(t => t + 1);
      if (done) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setRunning(false);
      }
    }, STEP_MS);
  }

  function handleReset() {
    stopInterval();
    if (tab === "flip") d1.current = initD1();
    else d2.current = initD2();
    setTick(t => t + 1);
  }

  function handleTabChange(t: "flip" | "bell") {
    stopInterval();
    setTab(t);
  }

  // Derived display — called during render, safe since wasmReady is guarded
  const s1 = d1.current;
  const s2 = d2.current;
  const probs1 = wasmReady ? run(d1Circuit(s1.theta)).probs : null;
  const probs2 = wasmReady ? run(d2Circuit(s2.a, s2.b)).probs : null;

  // Suppress tick lint — it drives re-renders for ref-based state
  void tick;

  const isDone = tab === "flip" ? s1.done : s2.done;
  const iter = tab === "flip" ? s1.iter : s2.iter;
  const hist = tab === "flip" ? s1.hist : s2.hist;
  const currentLoss = tab === "flip"
    ? (probs1 ? (probs1[1] - 1) ** 2 : null)
    : (probs2 ? ((probs2[2] + probs2[1]) + (0.5 - probs2[0]) ** 2 + (0.5 - probs2[3]) ** 2) : null);

  return (
    <div style={{ marginBottom: "2rem" }}>
      {/* Collapsible header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: "6px",
          background: "none", border: "none", padding: 0,
          cursor: "pointer", marginBottom: open ? "1rem" : 0,
        }}
      >
        {open
          ? <ChevronDown size={15} color="#9CA3AF" />
          : <ChevronRight size={15} color="#9CA3AF" />}
        <span style={{
          fontFamily: "var(--font-bebas)", fontSize: "1rem",
          letterSpacing: "0.04em", color: "#111",
        }}>
          Learn (variational circuit)
        </span>
        <span style={{
          fontFamily: "var(--font-jakarta)", fontSize: "0.72rem",
          color: "#9CA3AF", marginLeft: 4,
        }}>
          QML / quantum neural network
        </span>
      </button>

      {open && (
        <div>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: "1.25rem" }}>
            {(["flip", "bell"] as const).map(t => {
              const label = t === "flip" ? "Teach a qubit to flip" : "Make a Bell pair";
              const active = tab === t;
              return (
                <button
                  key={t}
                  onClick={() => handleTabChange(t)}
                  style={{
                    padding: "5px 14px",
                    border: `1.5px solid ${active ? ACCENT : "#E5E5E5"}`,
                    borderRadius: "0.75rem",
                    background: active ? `${ACCENT}12` : "#fff",
                    color: active ? ACCENT : "#374151",
                    fontFamily: "var(--font-jakarta)",
                    fontSize: "0.825rem",
                    fontWeight: active ? 600 : 400,
                    cursor: "pointer",
                    transition: "all 0.1s",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* ── Demo 1: Teach a qubit to flip ── */}
          {tab === "flip" && (
            <div>
              <p style={{
                fontFamily: "var(--font-jakarta)", fontSize: "0.825rem",
                color: "#374151", lineHeight: 1.6, margin: "0 0 1rem",
              }}>
                A single RY gate with learnable angle θ acts on q0. The{" "}
                <strong>parameter-shift rule</strong> computes exact gradients by running the
                circuit at θ ± π/2 — exactly how real quantum hardware trains.
                The classical optimizer adjusts θ until P(|1⟩) is maximized.
              </p>

              {/* Circuit diagram (static) */}
              <div style={{
                fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
                fontSize: "0.78rem", color: "#6B7280",
                background: "#F9FAFB", border: "1px solid #F0F0F0",
                borderRadius: "0.75rem", padding: "10px 14px",
                marginBottom: "1rem", lineHeight: 1.8,
              }}>
                q0 ──[RY(θ)]── M
              </div>

              {/* Live readouts */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: "1rem" }}>
                <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
                  <div>
                    <span style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.72rem", color: "#9CA3AF" }}>θ (rad) </span>
                    <span style={{ fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace", fontSize: "0.875rem", color: "#111", fontWeight: 600 }}>
                      {s1.theta.toFixed(4)}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.72rem", color: "#9CA3AF" }}>θ (deg) </span>
                    <span style={{ fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace", fontSize: "0.875rem", color: "#111", fontWeight: 600 }}>
                      {(s1.theta * 180 / Math.PI).toFixed(1)}°
                    </span>
                  </div>
                  <div>
                    <span style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.72rem", color: "#9CA3AF" }}>step </span>
                    <span style={{ fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace", fontSize: "0.875rem", color: "#111", fontWeight: 600 }}>
                      {s1.iter}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.72rem", color: "#9CA3AF" }}>loss </span>
                    <span style={{ fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace", fontSize: "0.875rem", color: "#111", fontWeight: 600 }}>
                      {currentLoss !== null ? currentLoss.toFixed(5) : "—"}
                    </span>
                  </div>
                </div>

                {/* P(|1⟩) bar */}
                {probs1 && (
                  <div style={{ maxWidth: 380 }}>
                    <div style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.72rem", color: "#9CA3AF", marginBottom: 4 }}>
                      State probabilities
                    </div>
                    <ProbBar label={basisLabel(0, 1)} value={probs1[0]} />
                    <div style={{ marginTop: 4 }}>
                      <ProbBar label={basisLabel(1, 1)} value={probs1[1]} />
                    </div>
                  </div>
                )}
              </div>

              {/* Loss curve */}
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.72rem", color: "#9CA3AF", marginBottom: 4 }}>
                  Loss vs. iteration
                </div>
                <LossCurve hist={s1.hist} />
              </div>

              {/* Convergence banner */}
              {s1.done && s1.iter > 0 && (
                <div style={{
                  padding: "8px 12px", borderRadius: "0.75rem",
                  background: `${ACCENT}10`, border: `1.5px solid ${ACCENT}44`,
                  fontFamily: "var(--font-jakarta)", fontSize: "0.8rem", color: "#374151",
                  marginBottom: "1rem",
                }}>
                  {(currentLoss ?? 1) < CONV_THRESH
                    ? <>Converged in {s1.iter} steps — θ → π ({(s1.theta * 180 / Math.PI).toFixed(1)}°), P(|1⟩) → {probs1 ? (probs1[1] * 100).toFixed(1) : "—"}%, loss → ~0.</>
                    : <>Reached {MAX_ITER} steps. Loss: {currentLoss?.toFixed(5)}. Try Reset to start from a new random angle.</>
                  }
                </div>
              )}

              {/* Controls */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <CtrlBtn label="Step" onClick={handleStep} disabled={!wasmReady || isDone} />
                <CtrlBtn
                  label={running ? "Pause" : "Run"}
                  onClick={handleRun}
                  primary
                  disabled={!wasmReady || (isDone && !running)}
                />
                <CtrlBtn label="Reset" onClick={handleReset} disabled={!wasmReady} />
              </div>

              {/* Callout */}
              <div style={{
                marginTop: "1.25rem", padding: "12px 14px",
                border: "1.5px solid #F0F0F0", borderRadius: "0.75rem",
                background: "#FAFAFA",
              }}>
                <p style={{
                  fontFamily: "var(--font-jakarta)", fontSize: "0.8rem",
                  color: "#374151", lineHeight: 1.6, margin: "0 0 6px",
                }}>
                  <strong>How this works:</strong> θ is the "weight." The parameter-shift rule —
                  the same rule used on real quantum processors — computes the gradient without
                  automatic differentiation. A plain classical optimizer takes one step:
                  θ ← θ − lr × grad. The quantum circuit doesn't learn; the classical loop around
                  it does.
                </p>
                <p style={{
                  fontFamily: "var(--font-jakarta)", fontSize: "0.8rem",
                  color: "#9CA3AF", lineHeight: 1.6, margin: 0,
                }}>
                  On real hardware you'd estimate the loss from noisy measurements; here the
                  simulator reads the exact state vector, so it converges cleanly.
                </p>
              </div>
            </div>
          )}

          {/* ── Demo 2: Make a Bell pair ── */}
          {tab === "bell" && (
            <div>
              <p style={{
                fontFamily: "var(--font-jakarta)", fontSize: "0.825rem",
                color: "#374151", lineHeight: 1.6, margin: "0 0 1rem",
              }}>
                Two learnable angles [a, b] drive a 2-qubit ansatz. The target is the Bell state
                (P(|00⟩) ≈ P(|11⟩) ≈ 50%, P(|01⟩) ≈ P(|10⟩) ≈ 0%). Parameter-shift gradients
                are computed independently per angle — this is a 2-"weight" quantum neural network
                learning to produce entanglement.
              </p>

              {/* Circuit diagram (static) */}
              <div style={{
                fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
                fontSize: "0.78rem", color: "#6B7280",
                background: "#F9FAFB", border: "1px solid #F0F0F0",
                borderRadius: "0.75rem", padding: "10px 14px",
                marginBottom: "1rem", lineHeight: 1.8,
              }}>
                q0 ──[RY(a)]──●──────── M{"\n"}
                q1 ───────────⊕──[RY(b)]── M
              </div>

              {/* Live readouts */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: "1rem" }}>
                <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
                  <div>
                    <span style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.72rem", color: "#9CA3AF" }}>a (rad) </span>
                    <span style={{ fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace", fontSize: "0.875rem", color: "#111", fontWeight: 600 }}>
                      {s2.a.toFixed(4)}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.72rem", color: "#9CA3AF" }}>b (rad) </span>
                    <span style={{ fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace", fontSize: "0.875rem", color: "#111", fontWeight: 600 }}>
                      {s2.b.toFixed(4)}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.72rem", color: "#9CA3AF" }}>step </span>
                    <span style={{ fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace", fontSize: "0.875rem", color: "#111", fontWeight: 600 }}>
                      {s2.iter}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.72rem", color: "#9CA3AF" }}>loss </span>
                    <span style={{ fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace", fontSize: "0.875rem", color: "#111", fontWeight: 600 }}>
                      {currentLoss !== null ? currentLoss.toFixed(5) : "—"}
                    </span>
                  </div>
                </div>

                {/* 4-state probability bars */}
                {probs2 && (
                  <div style={{ maxWidth: 380 }}>
                    <div style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.72rem", color: "#9CA3AF", marginBottom: 4 }}>
                      State probabilities
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {[0, 1, 2, 3].map(i => (
                        <ProbBar key={i} label={basisLabel(i, 2)} value={probs2[i]} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Loss curve */}
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.72rem", color: "#9CA3AF", marginBottom: 4 }}>
                  Loss vs. iteration
                </div>
                <LossCurve hist={s2.hist} />
              </div>

              {/* Convergence banner */}
              {s2.done && s2.iter > 0 && probs2 && (
                <div style={{
                  padding: "8px 12px", borderRadius: "0.75rem",
                  background: `${ACCENT}10`, border: `1.5px solid ${ACCENT}44`,
                  fontFamily: "var(--font-jakarta)", fontSize: "0.8rem", color: "#374151",
                  marginBottom: "1rem",
                }}>
                  {(currentLoss ?? 1) < CONV_THRESH
                    ? <>
                        Converged in {s2.iter} steps — P(|00⟩) ≈ {(probs2[0] * 100).toFixed(1)}%,
                        P(|11⟩) ≈ {(probs2[3] * 100).toFixed(1)}%,
                        P(|01⟩) + P(|10⟩) ≈ {((probs2[2] + probs2[1]) * 100).toFixed(1)}%.
                      </>
                    : <>Reached {MAX_ITER} steps. Loss: {currentLoss?.toFixed(5)}.</>
                  }
                </div>
              )}

              {/* Controls */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <CtrlBtn label="Step" onClick={handleStep} disabled={!wasmReady || isDone} />
                <CtrlBtn
                  label={running ? "Pause" : "Run"}
                  onClick={handleRun}
                  primary
                  disabled={!wasmReady || (isDone && !running)}
                />
                <CtrlBtn label="Reset" onClick={handleReset} disabled={!wasmReady} />
              </div>

              {/* Callout */}
              <div style={{
                marginTop: "1.25rem", padding: "12px 14px",
                border: "1.5px solid #F0F0F0", borderRadius: "0.75rem",
                background: "#FAFAFA",
              }}>
                <p style={{
                  fontFamily: "var(--font-jakarta)", fontSize: "0.8rem",
                  color: "#374151", lineHeight: 1.6, margin: "0 0 6px",
                }}>
                  <strong>Two weights, one entangled target:</strong> a and b are both trained
                  with parameter-shift, independently. Watch |01⟩ and |10⟩ die while |00⟩ and
                  |11⟩ climb toward 50% each — the circuit learning to produce correlations that
                  can't exist in any un-entangled state.
                </p>
                <p style={{
                  fontFamily: "var(--font-jakarta)", fontSize: "0.8rem",
                  color: "#9CA3AF", lineHeight: 1.6, margin: 0,
                }}>
                  This is full-state-vector simulation, not a real QPU. On real hardware, the loss
                  surface grows exponentially harder at scale (barren plateaus), and each loss
                  evaluation is noisy. Here the simulator gives exact values, so it converges
                  cleanly.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

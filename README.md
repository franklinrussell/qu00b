# QU|00⟩B

**Meet your first qubit.**

A radically simple, browser-based quantum circuit simulator. The simulation runs 100% client-side — a Rust core compiled to WebAssembly does the state-vector math; Next.js owns the UI.

🔗 **Live:** [qu00b.app](https://qu00b.app)

---

## What it does

- **Click-to-place gate grid** — 6 qubits × 12 time steps
- **Gate set:** H · X · Y · Z · S · T · Rx(θ) · Ry(θ) · Rz(θ) · CNOT · CZ
- **Live probability bars** — state vector updates instantly after every gate placement
- **Shot histogram** — run N measurements and see the empirical distribution
- No backend. No network call. The quantum math never leaves your browser.

---

## How it works

### State-vector engine

The Rust crate `crates/qsim` maintains a state of 2ⁿ complex amplitudes as two parallel `f64` arrays (real, imaginary). A single-qubit gate mixes only the amplitude *pairs* that differ in bit `q` — no full 2ⁿ × 2ⁿ matrix is ever constructed. Cost is O(2ⁿ) per gate.

```
|ψ⟩ = Σ αₖ |k⟩    (k ∈ {0,1}ⁿ)
```

Controlled gates (CNOT, CZ) use the same loop, guarded by a control-bit check.

### WebAssembly boundary

`wasm-pack --target web` compiles the crate to an ESM bundle (`src/qsim-pkg/`). The TypeScript wrapper (`src/lib/qsim.ts`) loads the wasm once via `init()` and exposes a `run(circuit, shots?)` function that returns `{ probs, counts? }`.

### Example: Bell state

```ts
import { run } from "@/lib/qsim";

const bellState = {
  id: "bell",
  name: "Bell state",
  qubits: 2,
  gates: [
    { type: "H",    target: 0, col: 0 },
    { type: "CNOT", target: 1, control: 0, col: 1 },
  ],
};

const { probs } = run(bellState);
// probs[0] ≈ 0.5  → |00⟩
// probs[3] ≈ 0.5  → |11⟩
// probs[1] = probs[2] = 0
```

---

## Running locally

```bash
git clone https://github.com/franklinrussell/qu00b
cd qu00b
npm install
npm run dev          # http://localhost:3000
```

To rebuild the wasm (requires Rust + wasm-pack):

```bash
npm run build:wasm   # wasm-pack build crates/qsim → src/qsim-pkg/
```

The compiled `src/qsim-pkg/` is committed so Vercel deploys work without a Rust toolchain.

---

## Project structure

```
crates/qsim/        — Rust state-vector simulator (MIT OR Apache-2.0)
  src/lib.rs        — Sim struct, gate methods, #[cfg(test)] kernel tests
src/
  lib/qsim.ts       — TS init + run() wrapper
  app/circuit/      — Main simulator UI (CircuitSimulator.tsx)
  lib/              — onejsonfile storage, auth adapter, rate limiter
  components/       — Header, Footer, Logo
```

---

## License

Dual-licensed under [MIT](LICENSE-MIT) OR [Apache-2.0](LICENSE-APACHE) — your choice.

Built with [Birch Tree Studio](https://birchtreestudio.dev) design system.

# QU|00⟩B

A browser-based quantum circuit simulator. The simulation runs 100% client-side: a Rust kernel compiled to WebAssembly does the state-vector math; Next.js owns the UI. No server, no quantum hardware, no install.

**[qu00b.app](https://qu00b.app)**

---

<!-- Screenshot: drop a screenshot or GIF at docs/demo.gif and uncomment.
     Suggested shot: Bell pair (two bars at 50%) or Grover — 1 iter (|11⟩ bar at 100%).
     The screenshot in this PR shows Grover — 2 iter (overshoot back to 25%×4).
-->
<!-- ![qu00b demo](docs/demo.gif) -->

---

## What it is

Place gates on a 6-qubit × 14-column grid. The state vector updates live after every placement. Run N shot measurements to see the empirical distribution alongside the exact probabilities.

**Gate set:** H · X · Y · Z · S · T · Rx(θ) · Ry(θ) · Rz(θ) · CNOT · CZ

**Try-this examples** (one click, no typing):

| Example | What it shows |
|---|---|
| Fair coin | Single H gate → perfect 50/50 superposition |
| Bell pair | H + CNOT → two-qubit entanglement |
| GHZ | Three-way entanglement; only all-0 and all-1 survive |
| Deutsch's algorithm | Quantum speedup in one query vs two classically |
| Grover — 0 / 1 / 2 iter | Step through amplitude amplification; watch the target bar climb then overshoot |

**Save circuits** (GitHub sign-in): named circuits persist to your account and load back onto the grid. Save updates an existing record; Clear + Save creates a new one.

---

## Architecture

```
crates/qsim/     — Rust state-vector simulator
    src/lib.rs   — Sim struct, gate methods, #[cfg(test)] kernel tests
src/qsim-pkg/    — wasm-pack output (committed — see below)
src/
    lib/qsim.ts  — TS init() + run(circuit, shots?) wrapper
    app/circuit/ — Simulator page: CircuitSimulator, TryThis, SavedCircuits
    app/         — landing, /about, /signin, /privacy, /terms, /support
    components/  — Header, Footer, Logo, Wordmark
    lib/         — onejsonfile storage, OnejsonfileAdapter, auth, support API
```

### State-vector engine (`crates/qsim/src/lib.rs`)

State is 2ⁿ complex amplitudes held in two parallel `f64` arrays (`re`, `im`) in Wasm linear memory. A single-qubit gate walks only the amplitude *pairs* that differ in bit `q` — no 2ⁿ × 2ⁿ matrix is ever constructed:

```rust
let bit = 1usize << q;
while i < size {
    if i & bit == 0 {
        let j = i | bit;
        // apply [[a,b],[c,d]] to (re[i]+i·im[i], re[j]+i·im[j])
        ...
    }
    i += 1;
}
```

Controlled gates (CNOT, CZ) use the same loop with an additional `i & cbit != 0` guard. Cost: **O(2ⁿ) per gate**.

Readout: `probabilities()` returns `re[k]² + im[k]²` for each basis state. `sample(rand_stream)` does inverse-CDF sampling from caller-provided uniform floats (randomness lives in JS; Wasm stays deterministic).

### Why 6 qubits

The state vector is 2ⁿ amplitudes. At 6 qubits that's 64 complex numbers — instant to compute in the browser. At 30 qubits it's 1 billion. The cap is intentional: this is a learning tool, not a research simulator.

### WebAssembly boundary

`wasm-pack --target web` compiles the crate to an ESM bundle. The TS wrapper loads it once via `init()` on the circuit page mount and exposes `run(circuit, shots?)` returning `{ probs: Float64Array, counts?: Float64Array }`.

---

## Running locally

### 1 · Install

```bash
git clone https://github.com/franklinrussell/qu00b
cd qu00b
npm install
```

The prebuilt Wasm is committed at `src/qsim-pkg/` — no Rust toolchain needed to run the simulator. Auth and saves require env vars (step 2); the simulator itself (Try-this, gate placement, run/shots) works without them.

### 2 · Env vars

Copy this to `.env.local` and fill in the blanks:

```bash
# NextAuth
NEXTAUTH_SECRET=          # openssl rand -base64 32
AUTH_TRUST_HOST=true

# GitHub OAuth App (https://github.com/settings/developers)
# Callback URL for local dev: http://localhost:3000/api/auth/callback/github
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=

# onejsonfile.com — one token per collection
ONEJSONFILE_USERS_TOKEN=
ONEJSONFILE_SESSIONS_TOKEN=
ONEJSONFILE_ACCOUNTS_TOKEN=
ONEJSONFILE_CIRCUITS_TOKEN=

# Resend (for /support email)
RESEND_API_KEY=
SUPPORT_NOTIFICATION_EMAIL=
```

### 3 · Run

```bash
npm run dev   # http://localhost:3000
```

### Rebuilding the Wasm kernel

If you change `crates/qsim/src/lib.rs`, regenerate and recommit the package:

```bash
wasm-pack build crates/qsim --target web --out-dir ../../src/qsim-pkg
rm src/qsim-pkg/.gitignore   # wasm-pack generates this — delete it or git won't track the output
git add -f src/qsim-pkg
git commit -m "Update prebuilt qsim-pkg"
```

> **`--out-dir` is relative to the crate directory**, not the repo root. `../../src/qsim-pkg` from `crates/qsim/` resolves to `src/qsim-pkg/` at the repo root. See [HANDOFF.md](HANDOFF.md) for detail.

---

## Deployment

Vercel. `npm run build` (`next build`) is the only build step — no Rust toolchain in CI. The committed `src/qsim-pkg/` is the static Wasm asset. Push to `main`; Vercel picks it up via GitHub integration.

---

## License

Dual-licensed: [MIT](LICENSE-MIT) OR [Apache-2.0](LICENSE-APACHE) — your choice.

For the conceptual introduction, see [qu00b.app/about](https://qu00b.app/about).

Built with the [Birch Tree Studio](https://birchtreestudio.dev) design system.

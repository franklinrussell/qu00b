# qu00b — HANDOFF

Part of Birch Tree Studio's public-portfolio. Lives at qu00b.app.

---

## Stack deviations from BTS defaults

**Rust/WebAssembly quantum kernel** — the simulation engine is a Rust crate at `crates/qsim/` compiled to WASM via wasm-pack. This is intentional and is the whole point of the app. The TS-only BTS default does not apply here. All quantum math lives in `crates/qsim/src/lib.rs`; the TS wrapper is `src/lib/qsim.ts`.

**Dual license** — MIT OR Apache-2.0 (standard open-source dual), not BTS-typical "all rights reserved." Recorded in LICENSE-MIT and LICENSE-APACHE.

---

## Routes

| Route | Notes |
|---|---|
| `/` | Landing page |
| `/circuit` | Main simulator UI (anonymous OK) |
| `/signin` | Magic-link auth |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/support` | Contact form — PUBLIC (anonymous-use Pomarola model) |
| `/api/auth/[...nextauth]` | NextAuth v5 handler + rate-limit intercept |
| `/api/support` | Resend email route |
| `/api/circuits` | GET/PUT/DELETE circuits — auth-required |

---

## Circuit JSON shape

```ts
interface Circuit {
  id: string;
  name: string;
  qubits: number;          // fixed at 6 for v1
  gates: Gate[];
}

interface Gate {
  type: GateType;          // H|X|Y|Z|S|T|RX|RY|RZ|CNOT|CZ
  target: number;          // qubit row index (0-based)
  control?: number;        // for CNOT/CZ only
  theta?: number;          // radians, for RX/RY/RZ only
  col: number;             // time step (column)
}
```

Stored in onejsonfile as `Record<"userId:circuitId", Circuit & { userId }>`.

---

## onejsonfile tokens

Five tokens required — set in `.env.local` and Vercel production:

| Env var | Collection |
|---|---|
| `ONEJSONFILE_USERS_TOKEN` | `Record<userId, Qu00bUser>` |
| `ONEJSONFILE_SESSIONS_TOKEN` | `Record<sessionToken, { userId, expires }>` |
| `ONEJSONFILE_AUTH_TOKEN` | `{ verificationTokens: Record<...> }` |
| `ONEJSONFILE_RATELIMIT_TOKEN` | `Record<hashedKey, count>` |
| `ONEJSONFILE_CIRCUITS_TOKEN` | `Record<userId:circuitId, Circuit>` |

**TODO:** Mint these tokens at onejsonfile.com and paste into `.env.local`, then push to Vercel.

---

## Vercel wasm-pack build

wasm-pack is not available in the Vercel build environment by default. Two options:

1. **Committed fallback (current approach):** `src/qsim-pkg/` is NOT gitignored. The compiled wasm output is committed to the repo. Vercel builds Next.js only; no Rust toolchain needed. Update by running `wasm-pack build crates/qsim --target web --out-dir src/qsim-pkg` locally and committing the result.

2. **Native Vercel build (future):** Add a `vercel.json` with `installCommand` that installs Rust + wasm-pack before the Next.js build. Requires `rustup` and `wasm-pack install` in the build step. Document the `vercel.json` approach here when implemented.

Current approach: committed `src/qsim-pkg/`. This is intentional.

---

## Known tripwires (inherited from BTS onejsonfile pattern)

- **Read-error fallback to `{}`:** If onejsonfile returns a non-404 error, `readCircuits()` etc. return `{}`. A subsequent write would wipe real data. Safe at current scale; fix before meaningful growth.
- **Read-modify-write race:** No ETags or locks. Concurrent saves by the same user could lose one. Safe at current scale (one user, low concurrency).

---

## v1 scope freeze

v1 is intentionally locked to:
- Fixed 6-qubit register
- 12 time columns
- Gate set: H/X/Y/Z/S/T/Rx/Ry/Rz/CNOT/CZ
- Live probability bars + shot histogram

Do not add: variable qubit count, gate library expansion, state vector export, multi-circuit management, or any other feature until v1 is deployed and used.

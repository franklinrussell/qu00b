# qu00b — HANDOFF

Part of Birch Tree Studio's public-portfolio. Lives at qu00b.app.

---

## Stack deviations from BTS defaults

**Rust/WebAssembly quantum kernel** — the simulation engine is a Rust crate at `crates/qsim/` compiled to WASM via wasm-pack. This is intentional and is the whole point of the app. The TS-only BTS default does not apply here. All quantum math lives in `crates/qsim/src/lib.rs`; the TS wrapper is `src/lib/qsim.ts`.

**GitHub OAuth instead of magic-link** — BTS default is Nodemailer/Resend magic-link. qu00b uses GitHub OAuth (`next-auth/providers/github`). The adapter implements `getUserByAccount` and `linkAccount` via a dedicated `accounts` onejsonfile collection keyed as `"github:providerAccountId"` → `userId`. GitHub username (`login`) is stored as `Qu00bUser.name`; avatar URL as `Qu00bUser.avatarUrl`. The `AuthMetaDoc` / `verificationTokens` collection is retained in the adapter interface but is never called by GitHub OAuth flow.

**Dual license** — MIT OR Apache-2.0 (standard open-source dual), not BTS-typical "all rights reserved." Recorded in LICENSE-MIT and LICENSE-APACHE.

---

## Routes

| Route | Notes |
|---|---|
| `/` | Landing page |
| `/about` | What qu00b is, engine explanation, name etymology |
| `/circuit` | Main simulator UI (anonymous OK) |
| `/signin` | GitHub OAuth — single "Continue with GitHub" button |
| `/privacy` | Privacy policy (GitHub OAuth-specific) |
| `/terms` | Terms of service |
| `/support` | Contact form — PUBLIC (anonymous-use Pomarola model) |
| `/api/auth/[...nextauth]` | NextAuth v5 handler (GET + POST, no custom intercept) |
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

Six tokens required — set in `.env.local` and Vercel production:

| Env var | Collection |
|---|---|
| `ONEJSONFILE_USERS_TOKEN` | `Record<userId, Qu00bUser>` |
| `ONEJSONFILE_SESSIONS_TOKEN` | `Record<sessionToken, { userId, expires }>` |
| `ONEJSONFILE_AUTH_TOKEN` | `{ verificationTokens: Record<...> }` (unused by GitHub OAuth, kept for adapter interface) |
| `ONEJSONFILE_RATELIMIT_TOKEN` | `Record<hashedKey, count>` (unused by GitHub OAuth, kept for future use) |
| `ONEJSONFILE_CIRCUITS_TOKEN` | `Record<userId:circuitId, Circuit>` |
| `ONEJSONFILE_ACCOUNTS_TOKEN` | `Record<"github:providerAccountId", userId>` |

**TODO:** Mint these tokens at onejsonfile.com and paste into `.env.local`, then push to Vercel.

GitHub OAuth env vars also required:

| Env var | Where to get it |
|---|---|
| `AUTH_GITHUB_ID` | GitHub → Settings → Developer settings → OAuth Apps → qu00b |
| `AUTH_GITHUB_SECRET` | Same. Callback URL: `https://qu00b.app/api/auth/callback/github` |

---

## GitHub OAuth callback URLs

Register these in the GitHub OAuth App settings:

- **Production:** `https://qu00b.app/api/auth/callback/github`
- **Local dev:** `http://localhost:3000/api/auth/callback/github`

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

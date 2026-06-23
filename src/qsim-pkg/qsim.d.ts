/* tslint:disable */
/* eslint-disable */

export class Sim {
    free(): void;
    [Symbol.dispose](): void;
    cnot(control: number, target: number): void;
    cz(control: number, target: number): void;
    h(q: number): void;
    constructor(n: number);
    prob_one(q: number): number;
    probabilities(): Float64Array;
    qubits(): number;
    reset(): void;
    rx(q: number, theta: number): void;
    ry(q: number, theta: number): void;
    rz(q: number, theta: number): void;
    s(q: number): void;
    sample(rand_stream: Float64Array): Float64Array;
    t(q: number): void;
    x(q: number): void;
    y(q: number): void;
    z(q: number): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_sim_free: (a: number, b: number) => void;
    readonly sim_cnot: (a: number, b: number, c: number) => void;
    readonly sim_cz: (a: number, b: number, c: number) => void;
    readonly sim_h: (a: number, b: number) => void;
    readonly sim_new: (a: number) => number;
    readonly sim_prob_one: (a: number, b: number) => number;
    readonly sim_probabilities: (a: number) => [number, number];
    readonly sim_qubits: (a: number) => number;
    readonly sim_reset: (a: number) => void;
    readonly sim_rx: (a: number, b: number, c: number) => void;
    readonly sim_ry: (a: number, b: number, c: number) => void;
    readonly sim_rz: (a: number, b: number, c: number) => void;
    readonly sim_s: (a: number, b: number) => void;
    readonly sim_sample: (a: number, b: number, c: number) => [number, number];
    readonly sim_t: (a: number, b: number) => void;
    readonly sim_x: (a: number, b: number) => void;
    readonly sim_y: (a: number, b: number) => void;
    readonly sim_z: (a: number, b: number) => void;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;

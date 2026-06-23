// Render a basis-state index as a ket label with q0 as the leftmost bit.
// The kernel stores q0 at bit 0 (LSB), so a plain binary string puts q0 on the right.
// Reversing moves q0 to the front so the label reads in the same order as the wire grid.
export function basisLabel(index: number, nQubits: number): string {
  const bits = index.toString(2).padStart(nQubits, "0").split("").reverse().join("");
  return `|${bits}⟩`;
}

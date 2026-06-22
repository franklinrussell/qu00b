const ACCENT = "#14B8A6";

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100" height="100" rx="22" fill={ACCENT} />
      {/*
        Half-filled circle: superposition of |0⟩ and |1⟩.
        Full white circle outline + right half filled solid white.
      */}
      <circle cx="50" cy="50" r="30" stroke="white" strokeWidth="6" fill="none" />
      {/* Right half: filled solid white using a path (semicircle arc) */}
      <path d="M50 20 A30 30 0 0 1 50 80 Z" fill="white" />
    </svg>
  );
}

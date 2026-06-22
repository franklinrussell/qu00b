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
      {/* Bloch vector: equator circle + one arrow pointing up-right */}
      <circle cx="50" cy="50" r="28" stroke="white" strokeWidth="6" fill="none" />
      {/* Arrow shaft: from center to upper-right */}
      <line x1="50" y1="50" x2="71" y2="26" stroke="white" strokeWidth="6" strokeLinecap="round" />
      {/* Arrowhead */}
      <polyline
        points="59,22 71,26 67,37"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

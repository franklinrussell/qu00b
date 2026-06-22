// Renders QU|00⟩B with SVG slashed zeros so the digits read as digits, not letter O.
// Inherits color, font-family, font-size, and letter-spacing from the parent element.

function SlashedZero() {
  return (
    <svg
      viewBox="0 0 52 80"
      aria-hidden="true"
      fill="none"
      style={{
        height: "0.78em",
        width: "0.42em",
        display: "inline-block",
        verticalAlign: "-0.06em",
        marginRight: "0.02em",
      }}
    >
      <ellipse
        cx="26" cy="40" rx="20.5" ry="33"
        stroke="currentColor" strokeWidth="7.5"
      />
      <line
        x1="9" y1="70" x2="43" y2="10"
        stroke="currentColor" strokeWidth="7.5" strokeLinecap="round"
      />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", lineHeight: 1 }}>
      <span>QU|</span>
      <SlashedZero />
      <SlashedZero />
      <span>&#x27E9;B</span>
    </span>
  );
}

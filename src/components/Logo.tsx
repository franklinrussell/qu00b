import { useId } from "react";

const ACCENT = "#14B8A6";

export function Logo({ size = 28 }: { size?: number }) {
  const discId = useId();

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="22" fill={ACCENT} />
      <defs>
        <clipPath id={discId}><circle cx="50" cy="50" r="30" /></clipPath>
      </defs>
      <path
        d="M50,20 C50,23.33 57,23.33 57,26.67 C57,30 43,30 43,33.33 C43,36.67 57,36.67 57,40 C57,43.33 43,43.33 43,46.67 C43,50 57,50 57,53.33 C57,56.67 43,56.67 43,60 C43,63.33 57,63.33 57,66.67 C57,70 43,70 43,73.33 C43,76.67 50,76.67 50,80 L84,80 L84,20 Z"
        fill="#FFFFFF"
        clipPath={`url(#${discId})`}
      />
      <circle cx="50" cy="50" r="30" fill="none" stroke="#FFFFFF" strokeWidth="6" />
    </svg>
  );
}

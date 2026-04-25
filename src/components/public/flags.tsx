import type { SVGProps } from "react";

type FlagProps = SVGProps<SVGSVGElement>;

const baseProps: FlagProps = {
  width: 24,
  height: 16,
  viewBox: "0 0 24 16",
  xmlns: "http://www.w3.org/2000/svg",
  role: "img",
  focusable: "false",
  className: "rounded-sm shadow-sm ring-1 ring-black/10",
};

export function FlagBR(props: FlagProps) {
  return (
    <svg {...baseProps} {...props}>
      <rect width="24" height="16" fill="#009b3a" />
      <polygon points="12,2 22,8 12,14 2,8" fill="#fedf00" />
      <circle cx="12" cy="8" r="3.2" fill="#002776" />
      <path
        d="M9.1 8.4 a3.2 3.2 0 0 1 5.8 -0.8"
        stroke="#ffffff"
        strokeWidth="0.5"
        fill="none"
      />
    </svg>
  );
}

export function FlagUS(props: FlagProps) {
  const stripes = Array.from({ length: 13 }, (_, i) => (
    <rect
      key={i}
      x={0}
      y={(i * 16) / 13}
      width={24}
      height={16 / 13}
      fill={i % 2 === 0 ? "#b22234" : "#ffffff"}
    />
  ));
  return (
    <svg {...baseProps} {...props}>
      {stripes}
      <rect width="9.6" height={(16 / 13) * 7} fill="#3c3b6e" />
      {Array.from({ length: 9 }).flatMap((_, row) =>
        Array.from({ length: row % 2 === 0 ? 6 : 5 }).map((_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={0.6 + col * 1.6 + (row % 2 === 0 ? 0 : 0.8)}
            cy={0.5 + row * 0.85}
            r={0.32}
            fill="#ffffff"
          />
        ))
      )}
    </svg>
  );
}

export function FlagKR(props: FlagProps) {
  return (
    <svg {...baseProps} {...props}>
      <rect width="24" height="16" fill="#ffffff" />
      <g transform="translate(12 8)">
        <path
          d="M -3.2 0 A 3.2 3.2 0 0 1 3.2 0 A 1.6 1.6 0 0 0 0 0 A 1.6 1.6 0 0 1 -3.2 0 Z"
          fill="#cd2e3a"
        />
        <path
          d="M 3.2 0 A 3.2 3.2 0 0 1 -3.2 0 A 1.6 1.6 0 0 1 0 0 A 1.6 1.6 0 0 0 3.2 0 Z"
          fill="#0047a0"
        />
      </g>
      <g stroke="#000" strokeWidth="0.4" strokeLinecap="butt">
        {/* Top-left trigram (Heaven ☰) */}
        <line x1="3" y1="3.4" x2="6.6" y2="3.4" />
        <line x1="3" y1="4.6" x2="6.6" y2="4.6" />
        <line x1="3" y1="5.8" x2="6.6" y2="5.8" />
        {/* Top-right trigram (Water ☵) */}
        <line x1="17.4" y1="3.4" x2="19.4" y2="3.4" />
        <line x1="20.2" y1="3.4" x2="21" y2="3.4" />
        <line x1="17.4" y1="4.6" x2="21" y2="4.6" />
        <line x1="17.4" y1="5.8" x2="19.4" y2="5.8" />
        <line x1="20.2" y1="5.8" x2="21" y2="5.8" />
        {/* Bottom-left trigram (Fire ☲) */}
        <line x1="3" y1="10.2" x2="4.6" y2="10.2" />
        <line x1="5.4" y1="10.2" x2="6.6" y2="10.2" />
        <line x1="3" y1="11.4" x2="6.6" y2="11.4" />
        <line x1="3" y1="12.6" x2="4.6" y2="12.6" />
        <line x1="5.4" y1="12.6" x2="6.6" y2="12.6" />
        {/* Bottom-right trigram (Earth ☷) */}
        <line x1="17.4" y1="10.2" x2="19" y2="10.2" />
        <line x1="19.8" y1="10.2" x2="21" y2="10.2" />
        <line x1="17.4" y1="11.4" x2="19" y2="11.4" />
        <line x1="19.8" y1="11.4" x2="21" y2="11.4" />
        <line x1="17.4" y1="12.6" x2="19" y2="12.6" />
        <line x1="19.8" y1="12.6" x2="21" y2="12.6" />
      </g>
    </svg>
  );
}

export const FLAGS = {
  pt: FlagBR,
  en: FlagUS,
  ko: FlagKR,
} as const;

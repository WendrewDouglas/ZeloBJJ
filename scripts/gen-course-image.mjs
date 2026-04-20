import sharp from "sharp";
import { writeFile } from "node:fs/promises";

const W = 1040;
const H = 1040;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="75%">
      <stop offset="0%" stop-color="#1c1c1c"/>
      <stop offset="55%" stop-color="#0f0f0f"/>
      <stop offset="100%" stop-color="#050505"/>
    </radialGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f5c26b"/>
      <stop offset="50%" stop-color="#f0ad4e"/>
      <stop offset="100%" stop-color="#c8912e"/>
    </linearGradient>
    <linearGradient id="beltStripe" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f0ad4e"/>
      <stop offset="100%" stop-color="#b07820"/>
    </linearGradient>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- Subtle grid texture -->
  <g opacity="0.04" stroke="#ffffff" stroke-width="1">
    ${Array.from({ length: 20 }, (_, i) => `<line x1="0" y1="${i * 55}" x2="${W}" y2="${i * 55}"/>`).join("")}
    ${Array.from({ length: 20 }, (_, i) => `<line x1="${i * 55}" y1="0" x2="${i * 55}" y2="${H}"/>`).join("")}
  </g>

  <!-- Diagonal belt band (BJJ black belt motif) -->
  <g transform="translate(0 760) skewY(-8)">
    <rect x="-40" y="0" width="1120" height="210" fill="#0a0a0a"/>
    <!-- Gold stripe on the belt (faixa dourada estilo graduacao) -->
    <rect x="720" y="0" width="140" height="210" fill="url(#beltStripe)"/>
    <rect x="720" y="0" width="140" height="210" fill="none" stroke="#8a5e14" stroke-width="2"/>
    <!-- Four bars on the stripe (grau) -->
    <g fill="#1a1203">
      <rect x="740" y="30" width="10" height="150"/>
      <rect x="770" y="30" width="10" height="150"/>
      <rect x="800" y="30" width="10" height="150"/>
      <rect x="830" y="30" width="10" height="150"/>
    </g>
  </g>

  <!-- Corner accents (thin gold lines) -->
  <g stroke="url(#gold)" stroke-width="3" fill="none" opacity="0.9">
    <path d="M 60 60 L 60 130 M 60 60 L 130 60"/>
    <path d="M 980 60 L 980 130 M 980 60 L 910 60"/>
  </g>

  <!-- Top tag -->
  <g transform="translate(520 150)">
    <rect x="-130" y="-22" width="260" height="44" rx="22" fill="none" stroke="url(#gold)" stroke-width="1.5"/>
    <text x="0" y="6" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif"
          font-size="16" font-weight="600" fill="#f0ad4e" letter-spacing="4">
      CURSO DIGITAL
    </text>
  </g>

  <!-- Emblem: stylized gi/triangle mark -->
  <g transform="translate(520 330)" filter="url(#softGlow)">
    <!-- outer hex -->
    <polygon points="0,-96 83,-48 83,48 0,96 -83,48 -83,-48"
             fill="none" stroke="url(#gold)" stroke-width="3"/>
    <!-- inner stylized triangle (lapela do kimono) -->
    <path d="M -44 -30 L 0 48 L 44 -30 Z"
          fill="none" stroke="url(#gold)" stroke-width="3"/>
    <path d="M -26 -14 L 0 30 L 26 -14"
          fill="none" stroke="url(#gold)" stroke-width="2" opacity="0.7"/>
    <!-- knot dot -->
    <circle cx="0" cy="-6" r="6" fill="url(#gold)"/>
  </g>

  <!-- Main title ZELO -->
  <text x="520" y="540" text-anchor="middle" font-family="Impact, Arial Black, sans-serif"
        font-size="150" font-weight="900" fill="#f5f5f5" letter-spacing="8">
    ZELO
  </text>

  <!-- BJJ accent -->
  <text x="520" y="630" text-anchor="middle" font-family="Impact, Arial Black, sans-serif"
        font-size="70" font-weight="900" fill="url(#gold)" letter-spacing="18">
    BJJ
  </text>

  <!-- Thin gold divider -->
  <g transform="translate(520 665)">
    <line x1="-120" y1="0" x2="-20" y2="0" stroke="url(#gold)" stroke-width="2"/>
    <circle cx="0" cy="0" r="4" fill="url(#gold)"/>
    <line x1="20" y1="0" x2="120" y2="0" stroke="url(#gold)" stroke-width="2"/>
  </g>

  <!-- Subtitle -->
  <text x="520" y="710" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif"
        font-size="22" font-weight="400" fill="#c8c8c8" letter-spacing="6">
    BRAZILIAN JIU-JITSU
  </text>

  <!-- 9 modules dots (representing the 9 curriculum modules) -->
  <g transform="translate(520 755)">
    ${Array.from({ length: 9 }, (_, i) => {
      const x = (i - 4) * 36;
      return `<g transform="translate(${x} 0)">
        <rect x="-4" y="-10" width="8" height="20" rx="1" fill="url(#gold)" opacity="0.85"/>
      </g>`;
    }).join("")}
  </g>

  <!-- Bottom callout (on top of the belt band) -->
  <g transform="translate(520 890)">
    <text x="0" y="0" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif"
          font-size="28" font-weight="700" fill="#ffffff" letter-spacing="2">
      9 MÓDULOS · DO ZERO AO AVANÇADO
    </text>
    <text x="0" y="42" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif"
          font-size="16" font-weight="500" fill="#d4d4d4" letter-spacing="5">
      TÉCNICA · POSTURA · MENTALIDADE
    </text>
  </g>

  <!-- Bottom domain -->
  <text x="520" y="1000" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif"
        font-size="15" font-weight="600" fill="#f0ad4e" letter-spacing="6">
    ZELOBJJ.COM.BR
  </text>

  <!-- Corner accents bottom -->
  <g stroke="url(#gold)" stroke-width="3" fill="none" opacity="0.9">
    <path d="M 60 980 L 60 910 M 60 980 L 130 980"/>
    <path d="M 980 980 L 980 910 M 980 980 L 910 980"/>
  </g>
</svg>`;

const svgBuf = Buffer.from(svg);
const outPng = "C:/Users/wendrewgomes/Desktop/ZELO_BJJ_Curso.png";
const outSvg = "C:/Users/wendrewgomes/Desktop/ZELO_BJJ_Curso.svg";

await writeFile(outSvg, svg, "utf8");

await sharp(svgBuf, { density: 144 })
  .resize(W, H, { fit: "contain" })
  .png({ quality: 95, compressionLevel: 9 })
  .toFile(outPng);

console.log("ok:", outPng);
console.log("svg:", outSvg);

import React from 'react';

interface MonogramProps {
  /** pixel size of the square seal */
  size?: number;
  className?: string;
  /** show the circular ring text around the BV mark */
  withText?: boolean;
  /** color treatment */
  tone?: 'brand' | 'light' | 'dark' | 'currentColor';
  /** circular ring text (defaults to brand tagline) */
  text?: string;
}

/**
 * BINOVET signature seal — an interlocked "BV" monogram inside a
 * double ring, optionally wrapped with circular brand text. Pure SVG,
 * server-component safe. Used as a recurring brand "signature" across
 * heroes, the footer and section accents (often at low opacity as a
 * watermark).
 */
export default function Monogram({
  size = 120,
  className = '',
  withText = true,
  tone = 'brand',
  text = 'BINOVET · THÚ Y CÔNG NGHỆ CAO · ',
}: MonogramProps) {
  const stroke =
    tone === 'light' ? '#ffffff' : tone === 'dark' ? '#06243f' : tone === 'currentColor' ? 'currentColor' : '#0a4d8c';
  const accent =
    tone === 'light' ? '#ffffff' : tone === 'currentColor' ? 'currentColor' : '#d9531f';
  const uid = `mono-${size}-${tone}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <path id={`${uid}-circle`} d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
      </defs>

      {/* outer + inner rings */}
      <circle cx="100" cy="100" r="96" fill="none" stroke={stroke} strokeWidth="1" opacity="0.55" />
      <circle cx="100" cy="100" r="66" fill="none" stroke={stroke} strokeWidth="1.5" />

      {/* tick marks */}
      {Array.from({ length: 48 }).map((_, i) => {
        const a = (i / 48) * Math.PI * 2;
        const r1 = 88;
        const r2 = i % 4 === 0 ? 82 : 85;
        return (
          <line
            key={i}
            x1={100 + Math.cos(a) * r1}
            y1={100 + Math.sin(a) * r1}
            x2={100 + Math.cos(a) * r2}
            y2={100 + Math.sin(a) * r2}
            stroke={stroke}
            strokeWidth="1"
            opacity="0.4"
          />
        );
      })}

      {/* interlocked BV monogram */}
      <text
        x="100"
        y="100"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-display), Georgia, serif"
        fontWeight="700"
        fontSize="62"
        fill={stroke}
        letterSpacing="-4"
      >
        B
        <tspan fill={accent}>V</tspan>
      </text>

      {/* circular ring text */}
      {withText && (
        <text fill={stroke} fontFamily="var(--font-montserrat), sans-serif" fontSize="9" fontWeight="700" letterSpacing="3" opacity="0.8">
          <textPath href={`#${uid}-circle`} startOffset="0">
            {text.repeat(2)}
          </textPath>
        </text>
      )}
    </svg>
  );
}

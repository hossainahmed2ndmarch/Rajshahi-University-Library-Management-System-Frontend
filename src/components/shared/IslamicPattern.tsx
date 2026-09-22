"use client";

import React, { useId } from "react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

export type PatternVariant =
  | "light"
  | "dark"
  | "gold"
  | "emerald"
  | "minimal"
  | "hero"
  | "section";

interface IslamicPatternProps {
  /** Color palette / intensity variant */
  variant?: PatternVariant;
  /** Extra CSS classes for the container */
  className?: string;
  /** Overall opacity of the background pattern layer (0 to 1). Default: 1 */
  opacity?: number;
  /** Fixed position mode for whole-page background wrapper */
  fixed?: boolean;
  /** Children to render over the pattern */
  children?: React.ReactNode;
}

// ─── Calligraphy, Calligraffiti, Holy Words & Library Icons ───────────────────

function PatternIcons({
  strokeColor,
  strokeOpacity,
}: {
  strokeColor: string;
  strokeOpacity: number;
}) {
  const fontStyle = {
    fontFamily: "'Amiri', 'Traditional Arabic', 'Scheherazade New', 'Arabic Typesetting', serif",
  };

  return (
    <g
      stroke={strokeColor}
      strokeOpacity={strokeOpacity}
      strokeWidth="1.3"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* ── 1. KALIMA TAYYIBA (Top Center: Rotated -8 deg) ── */}
      <g transform="translate(140, 45) rotate(-8)">
        <text
          x="0"
          y="0"
          fontSize="24"
          fontWeight="bold"
          style={fontStyle}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.2"
          strokeOpacity={strokeOpacity}
          direction="rtl"
        >
          لا إله إلا الله محمد رسول الله
        </text>
        {/* Dynamic Calligraffiti Swash below Kalima */}
        <path d="M -10 12 C 40 22, 120 20, 180 8" strokeWidth="1.5" />
      </g>

      {/* ── 2. ALLAH (الله) CALLIGRAPHIC EMBLEM (Top Left: Rotated 14 deg) ── */}
      <g transform="translate(45, 75) rotate(14) scale(1.3)">
        <text
          x="0"
          y="0"
          fontSize="30"
          fontWeight="900"
          style={fontStyle}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.4"
          strokeOpacity={strokeOpacity}
        >
          الله
        </text>
        {/* Calligraphic Crescent Envelope */}
        <path d="M -8 10 C -20 -10, 15 -25, 35 -5" strokeWidth="1.1" />
      </g>

      {/* ── 3. RABBI ZIDNI 'ILMA (رَبِّ زِدْنِي عِلْمًا - Dua for Knowledge) ── */}
      <g transform="translate(220, 130) rotate(-16) scale(1.15)">
        <text
          x="0"
          y="0"
          fontSize="23"
          fontWeight="bold"
          style={fontStyle}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.2"
          strokeOpacity={strokeOpacity}
          direction="rtl"
        >
          رَبِّ زِدْنِي عِلْمًا
        </text>
        {/* Calligraffiti Accent Line */}
        <path d="M -15 8 Q 40 25 110 5" strokeWidth="1.2" />
      </g>

      {/* ── 4. IQRA (اقْرَأْ - Read / First Word Revealed) (Center Right: Rotated 22 deg) ── */}
      <g transform="translate(320, 200) rotate(22) scale(1.25)">
        <text
          x="0"
          y="0"
          fontSize="28"
          fontWeight="bold"
          style={fontStyle}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.3"
          strokeOpacity={strokeOpacity}
          direction="rtl"
        >
          اقْرَأْ
        </text>
      </g>

      {/* ── 5. AL-ILMU NURUN (العِلْمُ نُورٌ - Knowledge is Light) (Bottom Left: Rotated -12 deg) ── */}
      <g transform="translate(50, 270) rotate(-12) scale(1.2)">
        <text
          x="0"
          y="0"
          fontSize="22"
          fontWeight="bold"
          style={fontStyle}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.2"
          strokeOpacity={strokeOpacity}
          direction="rtl"
        >
          العِلْمُ نُورٌ
        </text>
      </g>

      {/* ── 6. AR-RAHMAN (الرَّحْمَن) (Bottom Center: Rotated 10 deg) ── */}
      <g transform="translate(190, 360) rotate(10) scale(1.2)">
        <text
          x="0"
          y="0"
          fontSize="25"
          fontWeight="bold"
          style={fontStyle}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.2"
          strokeOpacity={strokeOpacity}
          direction="rtl"
        >
          الرَّحْمَن
        </text>
      </g>

      {/* ── 7. URBAN SQUARE KUFIC CALLIGRAFFITI MOTIF ── */}
      <g transform="translate(45, 170) rotate(18) scale(1.1)">
        <path d="M 0 0 H 26 V 26 H 0 Z" strokeWidth="1.2" />
        <path d="M 6 6 H 20 V 20 H 6 Z" strokeWidth="1.1" />
        <path d="M 13 0 V 13 H 26" strokeWidth="1.3" />
        <path d="M 0 20 H 13 V 26" strokeWidth="1.3" />
      </g>

      {/* ── 8. EXPRESSIVE CALLIGRAFFITI BRUSH SWASH & SPLASH ── */}
      <g transform="translate(290, 280) rotate(-32) scale(1.3)">
        <path
          d="M 2 24 C 15 4, 35 2, 48 12 C 32 18, 18 28, 2 24 Z"
          strokeWidth="1.2"
        />
        <circle cx="52" cy="8" r="1.5" fill={strokeColor} fillOpacity={strokeOpacity * 0.9} stroke="none" />
        <circle cx="46" cy="2" r="1.1" fill={strokeColor} fillOpacity={strokeOpacity * 0.7} stroke="none" />
      </g>

      {/* ── 9. OPEN QURAN ON REHAL STAND ── */}
      <g transform="translate(60, 350) rotate(-15) scale(1.35)">
        <path d="M 2 5 C 7 2, 13 2, 17 5 C 21 2, 27 2, 32 5 V 22 C 27 19, 21 19, 17 21 C 13 19, 7 19, 2 22 Z" />
        <path d="M 17 5 V 21" />
        <path d="M 4 23 L 29 30" strokeWidth="1" />
        <path d="M 30 23 L 5 30" strokeWidth="1" />
      </g>

      {/* ── 10. READING GLASSES / CHOSMA ── */}
      <g transform="translate(360, 80) rotate(25) scale(1.2)">
        <circle cx="9" cy="12" r="7" />
        <circle cx="27" cy="12" r="7" />
        <path d="M 16 11 C 18 9, 18 9, 20 11" />
        <path d="M 2 11 L 0 6" />
        <path d="M 34 11 L 36 6" />
      </g>

      {/* ── 11. FEATHER QUILL PEN (KALAM) ── */}
      <g transform="translate(180, 220) rotate(-45) scale(1.3)">
        <path d="M 3 28 C 10 20, 16 8, 26 2 C 23 10, 18 22, 3 28 Z" />
        <path d="M 3 28 L 0 31" />
        <path d="M 12 18 L 18 22" />
      </g>

      {/* ── 12. MINARET / MINAR ── */}
      <g transform="translate(330, 360) rotate(-16) scale(1.3)">
        <path d="M 10 30 V 10 H 22 V 30" />
        <path d="M 7 18 H 25" />
        <path d="M 8 10 H 24" />
        <path d="M 11 10 C 11 5, 16 2, 16 2 C 16 2, 21 5, 21 10" />
        <line x1="16" y1="2" x2="16" y2="-1" />
      </g>

      {/* ── 13. CALLIGRAPHIC NUKTAS (DIAMOND DOTS) & STARS ── */}
      <polygon points="120,170 124,174 120,178 116,174" fill={strokeColor} fillOpacity={strokeOpacity * 0.8} stroke="none" />
      <polygon points="260,90 264,94 260,98 256,94" fill={strokeColor} fillOpacity={strokeOpacity * 0.8} stroke="none" />
      <polygon points="380,290 384,294 380,298 376,294" fill={strokeColor} fillOpacity={strokeOpacity * 0.8} stroke="none" />
      <circle cx="210" cy="180" r="1.8" fill={strokeColor} fillOpacity={strokeOpacity * 0.5} stroke="none" />
      <circle cx="30" cy="220" r="1.5" fill={strokeColor} fillOpacity={strokeOpacity * 0.4} stroke="none" />
    </g>
  );
}

// ─── Color Variant Presets (Optimized for #04100C Dark Mode) ──────────────────

const VARIANTS: Record<
  PatternVariant,
  { primaryColor: string; strokeOpacity: number }
> = {
  light: {
    primaryColor: "#334155", // slate-700
    strokeOpacity: 0.12,
  },
  dark: {
    primaryColor: "#6ee7b7", // Soft Mint Emerald (Rich contrast on #04100C)
    strokeOpacity: 0.08,
  },
  gold: {
    primaryColor: "#f59e0b", // Amber/Gold
    strokeOpacity: 0.11,
  },
  emerald: {
    primaryColor: "#34d399", // Emerald-400
    strokeOpacity: 0.1,
  },
  minimal: {
    primaryColor: "#a7f3d0", // Ultra light mint
    strokeOpacity: 0.05,
  },
  hero: {
    primaryColor: "#34d399", // Emerald accent
    strokeOpacity: 0.11,
  },
  section: {
    primaryColor: "#6ee7b7", // Emerald-300
    strokeOpacity: 0.08,
  },
};

// ─── Main Component ──────────────────────────────────────────────────────────

export function IslamicPattern({
  variant = "light",
  className,
  opacity = 1,
  fixed = false,
  children,
}: IslamicPatternProps) {
  const baseId = useId();
  const patternId = `islamic-bg-pattern-${baseId.replace(/:/g, "")}`;

  const config = VARIANTS[variant] ?? VARIANTS.light;

  // Broad Canvas size (440px x 440px) to prevent overlapping of long Arabic calligraphic phrases
  const TILE_SIZE = 440;

  return (
    <div
      className={cn(
        fixed ? "fixed inset-0" : "absolute inset-0",
        "pointer-events-none overflow-hidden select-none",
        className
      )}
      aria-hidden="true"
      style={{ opacity }}
    >
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id={patternId}
            x="0"
            y="0"
            width={TILE_SIZE}
            height={TILE_SIZE}
            patternUnits="userSpaceOnUse"
          >
            <PatternIcons
              strokeColor={config.primaryColor}
              strokeOpacity={config.strokeOpacity}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
      {children}
    </div>
  );
}

export default IslamicPattern;
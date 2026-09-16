import React from 'react';

interface GreenShieldLogoProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export const GreenShieldLogo: React.FC<GreenShieldLogoProps> = ({
  className = '',
  size = 40,
  glow = true,
}) => {
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-label="Guardian Shield Logo"
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="w-full h-full drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Light transparent green gradient for shield background */}
          <linearGradient id="shieldTransGreenFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.32" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0.26" />
          </linearGradient>

          {/* Outer shield border gradient */}
          <linearGradient id="shieldBorderGreen" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="60%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>

          {/* Glowing light green gradient for G */}
          <linearGradient id="shieldLetterG" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f0fdf4" />
            <stop offset="45%" stopColor="#6ee7b7" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>

          {glow && (
            <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          )}
        </defs>

        {/* Ambient backlight glow */}
        <path
          d="M 50 6 C 70 6 88 15 90 34 C 92 62 73 85 50 95 C 27 85 8 62 10 34 C 12 15 30 6 50 6 Z"
          fill="#10b981"
          fillOpacity={glow ? 0.18 : 0.08}
        />

        {/* Main Light Transparent Shield Body */}
        <path
          d="M 50 7 C 69 7 86 15 88 33 C 90 59 72 82 50 93 C 28 82 10 59 12 33 C 14 15 31 7 50 7 Z"
          fill="url(#shieldTransGreenFill)"
          stroke="url(#shieldBorderGreen)"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Inner subtle translucent highlight edge */}
        <path
          d="M 50 14 C 64 14 78 20 80 34 C 81 54 67 73 50 82 C 33 73 19 54 20 34 C 22 20 36 14 50 14 Z"
          fill="none"
          stroke="#a7f3d0"
          strokeWidth="1.5"
          strokeOpacity="0.4"
        />

        {/* The Letter "G" centered in the shield */}
        <text
          x="50"
          y="66"
          textAnchor="middle"
          fontFamily="'Plus Jakarta Sans', 'Arial Black', 'Cinzel', -apple-system, sans-serif"
          fontSize="44"
          fontWeight="900"
          letterSpacing="-1px"
          fill="url(#shieldLetterG)"
          filter={glow ? "url(#logoGlow)" : undefined}
        >
          G
        </text>
      </svg>
    </div>
  );
};

"use client";

import React from "react";

interface LogoProps {
  size?: number;
}

export default function Logo({ size = 50 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      {/* Outer Gold Gradient Definitions */}
      <defs>
        <linearGradient id="goldGradient" x1="0" y1="0" x2="500" y2="500" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFE875" />
          <stop offset="50%" stopColor="#D8B227" />
          <stop offset="100%" stopColor="#A6800B" />
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Main Black Circle Background */}
      <circle cx="250" cy="250" r="235" fill="#120924" stroke="url(#goldGradient)" strokeWidth="8" filter="url(#shadow)" />
      
      {/* Inner Ornamental Border Line */}
      <circle cx="250" cy="250" r="215" stroke="url(#goldGradient)" strokeWidth="3" strokeDasharray="6 4" fill="none" opacity="0.8" />
      <circle cx="250" cy="250" r="205" stroke="url(#goldGradient)" strokeWidth="2" fill="none" opacity="0.6" />

      {/* Decorative filigree flourishes (Top and Bottom) */}
      {/* Top Filigree */}
      <path
        d="M210 100 C230 80, 270 80, 290 100 C300 90, 310 90, 320 100 C310 110, 290 110, 275 105 C265 115, 235 115, 225 105 C210 110, 190 110, 180 100 C190 90, 200 90, 210 100 Z"
        fill="url(#goldGradient)"
        opacity="0.85"
      />
      <circle cx="250" cy="82" r="5" fill="url(#goldGradient)" />
      <path d="M250 68 L255 80 L250 85 L245 80 Z" fill="url(#goldGradient)" />

      {/* Bottom Filigree */}
      <path
        d="M210 400 C230 420, 270 420, 290 400 C300 410, 310 410, 320 400 C310 390, 290 390, 275 395 C265 385, 235 385, 225 395 C210 390, 190 390, 180 400 C190 410, 200 410, 210 400 Z"
        fill="url(#goldGradient)"
        opacity="0.85"
      />
      <circle cx="250" cy="418" r="5" fill="url(#goldGradient)" />
      <path d="M250 432 L255 420 L250 415 L245 420 Z" fill="url(#goldGradient)" />

      {/* Left Ornamental Flourish */}
      <path d="M85 240 C80 245, 80 255, 85 260 C90 255, 95 255, 100 260 Z" fill="url(#goldGradient)" opacity="0.7" />
      {/* Right Ornamental Flourish */}
      <path d="M415 240 C420 245, 420 255, 415 260 C410 255, 405 255, 400 260 Z" fill="url(#goldGradient)" opacity="0.7" />

      {/* Inner Decorative Circle */}
      <circle cx="250" cy="250" r="175" stroke="url(#goldGradient)" strokeWidth="4" fill="none" />

      {/* TEXT: SHUBH SAMBHRAM EVENTS */}
      <g id="brand-text">
        <text
          x="250"
          y="180"
          textAnchor="middle"
          fill="url(#goldGradient)"
          fontFamily="'Playfair Display', Georgia, serif"
          fontSize="50"
          fontWeight="bold"
          letterSpacing="6"
        >
          SHUBH
        </text>
        <text
          x="250"
          y="258"
          textAnchor="middle"
          fill="url(#goldGradient)"
          fontFamily="'Playfair Display', Georgia, serif"
          fontSize="44"
          fontWeight="bold"
          letterSpacing="4"
        >
          SAMBHRAM
        </text>
        <text
          x="250"
          y="330"
          textAnchor="middle"
          fill="url(#goldGradient)"
          fontFamily="'Playfair Display', Georgia, serif"
          fontSize="40"
          fontWeight="600"
          letterSpacing="8"
        >
          EVENTS
        </text>
      </g>
    </svg>
  );
}

'use client';

import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number;
}

export default function BrandLogo({ className = '', size = 48 }: BrandLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="gradBrand" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" />
          <stop offset="100%" stopColor="var(--color-primary-active)" />
        </linearGradient>
        <linearGradient id="gradAccent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-accent-blue)" />
          <stop offset="100%" stopColor="var(--color-link-teal)" />
        </linearGradient>
      </defs>
      
      {/* Funnel Shape */}
      <path d="M12 25 C35 15, 65 15, 88 25 L65 60 L65 85 C55 92, 45 92, 35 85 L35 60 Z" fill="url(#gradBrand)" />
      
      {/* Inner Depth */}
      <path d="M12 25 C35 35, 65 35, 88 25 C65 15, 35 15, 12 25 Z" fill="var(--color-surface-dark)" opacity="0.3" />
      
      {/* Causal Nodes */}
      <circle cx="25" cy="25" r="8" fill="url(#gradAccent)" stroke="var(--color-surface-card)" strokeWidth="2.5" />
      <circle cx="75" cy="25" r="8" fill="url(#gradAccent)" stroke="var(--color-surface-card)" strokeWidth="2.5" />
      <circle cx="50" cy="55" r="10" fill="var(--color-surface-card)" stroke="url(#gradAccent)" strokeWidth="4" />
      <circle cx="50" cy="82" r="6" fill="url(#gradAccent)" stroke="var(--color-surface-card)" strokeWidth="2" />
      
      {/* Data Flow Lines */}
      <path d="M30 30 L43 48" stroke="var(--color-surface-card)" strokeWidth="3.5" strokeLinecap="round" opacity="0.9" />
      <path d="M70 30 L57 48" stroke="var(--color-surface-card)" strokeWidth="3.5" strokeLinecap="round" opacity="0.9" />
      <path d="M50 65 L50 76" stroke="var(--color-surface-card)" strokeWidth="3.5" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
}

'use client';

import React from 'react';

type MascotType = 'logo' | 'scientist' | 'search' | 'empty' | 'error';

interface HedgehogMascotProps {
  type: MascotType;
  className?: string;
  size?: number;
}

export default function HedgehogMascot({ type, className = '', size = 48 }: HedgehogMascotProps) {
  // Let's create responsive SVG mascots using themed stroke and accent fills.
  // The outlines use `ink` (cream on dark, charcoal on light), spikes use `mute` or orange, details use `primary`.
  
  if (type === 'logo') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`text-ink ${className}`}
      >
        {/* Hedgehog Spikes */}
        <path d="M40 25 C25 25, 20 40, 20 50 C20 65, 30 75, 45 75" />
        <path d="M45 20 C30 20, 25 35, 25 50 C25 65, 35 70, 50 70" />
        <path d="M50 15 C35 15, 30 30, 30 45 C30 60, 40 65, 55 65" />
        <path d="M55 20 C45 20, 40 30, 40 45 C40 55, 48 60, 60 60" />
        
        {/* Face/Body */}
        <path d="M40 50 C40 68, 55 75, 75 70 C85 68, 90 60, 90 55 C90 50, 85 45, 75 45 C60 45, 40 45, 40 50 Z" fill="var(--color-surface-soft)" />
        
        {/* Cute snout/nose */}
        <circle cx="90" cy="55" r="4" fill="var(--color-ink)" />
        
        {/* Eye with glasses */}
        <circle cx="70" cy="52" r="5" stroke="var(--color-ink)" strokeWidth="3" />
        <line x1="75" y1="52" x2="82" y2="52" stroke="var(--color-ink)" strokeWidth="3" />
        <line x1="65" y1="52" x2="60" y2="50" stroke="var(--color-ink)" strokeWidth="2" />
        <circle cx="70" cy="52" r="1.5" fill="var(--color-ink)" />
        
        {/* Rosy cheek */}
        <ellipse cx="74" cy="60" rx="4" ry="2.5" fill="var(--color-primary)" opacity="0.8" stroke="none" />
      </svg>
    );
  }

  if (type === 'scientist') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`text-ink ${className}`}
      >
        {/* Spikes */}
        <path d="M20 60 C10 50, 10 30, 25 25 C35 20, 45 25, 45 25" />
        <path d="M25 70 C15 60, 15 40, 30 30 C45 20, 55 30, 55 30" />
        <path d="M30 80 C20 70, 20 50, 35 40 C50 30, 65 40, 65 40" />
        <path d="M35 90 C25 80, 25 60, 40 50 C55 40, 75 50, 75 50" />
        
        {/* Body / Coat */}
        <path d="M45 50 C45 50, 50 100, 80 100 C100 100, 105 80, 105 70 C105 60, 100 50, 75 50 C60 50, 45 50, 45 50 Z" fill="var(--color-surface-card)" />
        
        {/* Lab coat details */}
        <path d="M60 50 L60 80 L75 80" strokeWidth="2.5" />
        <path d="M50 65 L70 65" strokeWidth="2" />
        <path d="M65 50 L58 60" strokeWidth="2" />
        <path d="M65 50 L72 60" strokeWidth="2" />
        
        {/* Tiny pocket with pen */}
        <rect x="78" y="70" width="12" height="12" rx="2" fill="var(--color-surface-soft)" />
        <line x1="82" y1="66" x2="82" y2="72" stroke="var(--color-primary)" strokeWidth="3.5" />

        {/* Snout and Glasses */}
        <path d="M75 50 C80 50, 95 55, 105 60 C110 62, 112 66, 110 70 C105 74, 95 72, 85 70" fill="var(--color-surface-soft)" />
        <circle cx="110" cy="65" r="3" fill="var(--color-ink)" />
        <circle cx="92" cy="58" r="6" stroke="var(--color-ink)" strokeWidth="3" />
        <circle cx="92" cy="58" r="1.5" fill="var(--color-ink)" />
        
        {/* Holding a Science Flask */}
        <path d="M85 85 L95 85 L92 78 L92 74 L88 74 L88 78 Z" fill="var(--color-primary)" stroke="var(--color-ink)" strokeWidth="2.5" />
        <path d="M82 90 C84 90, 87 90, 88 87" strokeWidth="3" />
      </svg>
    );
  }

  if (type === 'search') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`text-ink ${className}`}
      >
        {/* Spikes */}
        <path d="M30 45 C15 45, 15 65, 25 75 C35 85, 50 85, 50 85" />
        <path d="M25 35 C10 35, 10 55, 20 65 C30 75, 45 75, 45 75" />
        <path d="M20 25 C8 25, 8 45, 18 55 C28 65, 40 65, 40 65" />
        
        {/* Detective Cap */}
        <path d="M38 35 C38 25, 75 22, 75 35 Z" fill="var(--color-surface-soft)" />
        <path d="M72 32 C82 32, 88 35, 92 38" strokeWidth="4" />
        
        {/* Face */}
        <path d="M42 45 C42 65, 60 75, 80 75 C95 75, 105 68, 105 60 C105 52, 95 45, 80 45 Z" fill="var(--color-surface-card)" />
        <circle cx="103" cy="58" r="3" fill="var(--color-ink)" />
        
        {/* Eye */}
        <circle cx="82" cy="52" r="5" stroke="var(--color-ink)" strokeWidth="2.5" />
        <circle cx="82" cy="52" r="1.5" fill="var(--color-ink)" />
        
        {/* Magnifying Glass */}
        <circle cx="88" cy="74" r="12" stroke="var(--color-primary)" strokeWidth="4.5" fill="none" />
        <line x1="78" y1="82" x2="66" y2="94" stroke="var(--color-ink)" strokeWidth="4.5" />
        <path d="M60 72 C63 75, 68 76, 72 74" strokeWidth="3" />
      </svg>
    );
  }

  if (type === 'empty') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`text-mute ${className}`}
      >
        {/* Sleeping Hedgehog */}
        {/* Spikes flattened/curved */}
        <path d="M20 70 C25 60, 35 55, 50 55 C65 55, 80 60, 85 70" />
        <path d="M15 75 C22 65, 32 60, 48 60 C64 60, 76 65, 82 75" />
        
        {/* Sleeping Face */}
        <path d="M40 70 C40 85, 85 85, 95 72 C90 70, 80 70, 75 70" fill="var(--color-surface-soft)" />
        
        {/* Closed Eye (Sleeping zZz) */}
        <path d="M72 74 Q76 78 80 74" fill="none" strokeWidth="2.5" />
        
        {/* Snout */}
        <circle cx="96" cy="72" r="2.5" fill="var(--color-ink)" />
        
        {/* zZz labels */}
        <path d="M92 40 L98 40 L92 46 L98 46" strokeWidth="2" opacity="0.6" />
        <path d="M102 24 L110 24 L102 32 L110 32" strokeWidth="2.5" opacity="0.8" />
      </svg>
    );
  }

  // default to error / alert
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`text-accent-red ${className}`}
    >
      {/* Shocked/Alert Hedgehog */}
      {/* Spikes very sharp and pointing outwards */}
      <path d="M30 45 L15 35 M25 55 L8 50 M32 65 L12 70 M38 75 L20 85" strokeWidth="4" />
      
      {/* Body */}
      <path d="M42 45 C42 65, 55 82, 75 82 C90 82, 100 72, 100 60 C100 48, 85 42, 75 42 Z" fill="var(--color-surface-card)" />
      
      {/* Shocked Wide Eye */}
      <circle cx="78" cy="55" r="7" fill="none" strokeWidth="3" />
      <circle cx="78" cy="55" r="2" fill="currentColor" />
      
      {/* Open Mouth */}
      <circle cx="90" cy="68" r="4.5" fill="var(--color-ink)" />
      
      {/* Warning Sign bubble */}
      <path d="M95 25 L108 45 L82 45 Z" fill="var(--color-accent-red-soft)" stroke="var(--color-accent-red)" strokeWidth="2.5" />
      <line x1="95" y1="31" x2="95" y2="37" stroke="var(--color-accent-red)" strokeWidth="3" />
      <circle cx="95" cy="41" r="1.5" fill="var(--color-accent-red)" stroke="none" />
    </svg>
  );
}

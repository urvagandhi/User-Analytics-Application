'use client';

import React, { useRef, useEffect } from 'react';
import { HeatmapPoint } from '@causal-funnel/shared';

interface HeatmapCanvasProps {
  points: HeatmapPoint[];
  isLoading: boolean;
  theme?: 'light' | 'dark';
  mode?: 'clicks' | 'scroll';
  scrollDistribution?: {
    0: number;
    25: number;
    50: number;
    75: number;
    100: number;
  };
}

export default function HeatmapCanvas({
  points,
  isLoading,
  theme = 'dark',
  mode = 'clicks',
  scrollDistribution,
}: HeatmapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let animationFrameId: number;
    let width = container.clientWidth;
    let height = 600; // Fixed canvas height

    // Handle canvas resolution for HighDPI/Retina screens
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Create gradient color lookup table (0-255 opacity mapping)
    const colorPaletteCanvas = document.createElement('canvas');
    colorPaletteCanvas.width = 256;
    colorPaletteCanvas.height = 1;
    const paletteCtx = colorPaletteCanvas.getContext('2d')!;
    const gradient = paletteCtx.createLinearGradient(0, 0, 256, 0);
    
    // Smooth cold-to-hot transition
    gradient.addColorStop(0.0, 'rgba(0, 0, 255, 0.0)');
    gradient.addColorStop(0.2, 'rgba(0, 0, 255, 0.2)');
    gradient.addColorStop(0.4, 'rgba(0, 255, 255, 0.6)');
    gradient.addColorStop(0.6, 'rgba(0, 255, 0, 0.7)');
    gradient.addColorStop(0.8, 'rgba(255, 255, 0, 0.8)');
    gradient.addColorStop(1.0, 'rgba(255, 0, 0, 0.9)');
    
    paletteCtx.fillStyle = gradient;
    paletteCtx.fillRect(0, 0, 256, 1);
    const colorPalette = paletteCtx.getImageData(0, 0, 256, 1).data;

    const render = () => {
      // 1. Clear main canvas
      ctx.clearRect(0, 0, width, height);

      // 2. Draw mock web page wireframe blueprint to give context to clicks
      drawMockWebPage(ctx, width, height, theme);

      if (mode === 'scroll') {
        return;
      }

      if (points.length === 0) {
        ctx.fillStyle = theme === 'dark' ? 'rgba(238, 239, 233, 0.4)' : 'rgba(35, 37, 29, 0.4)';
        ctx.font = '13px "IBM Plex Sans", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('No interaction telemetry coordinates stored for this route.', width / 2, height / 2);
        return;
      }

      // 3. Render alpha mask on an offscreen buffer canvas to compute overlay overlaps
      const alphaCanvas = document.createElement('canvas');
      alphaCanvas.width = width;
      alphaCanvas.height = height;
      const alphaCtx = alphaCanvas.getContext('2d')!;
      alphaCtx.clearRect(0, 0, width, height);

      const radius = 25; // Radius of influence of each click

      points.forEach((point) => {
        // Project percentage coordinate to absolute canvas pixel size
        const pxX = (point.xPct / 100) * width;
        const pxY = (point.yPct / 100) * height;

        // Draw radial black gradient (Alpha accumulator)
        const radGrad = alphaCtx.createRadialGradient(pxX, pxY, 1, pxX, pxY, radius);
        radGrad.addColorStop(0, 'rgba(0, 0, 0, 1.0)'); // Dark center
        radGrad.addColorStop(1, 'rgba(0, 0, 0, 0.0)'); // Fades to edge
        
        alphaCtx.fillStyle = radGrad;
        alphaCtx.beginPath();
        alphaCtx.arc(pxX, pxY, radius, 0, Math.PI * 2);
        alphaCtx.fill();
      });

      // 4. Colorize alpha mask using our color palette lookup table
      const maskData = alphaCtx.getImageData(0, 0, width, height);
      const maskPixels = maskData.data;

      for (let i = 3; i < maskPixels.length; i += 4) {
        const alpha = maskPixels[i]; // Value between 0 and 255
        
        // Map alpha scale to gradient array index
        const colorOffset = alpha * 4;

        if (alpha > 0) {
          maskPixels[i - 3] = colorPalette[colorOffset];     // Red
          maskPixels[i - 2] = colorPalette[colorOffset + 1]; // Green
          maskPixels[i - 1] = colorPalette[colorOffset + 2]; // Blue
          maskPixels[i] = colorPalette[colorOffset + 3];     // Colorized Alpha
        }
      }

      // Put colorized pixel array back to offscreen canvas
      alphaCtx.putImageData(maskData, 0, 0);

      // Draw offscreen colorized canvas onto the main display
      ctx.drawImage(alphaCanvas, 0, 0);
    };

    // Resizing implementation
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        width = entry.contentRect.width;
        
        const currentDpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
        canvas.width = width * currentDpr;
        canvas.height = height * currentDpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        
        const newCtx = canvas.getContext('2d')!;
        newCtx.scale(currentDpr, currentDpr);
        
        // Trigger repaint inside frame
        animationFrameId = requestAnimationFrame(render);
      }
    });

    resizeObserver.observe(container);
    animationFrameId = requestAnimationFrame(render);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [points, theme, mode]);

  // Helper method to draw a blueprint layout of a web page
  const drawMockWebPage = (ctx: CanvasRenderingContext2D, width: number, height: number, theme: 'light' | 'dark') => {
    const isDark = theme === 'dark';
    
    // Choose colors based on theme variables
    const strokeColor = isDark ? 'rgba(56, 58, 48, 0.6)' : 'rgba(191, 193, 183, 0.6)';
    const gridColor = isDark ? 'rgba(56, 58, 48, 0.15)' : 'rgba(191, 193, 183, 0.15)';
    const fillSoft = isDark ? 'rgba(35, 37, 29, 0.5)' : 'rgba(229, 231, 224, 0.5)';
    const fillCard = isDark ? 'rgba(24, 25, 18, 0.8)' : 'rgba(255, 255, 255, 0.8)';
    const accentFill = 'rgba(247, 165, 1, 0.12)'; // Orange brand highlight
    const accentStroke = 'rgba(247, 165, 1, 0.4)';
    const textColor = isDark ? 'rgba(238, 239, 233, 0.15)' : 'rgba(35, 37, 29, 0.15)';

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;

    // Grid lines background (PostHog sketchbook layout)
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.strokeStyle = strokeColor;

    // Mock Navigation Bar
    ctx.fillStyle = fillSoft;
    ctx.fillRect(0, 0, width, 60);
    ctx.beginPath();
    ctx.moveTo(0, 60);
    ctx.lineTo(width, 60);
    ctx.stroke();

    // Mock Logo
    ctx.fillStyle = textColor;
    ctx.fillRect(20, 22, 90, 16);

    // Mock Nav Links
    ctx.fillRect(width - 240, 24, 50, 12);
    ctx.fillRect(width - 160, 24, 50, 12);
    
    // Mock Primary CTA Button
    ctx.fillStyle = isDark ? 'rgba(247, 165, 1, 0.2)' : 'rgba(247, 165, 1, 0.9)';
    ctx.fillRect(width - 80, 18, 60, 24);
    ctx.strokeRect(width - 80, 18, 60, 24);

    // Mock Header Section
    ctx.fillStyle = fillSoft;
    ctx.fillRect(40, 90, width - 80, 140);
    ctx.strokeRect(40, 90, width - 80, 140);

    // Mock Header Text
    ctx.fillStyle = textColor;
    ctx.fillRect(60, 110, width - 120, 22);
    ctx.fillRect(60, 145, width - 320, 12);
    
    // Mock Orange Button
    ctx.fillStyle = accentFill;
    ctx.strokeStyle = accentStroke;
    ctx.fillRect(60, 175, 110, 30);
    ctx.strokeRect(60, 175, 110, 30);

    ctx.strokeStyle = strokeColor;

    // Mock Columns
    const colWidth = (width - 100) / 3;
    for (let i = 0; i < 3; i++) {
      const colX = 40 + i * (colWidth + 10);
      ctx.fillStyle = fillCard;
      ctx.fillRect(colX, 260, colWidth, 220);
      ctx.strokeRect(colX, 260, colWidth, 220);

      // Card Content placeholders
      ctx.fillStyle = fillSoft;
      ctx.fillRect(colX + 15, 275, colWidth - 30, 80);
      ctx.fillStyle = textColor;
      ctx.fillRect(colX + 15, 375, colWidth - 60, 14);
      ctx.fillRect(colX + 15, 400, colWidth - 30, 10);
      ctx.fillRect(colX + 15, 420, colWidth - 30, 10);
    }

    // Mock Footer
    ctx.fillStyle = fillSoft;
    ctx.fillRect(0, 520, width, 80);
    ctx.beginPath();
    ctx.moveTo(0, 520);
    ctx.lineTo(width, 520);
    ctx.stroke();
  };

  return (
    <div ref={containerRef} className="w-full relative rounded-md border border-hairline bg-surface-card overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-canvas/80 backdrop-blur-xs flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-mute font-mono">Normalizing telemetry coordinates...</span>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="block cursor-crosshair" />
      
      {/* Scroll Overlay Bands */}
      {mode === 'scroll' && scrollDistribution && (
        <div className="absolute inset-0 flex flex-col select-none">
          {([0, 25, 50, 75, 100] as const).map((m) => {
            const pct = scrollDistribution[m] ?? 0;
            // Map reach percentage to dynamic opacity (0.05 to 0.45 range)
            const opacity = 0.05 + (pct / 100) * 0.4;
            const bandStyle = {
              background: `linear-gradient(180deg, hsla(142, 72%, 35%, ${opacity}) 0%, hsla(142, 72%, 27%, ${opacity}) 100%)`,
              borderBottom: m !== 100 ? `1px dashed hsla(142, 72%, 35%, ${Math.max(0.15, opacity)})` : 'none',
            };

            return (
              <div
                key={m}
                className="flex-1 flex flex-col justify-center px-6 relative transition-all duration-300 hover:bg-emerald-500/10 cursor-pointer group/band"
                style={bandStyle}
              >
                {/* Left milestone indicator */}
                <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-ink bg-surface-card/75 backdrop-blur-xs px-2 py-0.5 rounded border border-hairline transition-all group-hover/band:border-emerald-500/50">
                    {m}%
                  </span>
                </div>

                {/* Right stats indicator */}
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-end">
                  <span className="text-xs font-bold text-ink uppercase tracking-wider">
                    Reached by {pct}% of sessions
                  </span>
                  <span className="text-[9px] text-mute font-mono">
                    {m === 0 ? 'fold (above fold)' : m === 100 ? 'footer (full read)' : `depth ${m}%`}
                  </span>
                </div>

                {/* Nice glassmorphic background highlight on hover */}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/band:opacity-100 transition-opacity pointer-events-none" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

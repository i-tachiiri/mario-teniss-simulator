import type { PixelPos } from '../types';

export function controlPointForBend(start: PixelPos, end: PixelPos, bendLevel = 0): PixelPos {
  const mx = (start.x + end.x) / 2;
  const my = (start.y + end.y) / 2;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy) || 1;
  const nx = -dy / length;
  const ny = dx / length;
  const bendPx = Math.max(-80, Math.min(80, bendLevel * 0.1 * length));
  return { x: mx + nx * bendPx, y: my + ny * bendPx };
}

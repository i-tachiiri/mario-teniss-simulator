import type { PixelPos } from '../../domain/types';

export function normalize(dx: number, dy: number): PixelPos | null {
  const len = Math.hypot(dx, dy);
  if (len < 1e-6) return null;
  return { x: dx / len, y: dy / len };
}

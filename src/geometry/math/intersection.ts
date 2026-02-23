import type { PixelPos } from '../../types';
import { normalize } from './vector';

export function computeEndpointToCourtEdge(
  from: PixelPos,
  toward: PixelPos,
  containerSize?: { width: number; height: number },
): PixelPos | null {
  const n = normalize(toward.x - from.x, toward.y - from.y);
  if (!n) return null;

  if (!containerSize) {
    return { x: from.x + n.x * 1000, y: from.y + n.y * 1000 };
  }

  const { width: W, height: H } = containerSize;
  let t = Infinity;
  if (n.x > 0) t = Math.min(t, (W - from.x) / n.x);
  else if (n.x < 0) t = Math.min(t, -from.x / n.x);
  if (n.y > 0) t = Math.min(t, (H - from.y) / n.y);
  else if (n.y < 0) t = Math.min(t, -from.y / n.y);

  if (!isFinite(t) || t <= 0) return null;
  return { x: from.x + n.x * t, y: from.y + n.y * t };
}

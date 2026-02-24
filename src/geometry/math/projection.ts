import type { PixelPos } from '../../domain/types';

export function projectToRayFromBounce(
  hitFrom: PixelPos,
  bounceAt: PixelPos,
  iconX: number,
  iconY: number,
): PixelPos {
  const dx = bounceAt.x - hitFrom.x;
  const dy = bounceAt.y - hitFrom.y;
  const len = Math.hypot(dx, dy);

  let cutX = iconX;
  let cutY = iconY;

  if (len > 0) {
    const nx = dx / len;
    const ny = dy / len;
    const t = Math.max(0, (iconX - bounceAt.x) * nx + (iconY - bounceAt.y) * ny);
    cutX = bounceAt.x + t * nx;
    cutY = bounceAt.y + t * ny;
  }

  return { x: cutX, y: cutY };
}

import type { PixelPos } from '../../types';
import { normalize } from '../math/vector';

function computeQuadraticSegmentD(
  start: PixelPos,
  end: PixelPos,
  bendPx: number,
  bendDir: 1 | -1,
): string {
  const n = normalize(end.x - start.x, end.y - start.y);
  if (!n || Math.abs(bendPx) < 0.01) {
    return `L ${end.x} ${end.y}`;
  }

  const px = -n.y;
  const py = n.x;
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  const ctrlX = midX + px * bendPx * bendDir;
  const ctrlY = midY + py * bendPx * bendDir;
  return `Q ${ctrlX} ${ctrlY} ${end.x} ${end.y}`;
}

export function pointsToPathD(params: {
  hitFromPx: PixelPos;
  bouncePx: PixelPos;
  returnPx: PixelPos;
  bend1?: number;
  bend2?: number;
  bendDir1?: 1 | -1;
  bendDir2?: 1 | -1;
}): string {
  const {
    hitFromPx,
    bouncePx,
    returnPx,
    bend1 = 0,
    bend2 = 0,
    bendDir1 = 1,
    bendDir2 = 1,
  } = params;

  return [
    `M ${hitFromPx.x} ${hitFromPx.y}`,
    computeQuadraticSegmentD(hitFromPx, bouncePx, bend1, bendDir1),
    computeQuadraticSegmentD(bouncePx, returnPx, bend2, bendDir2),
  ].join(' ');
}

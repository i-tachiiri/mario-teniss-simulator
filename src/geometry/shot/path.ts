import type { PixelPos, ShotStep } from '../../types';
import { normalize } from '../math/vector';
import { computeExtensionEndpoint } from './extension';

function computePointByDistance(from: PixelPos, toward: PixelPos, dist: number): PixelPos | null {
  const n = normalize(toward.x - from.x, toward.y - from.y);
  if (!n) return null;
  return { x: from.x + n.x * dist, y: from.y + n.y * dist };
}

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

export function computeShotPathD(params: {
  hitFrom: PixelPos;
  bounce1: PixelPos;
  returnAt: PixelPos;
  isDropLike: boolean;
  isJumpLike: boolean;
  containerSize?: { width: number; height: number };
  bend1?: number;
  bend2?: number;
  bendDir1?: 1 | -1;
  bendDir2?: 1 | -1;
}): { pathD: string; secondBounceAt?: PixelPos } {
  const {
    hitFrom,
    bounce1,
    returnAt,
    isDropLike,
    isJumpLike,
    containerSize,
    bend1 = 0,
    bend2 = 0,
    bendDir1 = 1,
    bendDir2 = 1,
  } = params;

  const cellSize = containerSize ? containerSize.width / 6 : 50;
  const shortDist = isDropLike ? cellSize : isJumpLike ? cellSize * 3 : null;

  let end2 = computeExtensionEndpoint(bounce1, returnAt, containerSize) ?? returnAt;
  let secondBounceAt: PixelPos | undefined;

  if (shortDist !== null) {
    const shortEnd = computePointByDistance(bounce1, returnAt, shortDist);
    const second = computePointByDistance(bounce1, returnAt, shortDist * 0.6);
    if (shortEnd) end2 = shortEnd;
    if (second) secondBounceAt = second;
  }

  const d = [
    `M ${hitFrom.x} ${hitFrom.y}`,
    computeQuadraticSegmentD(hitFrom, bounce1, bend1, bendDir1),
    computeQuadraticSegmentD(bounce1, end2, bend2, bendDir2),
  ].join(' ');

  return { pathD: d, secondBounceAt };
}

export function computeBallPathD(
  hitFrom: PixelPos,
  bounceAt: PixelPos,
  endAt: PixelPos,
  curveAmount: number,
): string {
  return computeShotPathD({
    hitFrom,
    bounce1: bounceAt,
    returnAt: endAt,
    isDropLike: false,
    isJumpLike: false,
    bend1: curveAmount,
    bend2: curveAmount,
  }).pathD;
}

export function computeSceneVisual(params: {
  hitFrom: PixelPos;
  bounce1: PixelPos;
  returnAt: PixelPos;
  type: ShotStep['type'];
  curveLevel: number;
  baseCurve: number;
  containerSize?: { width: number; height: number };
}): { pathD: string; secondBounceAt?: PixelPos } {
  const { hitFrom, bounce1, returnAt, type, curveLevel, baseCurve, containerSize } = params;
  const signedCurve = baseCurve + curveLevel * 16;
  const curve = Math.abs(signedCurve);
  const curveDir: 1 | -1 = signedCurve >= 0 ? 1 : -1;

  return computeShotPathD({
    hitFrom,
    bounce1,
    returnAt,
    isDropLike: type === 'drop',
    isJumpLike: type === 'jump',
    containerSize,
    bend1: curve,
    bend2: curve,
    bendDir1: curveDir,
    bendDir2: curveDir,
  });
}

import type { PixelPos, ShotType } from '../../domain/types';
import { normalize } from '../math/vector';
import { pointsToPathD } from '../path/pointsToPathD';
import { buildShotPoints } from './buildShotPoints';

/**
 * segment 1 のバウンド到着タンジェント方向を計算する。
 * quadratic Bezier の終端タンジェント = bounce - ctrl1
 */
function computeArrivalDir(
  hitFrom: PixelPos,
  bounce: PixelPos,
  bend: number,
  bendDir: 1 | -1,
): PixelPos | undefined {
  if (Math.abs(bend) < 0.01) return undefined;
  const n = normalize(bounce.x - hitFrom.x, bounce.y - hitFrom.y);
  if (!n) return undefined;
  const len = Math.hypot(bounce.x - hitFrom.x, bounce.y - hitFrom.y);
  const scale = bend * Math.min(1.5, Math.max(0.35, len / 200));
  const ctrl1x = (hitFrom.x + bounce.x) / 2 + (-n.y) * scale * bendDir;
  const ctrl1y = (hitFrom.y + bounce.y) / 2 + n.x * scale * bendDir;
  return { x: bounce.x - ctrl1x, y: bounce.y - ctrl1y };
}

export interface ShotVisualPath {
  d: string;
  markers: PixelPos[];
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
}): ShotVisualPath {
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

  const arrivalDir = computeArrivalDir(hitFrom, bounce1, bend1, bendDir1);

  const points = buildShotPoints({
    hitFromPx: hitFrom,
    bouncePx: bounce1,
    returnPx: returnAt,
    isDropLike,
    isJumpLike,
    containerSize,
    arrivalDir,
  });

  return {
    d: pointsToPathD({
      hitFromPx: points.hitFromPx,
      bouncePx: points.bouncePx,
      returnPx: points.returnPx,
      bend1,
      bend2,
      bendDir1,
      bendDir2,
    }),
    markers: points.markers,
  };
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
  }).d;
}

export function computeSceneVisual(params: {
  hitFrom: PixelPos;
  bounce1: PixelPos;
  returnAt: PixelPos;
  type: ShotType;
  bendLevel: number;
  baseCurve: number;
  containerSize?: { width: number; height: number };
}): ShotVisualPath {
  const { hitFrom, bounce1, returnAt, type, bendLevel, baseCurve, containerSize } = params;
  const signedCurve = baseCurve + bendLevel * 24;
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
    bend2: 0,
    bendDir1: curveDir,
    bendDir2: 1,
  });
}

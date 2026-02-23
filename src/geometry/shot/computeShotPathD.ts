import type { PixelPos, ShotStep } from '../../types';
import { pointsToPathD } from '../path/pointsToPathD';
import { buildShotPoints } from './buildShotPoints';

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

  const points = buildShotPoints({
    hitFromPx: hitFrom,
    bouncePx: bounce1,
    returnPx: returnAt,
    isDropLike,
    isJumpLike,
    containerSize,
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
  type: ShotStep['type'];
  bendLevel: number;
  baseCurve: number;
  containerSize?: { width: number; height: number };
}): ShotVisualPath {
  const { hitFrom, bounce1, returnAt, type, bendLevel, baseCurve, containerSize } = params;
  const signedCurve = baseCurve + bendLevel * 16;
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

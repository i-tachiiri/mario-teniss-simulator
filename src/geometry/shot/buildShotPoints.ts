import type { PixelPos } from '../../types';
import { normalize } from '../math/vector';
import { computeExtensionEndpoint } from './extension';

function computePointByDistance(from: PixelPos, toward: PixelPos, dist: number): PixelPos | null {
  const n = normalize(toward.x - from.x, toward.y - from.y);
  if (!n) return null;
  return { x: from.x + n.x * dist, y: from.y + n.y * dist };
}

export function buildShotPoints(params: {
  hitFromPx: PixelPos;
  bouncePx: PixelPos;
  returnPx: PixelPos;
  isDropLike: boolean;
  isJumpLike: boolean;
  containerSize?: { width: number; height: number };
}): { hitFromPx: PixelPos; bouncePx: PixelPos; returnPx: PixelPos; markers: PixelPos[] } {
  const { hitFromPx, bouncePx, returnPx, isDropLike, isJumpLike, containerSize } = params;

  const cellSize = containerSize ? containerSize.width / 6 : 50;
  const shortDist = isDropLike ? cellSize : isJumpLike ? cellSize * 3 : null;

  let endPx = computeExtensionEndpoint(bouncePx, returnPx, containerSize) ?? returnPx;
  const markers: PixelPos[] = [bouncePx];

  if (shortDist !== null) {
    const shortEnd = computePointByDistance(bouncePx, returnPx, shortDist);
    const second = computePointByDistance(bouncePx, returnPx, shortDist);
    if (shortEnd) endPx = shortEnd;
    if (second) markers.push(second);
  }

  return {
    hitFromPx,
    bouncePx,
    returnPx: endPx,
    markers,
  };
}

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

  const cellPx = containerSize ? containerSize.width / 6 : 60;
  const shortDist = isDropLike ? cellPx : isJumpLike ? cellPx * 3 : null;

  if (shortDist !== null) {
    const fallbackToward = { x: bouncePx.x + 1, y: bouncePx.y };
    const bounce2Px =
      computePointByDistance(bouncePx, returnPx, shortDist) ??
      computePointByDistance(bouncePx, hitFromPx, -shortDist) ??
      computePointByDistance(bouncePx, fallbackToward, shortDist) ??
      bouncePx;

    return {
      hitFromPx,
      bouncePx,
      returnPx: bounce2Px,
      markers: [bouncePx, bounce2Px],
    };
  }

  const endPx = computeExtensionEndpoint(bouncePx, returnPx, containerSize) ?? returnPx;

  return {
    hitFromPx,
    bouncePx,
    returnPx: endPx,
    markers: [bouncePx],
  };
}

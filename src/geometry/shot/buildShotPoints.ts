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
      const shortDist = isDropLike ? cellPx : isJumpLike ? cellPx * 3 : cellPx * 5;

  // returnPx と bouncePx が同じ（draggingTo=null のプレビュー中）か確認
  const returnIsSameBounce =
          Math.abs(returnPx.x - bouncePx.x) < 1 && Math.abs(returnPx.y - bouncePx.y) < 1;

  if (returnIsSameBounce) {
          // プレビュー中でreturnAtが未確定の場合: 2バウンド目を表示しない
        const endPx = computeExtensionEndpoint(bouncePx, returnPx, containerSize) ?? returnPx;
          return {
                    hitFromPx,
                    bouncePx,
                    returnPx: endPx,
                    markers: [bouncePx],
          };
  }

  // returnPxが確定している場合: returnPx方向にshortDist進んだ点を2バウンド目とする
  const fallbackToward = { x: bouncePx.x + 1, y: bouncePx.y };
      const bounce2Px =
              computePointByDistance(bouncePx, returnPx, shortDist) ??
              computePointByDistance(bouncePx, fallbackToward, shortDist) ??
              bouncePx;

  const endPx = computeExtensionEndpoint(bouncePx, returnPx, containerSize) ?? returnPx;

  return {
          hitFromPx,
          bouncePx,
          returnPx: isDropLike || isJumpLike ? bounce2Px : endPx,
          markers: [bouncePx, bounce2Px],
  };
}

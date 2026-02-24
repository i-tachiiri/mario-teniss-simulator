import type { PixelPos } from '../../domain/types';
import { normalize } from '../math/vector';
import { computeEndpointToCourtEdge as computeExtensionEndpoint } from '../math/intersection';
import { ICON_HALF_SIZE } from '../../config';

function computePointByDistance(from: PixelPos, toward: PixelPos, dist: number): PixelPos | null {
      const n = normalize(toward.x - from.x, toward.y - from.y);
      if (!n) return null;
      return { x: from.x + n.x * dist, y: from.y + n.y * dist };
}

/**
 * 正規化済み方向 dir の射線（origin から出発）がアイコン円（center, radius）と
 * 交差する最初の点を返す。交差しない場合は null。
 */
function intersectRayCircle(
  origin: PixelPos,
  dir: { x: number; y: number },
  center: PixelPos,
  radius: number,
): PixelPos | null {
  const ocx = origin.x - center.x;
  const ocy = origin.y - center.y;
  const b = 2 * (ocx * dir.x + ocy * dir.y);
  const c = ocx * ocx + ocy * ocy - radius * radius;
  const disc = b * b - 4 * c; // a=1 (dir は正規化済み)
  if (disc < 0) return null;
  const sqrtDisc = Math.sqrt(disc);
  const t1 = (-b - sqrtDisc) / 2;
  const t2 = (-b + sqrtDisc) / 2;
  // origin が円の内側（t1 ≤ 0）の場合は脱出点 t2 を使用
  const t = t1 > 0 ? t1 : t2;
  if (t <= 0) return null;
  return { x: origin.x + dir.x * t, y: origin.y + dir.y * t };
}

export function buildShotPoints(params: {
      hitFromPx: PixelPos;
      bouncePx: PixelPos;
      returnPx: PixelPos;
      isDropLike: boolean;
      isJumpLike: boolean;
      containerSize?: { width: number; height: number };
      /** segment 1 のバウンド到着タンジェント方向。省略時は hitFrom→bounce を使用 */
      arrivalDir?: PixelPos;
}): { hitFromPx: PixelPos; bouncePx: PixelPos; returnPx: PixelPos; markers: PixelPos[] } {
      const { hitFromPx, bouncePx, returnPx, isDropLike, isJumpLike, containerSize, arrivalDir } = params;
      const cellPx = containerSize ? containerSize.width / 6 : 60;
      const shortDist = isDropLike ? cellPx : isJumpLike ? cellPx * 3 : cellPx * 5;

  // returnPx と bouncePx が同じ（draggingTo=null のプレビュー中）か確認
  const returnIsSameBounce =
          Math.abs(returnPx.x - bouncePx.x) < 1 && Math.abs(returnPx.y - bouncePx.y) < 1;

  if (returnIsSameBounce) {
    // returnAtが未確定（ドラッグなし）の場合: 到着タンジェント方向（または hitFrom→bounce）に延長
    const extendToward = arrivalDir
      ? { x: bouncePx.x + arrivalDir.x, y: bouncePx.y + arrivalDir.y }
      : { x: bouncePx.x * 2 - hitFromPx.x, y: bouncePx.y * 2 - hitFromPx.y };
    const fallbackToward = { x: bouncePx.x + 1, y: bouncePx.y };

    if (isDropLike || isJumpLike) {
      const bounce2Px =
        computePointByDistance(bouncePx, extendToward, shortDist) ??
        computePointByDistance(bouncePx, fallbackToward, shortDist) ??
        bouncePx;
      return { hitFromPx, bouncePx, returnPx: bounce2Px, markers: [bouncePx, bounce2Px] };
    }

    const endPx =
      computeExtensionEndpoint(bouncePx, extendToward, containerSize) ??
      computeExtensionEndpoint(bouncePx, fallbackToward, containerSize) ??
      returnPx;
    return { hitFromPx, bouncePx, returnPx: endPx, markers: [bouncePx] };
  }

  // returnPxが確定している場合: 軌道方向はそのまま、アイコンと交差すれば縁で止める
  const extendDir = arrivalDir
    ? { x: bouncePx.x + arrivalDir.x, y: bouncePx.y + arrivalDir.y }
    : { x: bouncePx.x * 2 - hitFromPx.x, y: bouncePx.y * 2 - hitFromPx.y };
  const fallbackToward = { x: bouncePx.x + 1, y: bouncePx.y };
  const bounce2Px =
    computePointByDistance(bouncePx, extendDir, shortDist) ??
    computePointByDistance(bouncePx, fallbackToward, shortDist) ??
    bouncePx;

  // 軌道がアイコン円と交差する場合はその縁で止め、交差しない場合はコート端まで延長
  const rayDir = normalize(extendDir.x - bouncePx.x, extendDir.y - bouncePx.y);
  const iconHit = rayDir
    ? intersectRayCircle(bouncePx, rayDir, returnPx, ICON_HALF_SIZE)
    : null;
  const endPx =
    iconHit ??
    computeExtensionEndpoint(bouncePx, extendDir, containerSize) ??
    returnPx;

  return {
    hitFromPx,
    bouncePx,
    returnPx: isDropLike || isJumpLike ? bounce2Px : endPx,
    markers: [bouncePx, bounce2Px],
  };
}

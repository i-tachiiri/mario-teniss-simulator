import type { Position, PixelPos, ShotStep } from '../types';

function normalize(dx: number, dy: number): PixelPos | null {
  const len = Math.hypot(dx, dy);
  if (len < 1e-6) return null;
  return { x: dx / len, y: dy / len };
}

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

  let end2 = computeEndpointToCourtEdge(bounce1, returnAt, containerSize) ?? returnAt;
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

export function getHitFrom(
  rallySteps: ShotStep[],
  activeSide: 'top' | 'bottom',
  p1Pos: Position | null,
  p2Pos: Position | null,
): PixelPos {
  const findInBottom = activeSide === 'top';

  for (let i = rallySteps.length - 1; i >= 0; i--) {
    const shot = rallySteps[i];
    const bouncedInBottom = shot.bounceAt.r >= 5;
    if (findInBottom && bouncedInBottom) return shot.returnAt;
    if (!findInBottom && !bouncedInBottom) return shot.returnAt;
  }

  const fallback = findInBottom ? p1Pos : p2Pos;
  return fallback ?? { x: 0, y: 0 };
}

export function computeReturnAndSide(
  hitFrom: PixelPos,
  bounceAt: Position,
  iconX: number,
  iconY: number,
  activeSide: 'top' | 'bottom',
): { returnAt: PixelPos; shotSide: 'forehand' | 'backhand' } {
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

  const shotSide: 'forehand' | 'backhand' =
    activeSide === 'bottom'
      ? cutX >= iconX ? 'forehand' : 'backhand'
      : cutX <= iconX ? 'forehand' : 'backhand';

  return { returnAt: { x: cutX, y: cutY }, shotSide };
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

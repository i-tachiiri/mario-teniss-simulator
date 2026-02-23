import type { Position, PixelPos, ShotStep } from '../types';

export function computeBallPathD(
  hitFrom: PixelPos,
  bounceAt: Position,
  endAt: PixelPos,
  curveAmount: number,
): string {
  const firstLen = Math.hypot(bounceAt.x - hitFrom.x, bounceAt.y - hitFrom.y);
  const secondLen = Math.hypot(endAt.x - bounceAt.x, endAt.y - bounceAt.y);

  if (firstLen < 1 || secondLen < 1) {
    return `M ${hitFrom.x} ${hitFrom.y} L ${bounceAt.x} ${bounceAt.y} L ${endAt.x} ${endAt.y}`;
  }

  const m1x = (hitFrom.x + bounceAt.x) / 2;
  const m1y = (hitFrom.y + bounceAt.y) / 2;
  const m2x = (bounceAt.x + endAt.x) / 2;
  const m2y = (bounceAt.y + endAt.y) / 2;

  const n1x = -(bounceAt.y - hitFrom.y) / firstLen;
  const n1y = (bounceAt.x - hitFrom.x) / firstLen;
  const n2x = -(endAt.y - bounceAt.y) / secondLen;
  const n2y = (endAt.x - bounceAt.x) / secondLen;

  const c1x = m1x + n1x * curveAmount;
  const c1y = m1y + n1y * curveAmount;
  const c2x = m2x + n2x * curveAmount;
  const c2y = m2y + n2y * curveAmount;

  return `M ${hitFrom.x} ${hitFrom.y} Q ${c1x} ${c1y} ${bounceAt.x} ${bounceAt.y} Q ${c2x} ${c2y} ${endAt.x} ${endAt.y}`;
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

export function computeExtensionEndpoint(
  from: PixelPos,
  bounceAt: PixelPos,
  isShortShot: boolean,
  containerSize?: { width: number; height: number },
): PixelPos | null {
  const dx = bounceAt.x - from.x;
  const dy = bounceAt.y - from.y;
  const len = Math.hypot(dx, dy);
  if (len === 0) return null;

  const nx = dx / len;
  const ny = dy / len;
  const { x: bx, y: by } = bounceAt;

  if (isShortShot) return { x: bx + nx * 60, y: by + ny * 60 };

  if (containerSize) {
    const { width: W, height: H } = containerSize;
    let t = Infinity;
    if (nx > 0) t = Math.min(t, (W - bx) / nx);
    else if (nx < 0) t = Math.min(t, -bx / nx);
    if (ny > 0) t = Math.min(t, (H - by) / ny);
    else if (ny < 0) t = Math.min(t, -by / ny);
    return { x: bx + (isFinite(t) ? t : 0) * nx, y: by + (isFinite(t) ? t : 0) * ny };
  }

  return { x: bx + nx * 1000, y: by + ny * 1000 };
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

export function computeSceneVisual(
  shot: Pick<ShotStep, 'hitFrom' | 'bounceAt' | 'returnAt' | 'type' | 'curveLevel'>,
  baseCurve: number,
  containerSize?: { width: number; height: number },
): { pathD: string; secondBounceAt?: PixelPos } {
  const cellSize = containerSize ? containerSize.width / 6 : 50;
  const shortDistance = shot.type === 'drop' ? cellSize : shot.type === 'jump' ? cellSize * 3 : null;

  let endAt: PixelPos = shot.returnAt;
  let secondBounceAt: PixelPos | undefined;

  if (shortDistance !== null) {
    const dx = shot.returnAt.x - shot.bounceAt.x;
    const dy = shot.returnAt.y - shot.bounceAt.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = dx / len;
    const ny = dy / len;
    endAt = { x: shot.bounceAt.x + nx * shortDistance, y: shot.bounceAt.y + ny * shortDistance };
    secondBounceAt = { x: shot.bounceAt.x + nx * shortDistance * 0.6, y: shot.bounceAt.y + ny * shortDistance * 0.6 };
  } else {
    endAt =
      computeExtensionEndpoint(shot.hitFrom, shot.returnAt, false, containerSize) ?? shot.returnAt;
  }

  const pathD = computeBallPathD(shot.hitFrom, shot.bounceAt, endAt, baseCurve + shot.curveLevel * 16);
  return { pathD, secondBounceAt };
}

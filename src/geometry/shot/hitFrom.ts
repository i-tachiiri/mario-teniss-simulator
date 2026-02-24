import type { PixelPos, Position, ShotStep } from '../../domain/types';

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

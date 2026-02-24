import type { PixelPos, Position, Scene } from '../../domain/types';

export function getHitFrom(
  scenes: Scene[],
  activeSide: 'top' | 'bottom',
  p1Pos: Position | null,
  p2Pos: Position | null,
): PixelPos {
  const findInBottom = activeSide === 'top';

  for (let i = scenes.length - 1; i >= 0; i--) {
    const shot = scenes[i].shot;
    const bouncedInBottom = shot.bounceAt.r >= 5;
    if (findInBottom && bouncedInBottom) return shot.returnAt;
    if (!findInBottom && !bouncedInBottom) return shot.returnAt;
  }

  const fallback = findInBottom ? p1Pos : p2Pos;
  return fallback ?? { x: 0, y: 0 };
}

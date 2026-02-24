import type { PixelPos, Scene } from '../../domain/types';

export function getHitFrom(
  scenes: Scene[],
  activeSide: 'top' | 'bottom',
  p1Pos: PixelPos | null,
  p2Pos: PixelPos | null,
): PixelPos {
  const findInBottom = activeSide === 'top';

  for (let i = scenes.length - 1; i >= 0; i--) {
    const scene = scenes[i];
    for (let j = scene.shots.length - 1; j >= 0; j--) {
      const shot = scene.shots[j];
      const bouncedInBottom = shot.bounceAt.r >= 5;
      if (findInBottom && bouncedInBottom) return shot.returnAt;
      if (!findInBottom && !bouncedInBottom) return shot.returnAt;
    }
  }

  const fallback = findInBottom ? p1Pos : p2Pos;
  return fallback ?? { x: 0, y: 0 };
}

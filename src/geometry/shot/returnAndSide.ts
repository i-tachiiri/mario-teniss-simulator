import type { PixelPos } from '../../types';
import { projectToRayFromBounce } from '../math/projection';

export function computeReturnAndSide(
  hitFrom: PixelPos,
  bounceAt: PixelPos,
  iconX: number,
  iconY: number,
  activeSide: 'top' | 'bottom',
): { returnAt: PixelPos; shotSide: 'forehand' | 'backhand' } {
  const returnAt = projectToRayFromBounce(hitFrom, bounceAt, iconX, iconY);

  const shotSide: 'forehand' | 'backhand' =
    activeSide === 'bottom'
      ? returnAt.x >= iconX ? 'forehand' : 'backhand'
      : returnAt.x <= iconX ? 'forehand' : 'backhand';

  return { returnAt, shotSide };
}

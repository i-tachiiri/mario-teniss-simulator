import type { PixelPos } from '../../domain/types';
import { projectToRayFromBounce } from '../math/projection';

export function computeReturnAt(
  hitFrom: PixelPos,
  bounceAt: PixelPos,
  iconX: number,
  iconY: number,
): PixelPos {
  return projectToRayFromBounce(hitFrom, bounceAt, iconX, iconY);
}

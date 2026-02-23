import type { CourtPoint } from '../../domain/types/coords';
import type { CoordMapper, CourtRect, PixelPos } from '../types';

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

export function createCourtMapper(rect: CourtRect): CoordMapper {
  return {
    courtToPixel(point: CourtPoint): PixelPos {
      return {
        x: rect.left + clamp01(point.u) * rect.width,
        y: rect.top + clamp01(point.v) * rect.height,
      };
    },
    pixelToCourt(px: PixelPos): CourtPoint {
      return {
        u: clamp01((px.x - rect.left) / rect.width),
        v: clamp01((px.y - rect.top) / rect.height),
      };
    },
  };
}

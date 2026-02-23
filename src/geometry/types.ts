import type { CourtPoint } from '../domain/types/coords';

export type PixelPos = { x: number; y: number };

export interface CourtRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface CoordMapper {
  courtToPixel(point: CourtPoint): PixelPos;
  pixelToCourt(px: PixelPos): CourtPoint;
}

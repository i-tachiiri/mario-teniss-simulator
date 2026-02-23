import type { CourtPoint } from '../../domain/types/coords';

export function clampCourtPoint(point: CourtPoint): CourtPoint {
  return { u: Math.max(0, Math.min(1, point.u)), v: Math.max(0, Math.min(1, point.v)) };
}

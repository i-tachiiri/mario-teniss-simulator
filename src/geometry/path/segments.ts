import type { CourtPoint } from '../../domain/types/coords';

export interface SegmentSpec {
  start: CourtPoint;
  end: CourtPoint;
  bendLevel?: number;
}

import type { CourtPoint } from './coords';

export type ShotTypeId = 'flat' | 'topspin' | 'slice' | 'lob' | 'drop' | 'slide' | 'dive';

export type StopRule =
  | { kind: 'none' }
  | { kind: 'secondBounceDistanceCells'; value: number };

export interface ShotState {
  typeId: ShotTypeId;
  hitFrom: CourtPoint;
  bounce1: CourtPoint;
  bendLevel: number;
  stopRule: StopRule;
  showSecondBounceMarker: boolean;
}

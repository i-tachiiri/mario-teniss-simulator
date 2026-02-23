import type { CourtPoint } from './coords';
import type { StarId } from './ids';

export interface StarState {
  id: StarId;
  pos: CourtPoint;
}

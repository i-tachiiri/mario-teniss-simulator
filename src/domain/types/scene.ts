import type { CourtPoint } from './coords';
import type { CourtState } from './court';
import type { SceneId } from './ids';
import type { ShotState } from './shot';
import type { StarState } from './star';
import type { SubtitleState } from './subtitle';

export interface Scene {
  id: SceneId;
  court: CourtState;
  players: {
    self: { charId: string; pos: CourtPoint };
    opponent: { charId: string; pos: CourtPoint };
  };
  shot?: ShotState;
  subtitle?: SubtitleState;
  stars: StarState[];
}

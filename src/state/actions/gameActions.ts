import type { PixelPos, Position, ShotType } from '../../types';

export type GameAction =
  | { type: 'SET_SHOT_TYPE'; shotType: ShotType }
  | { type: 'SET_SHOT_CURVE'; delta: number }
  | { type: 'SET_PLAYER_POS'; player: 'p1' | 'p2'; x: number; y: number }
  | { type: 'SET_DEFAULT_POSITIONS'; p1Pos: Position; p2Pos: Position }
  | { type: 'SET_CHARACTERS'; p1: string; p2: string }
  | { type: 'CELL_CLICKED'; r: number; c: number; x: number; y: number }
  | { type: 'FINALIZE_RETURN'; iconX: number; iconY: number }
  | { type: 'SELECT_SHOT'; id: number | null }
  | { type: 'UPDATE_LAST_RETURN'; iconX: number; iconY: number }
  | { type: 'ADD_SCENE' }
  | { type: 'DELETE_SELECTED_SCENE' }
  | { type: 'MOVE_SCENE'; id: number; direction: -1 | 1 }
  | { type: 'SET_SCENE_SUBTITLE'; id: number; subtitle: string }
  | { type: 'SET_SUBTITLE_DRAFT'; subtitle: string }
  | { type: 'UNDO_LAST' }
  | { type: 'RESET_ALL' }
  | { type: 'SET_STAR_POS'; id: number; pos: PixelPos | null }
  | { type: 'SET_PENDING_STAR'; pos: PixelPos | null };

import type { GameMode, Position, ShotType } from '../types';

export type GameAction =
  | { type: 'SET_MODE'; mode: GameMode }
  | { type: 'SET_SHOT_TYPE'; shotType: ShotType }
  | { type: 'SET_PLAYER_POS'; player: 'p1' | 'p2'; x: number; y: number }
  | { type: 'SET_DEFAULT_POSITIONS'; p1Pos: Position; p2Pos: Position }
  | { type: 'SET_CHARACTERS'; p1: string; p2: string }
  | { type: 'CELL_CLICKED'; r: number; c: number; x: number; y: number }
  | { type: 'FINALIZE_RETURN'; iconX: number; iconY: number }
  | { type: 'SELECT_SHOT'; id: number | null }
  | { type: 'CANCEL_PENDING_SHOT' }
  | { type: 'UPDATE_LAST_RETURN'; iconX: number; iconY: number }
  | { type: 'UNDO_LAST' }
  | { type: 'RESET_ALL' };

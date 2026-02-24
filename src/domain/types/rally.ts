import type { PixelPos, Position } from './coords';

export type ShotType =
  | 'strong-flat'
  | 'strong-top'
  | 'strong-slice'
  | 'drop'
  | 'weak-flat'
  | 'weak-top'
  | 'weak-slice'
  | 'lob'
  | 'jump';

/** ボールの軌跡データ */
export interface Shot {
  id: number;
  hidden?: boolean;
  hitFrom: PixelPos;
  bounceAt: Position;
  returnAt: PixelPos;
  type: ShotType;
  curveLevel: number;
  shotSide: 'forehand' | 'backhand';
}

/** 1シーン分の状態（プレイヤー配置 + ショット軌跡） */
export interface Scene {
  id: number;
  p1Pos: PixelPos;
  p2Pos: PixelPos;
  subtitle: string;
  starPos?: PixelPos;
  shots: Shot[];
}

export type ShotPhase =
  | { status: 'idle' }
  | { status: 'editing' };

export interface ShotConfig {
  color: string;
  width: number;
  curveAmount: number;
  dashed?: boolean;
}

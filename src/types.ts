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

export interface Position {
  r: number;
  c: number;
  x: number;
  y: number;
}

export interface PixelPos { x: number; y: number; }

export interface ShotStep {
  hitFrom: PixelPos;
  bounceAt: Position;
  returnAt: PixelPos;
  playerAt: PixelPos;
  shotSide: 'forehand' | 'backhand';
  type: ShotType;
  id: number;
  ballPathD?: string;
  starPos?: PixelPos;
  curveLevel: number;
  subtitle: string;
}

export type ShotPhase =
  | { status: 'idle' }
  | { status: 'awaiting'; bounceAt: Position; hitFrom: PixelPos; starPos?: PixelPos; curveLevel: number };

export interface ShotConfig {
  color: string;
  width: number;
  curveAmount: number;
  dashed?: boolean;
}

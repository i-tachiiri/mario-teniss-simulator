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

/** グリッドインデックスを持たない、ピクセル座標のみの型。
 *  アイコン位置・ショット返球カット点に使用。*/
export interface PixelPos { x: number; y: number; }

export interface ShotStep {
  /** ボールを打った位置（前のコートの打ち返し地点、または初期位置） */
  hitFrom: PixelPos;
  /** ボールがバウンドした位置（1タップ目） */
  bounceAt: Position;
  /** ボールを打ち返したカット点（延長線上へのアイコン射影） */
  returnAt: PixelPos;
  /** アイコン（体）の位置 */
  playerAt: PixelPos;
  /** フォアハンド or バックハンド */
  shotSide: 'forehand' | 'backhand';
  type: ShotType;
  id: number;
  /** ネットを越えるショット線のSVGパス（hitFrom → bounceAt） */
  ballPathD?: string;
  /** ☆マーカーの位置（スマッシュ可能地点） */
  starPos?: PixelPos;
}

/**
 * ショット入力のライフサイクルを表す状態機械。
 *   idle     - バウンド地点未選択（セルタップ待ち）
 *   awaiting - バウンド確定済み、レシーバーアイコンのドロップ待ち
 */
export type ShotPhase =
  | { status: 'idle' }
  | { status: 'awaiting'; bounceAt: Position; hitFrom: PixelPos; starPos?: PixelPos };

export interface ShotConfig {
  color: string;
  width: number;
  curveAmount: number;
  dashed?: boolean;
}

/**
 * グリッド（セル）上の論理座標。
 *
 * NOTE: Position との互換を維持するために当面は併存させる。
 * 今後はグリッド由来の入力を GridPos に寄せ、px は PixelPos へ明示的に変換する方針。
 */
export type GridPos = { r: number; c: number };

/**
 * グリッド/セル由来の座標。
 * r/c はセルインデックス、x/y はコンテナ内ピクセル座標（px）。
 *
 * NOTE: 互換維持のため残置。新規実装では GridPos + PixelPos の明示的な境界を優先する。
 */
export interface Position {
  r: number;
  c: number;
  x: number;
  y: number;
}

/**
 * コンテナ内のピクセル座標（px）。
 */
export interface PixelPos {
  x: number;
  y: number;
}

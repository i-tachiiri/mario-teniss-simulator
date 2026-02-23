/**
 * グリッド由来の座標（セル行列 + コンテナ内ピクセル座標）。
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

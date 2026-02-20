import type { Position, PixelPos, ShotStep } from '../types';

/**
 * ベジェ曲線パスを計算して SVG の d 属性文字列を返す。
 * hitFrom → bounceAt → returnAt を通る二次ベジェ曲線。
 */
export function computeBallPathD(
  hitFrom: PixelPos,
  bounceAt: Position,
  returnAt: PixelPos,
): string {
  const d1 = Math.hypot(bounceAt.x - hitFrom.x, bounceAt.y - hitFrom.y);
  const d2 = Math.hypot(returnAt.x - bounceAt.x, returnAt.y - bounceAt.y);
  const total = d1 + d2;

  if (total < 1 || d1 / total < 1e-4 || d1 / total > 1 - 1e-4) {
    return `M ${hitFrom.x} ${hitFrom.y} L ${returnAt.x} ${returnAt.y}`;
  }

  const t = d1 / total;
  const denom = 2 * t * (1 - t);
  const ctrlX =
    (bounceAt.x - (1 - t) * (1 - t) * hitFrom.x - t * t * returnAt.x) / denom;
  const ctrlY =
    (bounceAt.y - (1 - t) * (1 - t) * hitFrom.y - t * t * returnAt.y) / denom;

  return `M ${hitFrom.x} ${hitFrom.y} Q ${ctrlX} ${ctrlY} ${returnAt.x} ${returnAt.y}`;
}

/**
 * ラリーの流れから「次のヒット位置」を取得する。
 * activeSide に応じて直近の returnAt を探す。
 * returnAt は PixelPos（グリッド座標不要）なので戻り値も PixelPos。
 */
export function getHitFrom(
  rallySteps: ShotStep[],
  activeSide: 'top' | 'bottom',
  p1Pos: Position | null,
  p2Pos: Position | null,
): PixelPos {
  // activeSide === 'top' → ボールはトップコートにバウンド → ヒッターはボトム (P1)
  const findInBottom = activeSide === 'top';

  for (let i = rallySteps.length - 1; i >= 0; i--) {
    const shot = rallySteps[i];
    const bouncedInBottom = shot.bounceAt.r >= 5;
    if (findInBottom && bouncedInBottom) return shot.returnAt;
    if (!findInBottom && !bouncedInBottom) return shot.returnAt;
  }

  const fallback = findInBottom ? p1Pos : p2Pos;
  return fallback ?? { x: 0, y: 0 };
}

/**
 * アイコン位置を延長線上に射影してカット点を算出し、フォア/バックを判定する。
 */
export function computeReturnAndSide(
  hitFrom: PixelPos,
  bounceAt: Position,
  iconX: number,
  iconY: number,
  activeSide: 'top' | 'bottom',
): { returnAt: PixelPos; shotSide: 'forehand' | 'backhand' } {
  const dx = bounceAt.x - hitFrom.x;
  const dy = bounceAt.y - hitFrom.y;
  const len = Math.hypot(dx, dy);

  let cutX = iconX;
  let cutY = iconY;

  if (len > 0) {
    const nx = dx / len;
    const ny = dy / len;
    const t = Math.max(0, (iconX - bounceAt.x) * nx + (iconY - bounceAt.y) * ny);
    cutX = bounceAt.x + t * nx;
    cutY = bounceAt.y + t * ny;
  }

  // P1 (bottom, facing up): 体の右にカット点 → フォア
  // P2 (top, facing down):  体の左にカット点 → フォア
  const shotSide: 'forehand' | 'backhand' =
    activeSide === 'bottom'
      ? cutX >= iconX ? 'forehand' : 'backhand'
      : cutX <= iconX ? 'forehand' : 'backhand';

  return { returnAt: { x: cutX, y: cutY }, shotSide };
}

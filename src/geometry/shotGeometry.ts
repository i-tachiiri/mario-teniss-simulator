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
 * バウンド後の延長終点を計算する。
 * - isShortShot: バウンドから 60px 先
 * - それ以外: containerSize があればコート端まで、なければ 1000px（SVG クリップに任せる）
 * 方向は from → bounceAt の延長線上。長さが 0 の場合は null を返す。
 */
export function computeExtensionEndpoint(
  from: PixelPos,
  bounceAt: PixelPos,
  isShortShot: boolean,
  containerSize?: { width: number; height: number },
): PixelPos | null {
  const dx = bounceAt.x - from.x;
  const dy = bounceAt.y - from.y;
  const len = Math.hypot(dx, dy);
  if (len === 0) return null;

  const nx = dx / len;
  const ny = dy / len;
  const { x: bx, y: by } = bounceAt;

  if (isShortShot) {
    return { x: bx + nx * 60, y: by + ny * 60 };
  }

  if (containerSize) {
    const { width: W, height: H } = containerSize;
    let t = Infinity;
    if (nx > 0) t = Math.min(t, (W - bx) / nx);
    else if (nx < 0) t = Math.min(t, -bx / nx);
    if (ny > 0) t = Math.min(t, (H - by) / ny);
    else if (ny < 0) t = Math.min(t, -by / ny);
    return { x: bx + (isFinite(t) ? t : 0) * nx, y: by + (isFinite(t) ? t : 0) * ny };
  }

  return { x: bx + nx * 1000, y: by + ny * 1000 };
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

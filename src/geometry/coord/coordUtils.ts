import type { Position } from '../../types';

/**
 * コンテナ要素に対する el の中心座標と行・列インデックスを返す。
 */
export function getCellPosition(
  container: HTMLElement,
  el: HTMLElement,
  r: number,
  c: number,
): Position {
  const containerRect = container.getBoundingClientRect();
  const cellRect = el.getBoundingClientRect();
  return {
    r,
    c,
    x: cellRect.left - containerRect.left + cellRect.width / 2,
    y: cellRect.top - containerRect.top + cellRect.height / 2,
  };
}

/**
 * コンテナ要素に対する clientX/clientY の相対座標を返す。
 */
export function getRelativePos(
  container: HTMLElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } {
  const r = container.getBoundingClientRect();
  return { x: clientX - r.left, y: clientY - r.top };
}

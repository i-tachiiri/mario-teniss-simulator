import { useEffect, useRef, type RefObject } from 'react';
import { ICON_HALF_SIZE } from '../config';

interface DragCallbacks {
  containerRef: RefObject<HTMLDivElement | null>;
  onMove?: (x: number, y: number) => void;
  onDrop: (x: number, y: number) => void;
  onClick?: () => void;
}

/**
 * ポインターイベントを使ったアイコンドラッグフック。
 * - pointerdown は icon に登録、pointermove / pointerup は document に登録
 *   （元の mousemove/mouseup on document と同じ方式）
 * - ドラッグ中は transition を無効化し、アニメーション遅延を防ぐ
 * - コールバックを useRef に格納し、依存は [enabled, iconRef] のみにする
 */
export function useDragIcon(
  iconRef: RefObject<HTMLElement | null>,
  callbacks: DragCallbacks,
  enabled: boolean,
): void {
  const cbRef = useRef(callbacks);
  cbRef.current = callbacks;

  useEffect(() => {
    const icon = iconRef.current;
    if (!enabled || !icon) return;

    icon.style.pointerEvents = 'auto';
    icon.classList.add('char-draggable');

    let dragging = false;
    let startClientX = 0;
    let startClientY = 0;

    function getRelPos(clientX: number, clientY: number) {
      const container = cbRef.current.containerRef.current;
      if (!container) return null;
      const r = container.getBoundingClientRect();
      return { x: clientX - r.left, y: clientY - r.top };
    }

    function onPointerDown(e: PointerEvent) {
      e.preventDefault();
      dragging = true;
      startClientX = e.clientX;
      startClientY = e.clientY;
      icon!.style.transition = 'none'; // ドラッグ中はアニメーション無効
      icon!.style.cursor = 'grabbing';
      document.addEventListener('pointermove', onPointerMove, { passive: false });
      document.addEventListener('pointerup', onPointerUp);
    }

    function onPointerMove(e: PointerEvent) {
      if (!dragging) return;
      e.preventDefault();
      const pos = getRelPos(e.clientX, e.clientY);
      if (!pos) return;
      icon!.style.left = pos.x - ICON_HALF_SIZE + 'px';
      icon!.style.top  = pos.y - ICON_HALF_SIZE + 'px';
      cbRef.current.onMove?.(pos.x, pos.y);
    }

    function onPointerUp(e: PointerEvent) {
      if (!dragging) return;
      dragging = false;
      icon!.style.cursor = '';
      icon!.style.transition = ''; // transition を元に戻す
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      const pos = getRelPos(e.clientX, e.clientY);
      if (!pos) return;
      const dist = Math.hypot(e.clientX - startClientX, e.clientY - startClientY);
      if (dist < 8 && cbRef.current.onClick) {
        cbRef.current.onClick();
      } else {
        cbRef.current.onDrop(pos.x, pos.y);
      }
    }

    icon.addEventListener('pointerdown', onPointerDown);

    return () => {
      icon.style.pointerEvents = 'none';
      icon.classList.remove('char-draggable');
      icon.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, iconRef]);
}

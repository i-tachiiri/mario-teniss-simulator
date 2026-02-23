import { useEffect, useRef, type RefObject } from 'react';
import { ICON_HALF_SIZE } from '../config';

interface DragCallbacks {
  containerRef: RefObject<HTMLDivElement | null>;
  onMove?: (x: number, y: number) => void;
  onDrop: (x: number, y: number) => void;
  onClick?: () => void;
  /** true のとき長押し後にドラッグ開始。短タップは onClick を呼ぶ。 */
  longPressDrag?: boolean;
}

const LONG_PRESS_MS = 160;
const DRAG_START_DIST_MOUSE = 4;
const DRAG_START_DIST_TOUCH = 20;

/**
 * ポインターイベントを使ったアイコンドラッグフック。
 * - longPressDrag=true のとき:
 *   - mouse: 小さい移動距離（4px）でドラッグ開始。長押しタイマーも併用。
 *   - touch/pen: 大きい移動距離（20px）でドラッグ開始（誤タップ防止）。長押しタイマーも併用。
 *   - いずれも短タップは onClick。
 * - longPressDrag=false (default): pointerdown 直後からドラッグ開始（従来通り）。
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
    let longPressTimer: number | null = null;
    let pointerType = 'mouse';

    function getRelPos(clientX: number, clientY: number) {
      const container = cbRef.current.containerRef.current;
      if (!container) return null;
      const r = container.getBoundingClientRect();
      return { x: clientX - r.left, y: clientY - r.top };
    }

    function startDrag() {
      dragging = true;
      icon!.style.transition = 'none';
      icon!.style.cursor = 'grabbing';
    }

    function onPointerDown(e: PointerEvent) {
      e.preventDefault();
      startClientX = e.clientX;
      startClientY = e.clientY;
      dragging = false;
      pointerType = e.pointerType;

      if (cbRef.current.longPressDrag) {
        longPressTimer = window.setTimeout(() => {
          longPressTimer = null;
          startDrag();
        }, LONG_PRESS_MS);
      } else {
        startDrag();
      }

      document.addEventListener('pointermove', onPointerMove, { passive: false });
      document.addEventListener('pointerup', onPointerUp);
    }

    function onPointerMove(e: PointerEvent) {
      e.preventDefault();
      const dist = Math.hypot(e.clientX - startClientX, e.clientY - startClientY);

      if (!dragging) {
        if (cbRef.current.longPressDrag) {
          const threshold = pointerType === 'mouse' ? DRAG_START_DIST_MOUSE : DRAG_START_DIST_TOUCH;
          if (dist > threshold) {
            if (longPressTimer !== null) {
              window.clearTimeout(longPressTimer);
              longPressTimer = null;
            }
            startDrag();
            // fall through to position update
          } else {
            return;
          }
        } else {
          if (dist > DRAG_START_DIST_MOUSE) {
            startDrag();
          } else {
            return;
          }
        }
      }

      const pos = getRelPos(e.clientX, e.clientY);
      if (!pos) return;
      icon!.style.left = pos.x - ICON_HALF_SIZE + 'px';
      icon!.style.top  = pos.y - ICON_HALF_SIZE + 'px';
      cbRef.current.onMove?.(pos.x, pos.y);
    }

    function onPointerUp(e: PointerEvent) {
      if (longPressTimer !== null) {
        window.clearTimeout(longPressTimer);
        longPressTimer = null;
      }

      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);

      if (!dragging) {
        // 短タップ: onClick を呼ぶ
        cbRef.current.onClick?.();
        // デスクトップで pointerup 後に合成される click がバックドロップに届かないよう破棄する
        const eat = (ev: MouseEvent) => {
          ev.stopPropagation();
          document.removeEventListener('click', eat, true);
        };
        document.addEventListener('click', eat, true);
        requestAnimationFrame(() => document.removeEventListener('click', eat, true));
        return;
      }

      dragging = false;
      icon!.style.cursor = '';
      icon!.style.transition = '';
      const pos = getRelPos(e.clientX, e.clientY);
      if (!pos) return;
      cbRef.current.onDrop(pos.x, pos.y);
    }

    function onContextMenu(e: Event) {
      e.preventDefault();
    }

    icon.addEventListener('pointerdown', onPointerDown);
    icon.addEventListener('contextmenu', onContextMenu);

    return () => {
      if (longPressTimer !== null) window.clearTimeout(longPressTimer);
      icon.style.pointerEvents = 'none';
      icon.classList.remove('char-draggable');
      icon.removeEventListener('pointerdown', onPointerDown);
      icon.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, iconRef]);
}

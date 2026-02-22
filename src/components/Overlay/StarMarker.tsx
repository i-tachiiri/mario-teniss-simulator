import { useRef, useEffect, useState, type RefObject } from 'react';

interface Props {
  x: number;
  y: number;
  containerRef: RefObject<HTMLDivElement | null>;
  onDrop: (x: number, y: number) => void;
}

const HALF = 16; // 半分のオフセット（中央揃え）

// 5角星のポリゴン座標（32×32, 中心(16,16), 外半径13, 内半径5.5）
const STAR_POINTS =
  '16,3 19.23,11.55 28.36,11.98 21.23,17.70 23.64,26.52 16,21.5 8.36,26.52 10.77,17.70 3.64,11.98 12.77,11.55';

export function StarMarker({ x, y, containerRef, onDrop }: Props) {
  const iconRef = useRef<HTMLDivElement | null>(null);
  const [displayPos, setDisplayPos] = useState({ x, y });
  // ドロップ失敗時に元位置へ戻すため、最新 props を ref で保持
  const propsRef = useRef({ x, y, onDrop });
  propsRef.current = { x, y, onDrop };

  // props が変わったら表示位置を同期
  useEffect(() => {
    setDisplayPos({ x, y });
  }, [x, y]);

  useEffect(() => {
    const icon = iconRef.current;
    if (!icon) return;

    let dragging = false;
    let startClientX = 0;
    let startClientY = 0;

    function getRelPos(clientX: number, clientY: number) {
      const container = containerRef.current;
      if (!container) return null;
      const r = container.getBoundingClientRect();
      return { x: clientX - r.left, y: clientY - r.top, w: r.width, h: r.height };
    }

    function onPointerDown(e: PointerEvent) {
      e.preventDefault();
      dragging = true;
      startClientX = e.clientX;
      startClientY = e.clientY;
      icon!.style.cursor = 'grabbing';
      document.addEventListener('pointermove', onPointerMove, { passive: false });
      document.addEventListener('pointerup', onPointerUp);
    }

    function onPointerMove(e: PointerEvent) {
      if (!dragging) return;
      e.preventDefault();
      const pos = getRelPos(e.clientX, e.clientY);
      if (!pos) return;
      setDisplayPos(pos);
    }

    function onPointerUp(e: PointerEvent) {
      if (!dragging) return;
      dragging = false;
      icon!.style.cursor = 'grab';
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      const pos = getRelPos(e.clientX, e.clientY);
      const dist = Math.hypot(e.clientX - startClientX, e.clientY - startClientY);
      if (dist >= 8) {
        // コート内でリリースされた場合のみ確定、それ以外は元位置へ戻す
        if (pos && pos.x >= 0 && pos.y >= 0 && pos.x <= pos.w && pos.y <= pos.h) {
          propsRef.current.onDrop(pos.x, pos.y);
        } else {
          setDisplayPos({ x: propsRef.current.x, y: propsRef.current.y });
        }
      }
    }

    icon.addEventListener('pointerdown', onPointerDown);

    return () => {
      icon.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iconRef]);

  return (
    <div
      ref={iconRef}
      style={{
        position: 'absolute',
        left: displayPos.x - HALF,
        top: displayPos.y - HALF,
        width: HALF * 2,
        height: HALF * 2,
        zIndex: 45,
        cursor: 'grab',
        pointerEvents: 'auto',
        userSelect: 'none',
      }}
    >
      <svg width={HALF * 2} height={HALF * 2} viewBox="0 0 32 32" overflow="visible">
        {/* 白い外枠（視認性向上） */}
        <polygon
          points={STAR_POINTS}
          fill="none"
          stroke="white"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* 黄色い枠線 */}
        <polygon
          points={STAR_POINTS}
          fill="none"
          stroke="#fbbf24"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

import type { PixelPos } from '../../../geometry/types';

export function StarMarker({ pos, onPointerDown }: { pos: PixelPos; onPointerDown: (e: React.PointerEvent) => void }) {
  return (
    <button
      type="button"
      onPointerDown={onPointerDown}
      className="absolute text-2xl -translate-x-1/2 -translate-y-1/2"
      style={{ left: pos.x, top: pos.y }}
    >
      ⭐
    </button>
  );
}

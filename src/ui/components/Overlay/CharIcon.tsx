import { charImgPath } from '../../../characters';
import type { PixelPos } from '../../../geometry/types';

export function CharIcon({ charId, pos, role, onPointerDown }: { charId: string; pos: PixelPos; role: 'self' | 'opponent'; onPointerDown: (e: React.PointerEvent) => void }) {
  return (
    <button
      type="button"
      onPointerDown={onPointerDown}
      className="absolute w-12 h-12 rounded-full overflow-hidden border-2 border-white -translate-x-1/2 -translate-y-1/2"
      style={{ left: pos.x, top: pos.y }}
      aria-label={role}
    >
      <img src={charImgPath(charId)} alt={role} className="w-full h-full object-cover" />
    </button>
  );
}

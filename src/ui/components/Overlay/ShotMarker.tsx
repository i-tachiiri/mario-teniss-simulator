import type { PixelPos } from '../../../geometry/types';

export function ShotMarker({ pos, kind }: { pos: PixelPos; kind: 'bounce1' | 'bounce2' }) {
  return (
    <div
      className={`absolute w-4 h-4 rounded-full border-2 border-white -translate-x-1/2 -translate-y-1/2 ${kind === 'bounce2' ? 'bg-red-500' : 'bg-yellow-300'}`}
      style={{ left: pos.x, top: pos.y }}
    />
  );
}

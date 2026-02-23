import type { ReactNode } from 'react';
import { CourtGrid } from './CourtGrid';
import { NetDivider } from './NetDivider';

export function Court({ children, onPointerDown, exportRef }: { children: ReactNode; onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void; exportRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div className="rounded-xl bg-green-700 p-4 shadow-inner">
      <div
        ref={exportRef}
        onPointerDown={onPointerDown}
        className="relative w-full aspect-[3/5] rounded-md overflow-hidden bg-blue-500 touch-none"
      >
        <CourtGrid />
        <NetDivider />
        {children}
      </div>
    </div>
  );
}

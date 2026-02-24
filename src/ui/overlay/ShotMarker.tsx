import type { MouseEvent } from 'react';

interface Props {
  x: number;
  y: number;
  color: string;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  clickable?: boolean;
  opacity?: number;
}

export function ShotMarker({ x, y, color, onClick, clickable, opacity }: Props) {
  return (
    <div
      className="shot-marker"
      style={{
        backgroundColor: color,
        left: x,
        top: y,
        cursor: clickable ? 'pointer' : undefined,
        zIndex: clickable ? 48 : undefined,
        pointerEvents: clickable ? 'auto' : undefined,
        opacity,
      }}
      onClick={onClick}
    />
  );
}

interface Props {
  x: number;
  y: number;
  color: string;
  onClick?: () => void;
  clickable?: boolean;
}

export function ShotMarker({ x, y, color, onClick, clickable }: Props) {
  return (
    <div
      className="shot-marker"
      style={{
        backgroundColor: color,
        left: x,
        top: y,
        cursor: clickable ? 'pointer' : undefined,
        zIndex: clickable ? 55 : undefined,
        pointerEvents: clickable ? 'auto' : undefined,
      }}
      onClick={onClick}
    />
  );
}

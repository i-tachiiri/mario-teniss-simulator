interface Props {
  x: number;
  y: number;
  shotSide: 'forehand' | 'backhand';
}

export function ForeBackLabel({ x, y, shotSide }: Props) {
  const fill = shotSide === 'forehand' ? '#22c55e' : '#3b82f6';
  return (
    <text
      x={x + 8}
      y={y - 8}
      fill={fill}
      fontSize={11}
      fontWeight="bold"
      fontFamily="sans-serif"
    >
      {shotSide === 'forehand' ? 'F' : 'B'}
    </text>
  );
}

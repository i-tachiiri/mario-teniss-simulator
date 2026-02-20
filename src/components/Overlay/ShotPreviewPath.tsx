import type { Position, PixelPos, ShotType } from '../../types';
import { SHOT_CONFIGS } from '../../config';

interface Props {
  hitFrom: PixelPos;
  bounceAt: Position;
  type: ShotType;
  dragPos?: { x: number; y: number };
}

export function ShotPreviewPath({ hitFrom, bounceAt, type, dragPos }: Props) {
  const config = SHOT_CONFIGS[type];

  const midX = (hitFrom.x + bounceAt.x) / 2;
  const midY = (hitFrom.y + bounceAt.y) / 2;
  const curveX = midX + config.curveAmount * 0.5;
  const mainD = `M ${hitFrom.x} ${hitFrom.y} Q ${curveX} ${midY} ${bounceAt.x} ${bounceAt.y}`;

  // 延長線（バウンド地点から先の方向）
  const dx = bounceAt.x - hitFrom.x;
  const dy = bounceAt.y - hitFrom.y;
  const len = Math.hypot(dx, dy);

  let extD: string | null = null;
  if (len > 0) {
    const nx = dx / len;
    const ny = dy / len;
    let extX: number;
    let extY: number;
    if (dragPos) {
      const t = Math.max(0, (dragPos.x - bounceAt.x) * nx + (dragPos.y - bounceAt.y) * ny);
      extX = bounceAt.x + t * nx;
      extY = bounceAt.y + t * ny;
    } else {
      extX = bounceAt.x + nx * 250;
      extY = bounceAt.y + ny * 250;
    }
    extD = `M ${bounceAt.x} ${bounceAt.y} L ${extX} ${extY}`;
  }

  return (
    <>
      <path
        d={mainD}
        fill="none"
        stroke="white"
        strokeWidth={config.width + 5}
        strokeOpacity="0.6"
        strokeLinecap="round"
        strokeDasharray={config.dashed ? '8,5' : undefined}
      />
      <path
        d={mainD}
        fill="none"
        stroke={config.color}
        strokeWidth={config.width}
        strokeOpacity="0.85"
        strokeLinecap="round"
        strokeDasharray={config.dashed ? '8,5' : undefined}
        filter="url(#shadow)"
      />
      {extD && (
        <>
          <path
            d={extD}
            fill="none"
            stroke="white"
            strokeWidth={config.width + 5}
            strokeOpacity={dragPos ? '0.4' : '0.2'}
            strokeLinecap="round"
            strokeDasharray="7,4"
          />
          <path
            d={extD}
            fill="none"
            stroke={config.color}
            strokeWidth={config.width}
            strokeOpacity={dragPos ? '0.65' : '0.25'}
            strokeLinecap="round"
            strokeDasharray="7,4"
          />
        </>
      )}
    </>
  );
}

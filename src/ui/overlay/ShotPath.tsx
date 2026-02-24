import type { ShotType } from '../../domain/types';
import { SHOT_CONFIGS } from '../../config';

interface Props {
  type: ShotType;
  pathD: string;
  opacity?: number;
}

export function ShotPath({ type, pathD, opacity = 1 }: Props) {
  const config = SHOT_CONFIGS[type];

  return (
    <g opacity={opacity}>
      {/* 白ボーダー（背面） */}
      <path
        d={pathD}
        fill="none"
        stroke="white"
        strokeWidth={config.width + 5}
        strokeOpacity="0.6"
        strokeLinecap="round"
        strokeDasharray={config.dashed ? '8,5' : undefined}
      />
      {/* カラー線（前面） */}
      <path
        d={pathD}
        fill="none"
        stroke={config.color}
        strokeWidth={config.width}
        strokeOpacity="0.85"
        strokeLinecap="round"
        strokeDasharray={config.dashed ? '8,5' : undefined}
        filter="url(#shadow)"
      />
    </g>
  );
}

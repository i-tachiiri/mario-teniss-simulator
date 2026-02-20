import type { ShotStep } from '../../types';
import { SHOT_CONFIGS } from '../../config';

interface Props {
  shot: ShotStep;
  /** パスの d 属性（App.tsx で computeBallPathD から計算済み） */
  pathD: string;
}

export function ShotPath({ shot, pathD }: Props) {
  const config = SHOT_CONFIGS[shot.type];

  return (
    <>
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
    </>
  );
}

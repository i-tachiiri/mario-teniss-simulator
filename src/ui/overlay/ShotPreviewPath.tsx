import type { PixelPos, ShotType } from '../../types';
import { SHOT_CONFIGS } from '../../config';
import { computeSceneVisual } from '../../geometry/shot/path';

interface Props {
  hitFrom: PixelPos;
  bounceAt: PixelPos;
  type: ShotType;
  dragPos?: { x: number; y: number };
  curveLevel: number;
}

export function ShotPreviewPath({ hitFrom, bounceAt, type, dragPos, curveLevel }: Props) {
  const config = SHOT_CONFIGS[type];
  const { pathD } = computeSceneVisual({
    hitFrom,
    bounce1: bounceAt,
    returnAt: dragPos ?? bounceAt,
    type,
    curveLevel,
    baseCurve: config.curveAmount,
  });

  return (
    <>
      <path d={pathD} fill="none" stroke="white" strokeWidth={config.width + 5} strokeOpacity="0.6" strokeLinecap="round" strokeDasharray={config.dashed ? '8,5' : undefined} />
      <path d={pathD} fill="none" stroke={config.color} strokeWidth={config.width} strokeOpacity="0.85" strokeLinecap="round" strokeDasharray={config.dashed ? '8,5' : undefined} filter="url(#shadow)" />
    </>
  );
}

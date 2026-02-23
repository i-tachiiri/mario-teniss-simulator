import type { PixelPos, ShotType } from '../../types';
import { SHOT_CONFIGS } from '../../config';
import { computeSceneVisual } from '../../geometry/shot/path';

interface Props {
  hitFrom: PixelPos;
  bounceAt: PixelPos;
  type: ShotType;
  dragPos?: { x: number; y: number };
  curveLevel: number;
  containerSize?: { width: number; height: number };
}

export function ShotPreviewPath({ hitFrom, bounceAt, type, dragPos, curveLevel, containerSize }: Props) {
  const config = SHOT_CONFIGS[type];
  const { d } = computeSceneVisual({
    hitFrom,
    bounce1: bounceAt,
    returnAt: dragPos ?? bounceAt,
    type,
    bendLevel: curveLevel,
    baseCurve: config.curveAmount,
    containerSize,
  });

  return (
    <>
      <path d={d} fill="none" stroke="white" strokeWidth={config.width + 5} strokeOpacity="0.6" strokeLinecap="round" strokeDasharray={config.dashed ? '8,5' : undefined} />
      <path d={d} fill="none" stroke={config.color} strokeWidth={config.width} strokeOpacity="0.85" strokeLinecap="round" strokeDasharray={config.dashed ? '8,5' : undefined} filter="url(#shadow)" />
    </>
  );
}

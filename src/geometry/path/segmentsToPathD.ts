import type { CoordMapper } from '../types';
import type { SegmentSpec } from './segments';
import { controlPointForBend } from './bend';

export function segmentsToPathD(segments: SegmentSpec[], mapper: CoordMapper): string {
  if (segments.length === 0) return '';
  const first = mapper.courtToPixel(segments[0].start);
  let d = `M ${first.x} ${first.y}`;
  for (const segment of segments) {
    const start = mapper.courtToPixel(segment.start);
    const end = mapper.courtToPixel(segment.end);
    if ((segment.bendLevel ?? 0) === 0) {
      d += ` L ${end.x} ${end.y}`;
      continue;
    }
    const c = controlPointForBend(start, end, segment.bendLevel ?? 0);
    d += ` Q ${c.x} ${c.y} ${end.x} ${end.y}`;
  }
  return d;
}

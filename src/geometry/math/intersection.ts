import type { CourtPoint } from '../../domain/types/coords';
import { clampCourtPoint } from './projection';

export function rayToCourtEdge(origin: CourtPoint, toward: CourtPoint): CourtPoint {
  const dx = toward.u - origin.u;
  const dy = toward.v - origin.v;
  const tCandidates: number[] = [];

  if (dx !== 0) {
    tCandidates.push((0 - origin.u) / dx, (1 - origin.u) / dx);
  }
  if (dy !== 0) {
    tCandidates.push((0 - origin.v) / dy, (1 - origin.v) / dy);
  }

  const valid = tCandidates.filter(t => t > 0).sort((a, b) => a - b)[0] ?? 1;
  return clampCourtPoint({ u: origin.u + dx * valid, v: origin.v + dy * valid });
}

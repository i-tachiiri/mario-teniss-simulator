import type { CourtPoint } from '../../domain/types/coords';

export const sub = (a: CourtPoint, b: CourtPoint): CourtPoint => ({ u: a.u - b.u, v: a.v - b.v });
export const add = (a: CourtPoint, b: CourtPoint): CourtPoint => ({ u: a.u + b.u, v: a.v + b.v });
export const mul = (a: CourtPoint, s: number): CourtPoint => ({ u: a.u * s, v: a.v * s });
export const length = (a: CourtPoint): number => Math.hypot(a.u, a.v);
export const normalize = (a: CourtPoint): CourtPoint => {
  const len = length(a) || 1;
  return { u: a.u / len, v: a.v / len };
};

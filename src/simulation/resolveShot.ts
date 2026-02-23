import type { CourtPoint } from '../domain/types/coords';
import type { ShotState, ShotTypeId } from '../domain/types/shot';
import { add, mul, normalize, sub } from '../geometry/math/vector';
import { rayToCourtEdge } from '../geometry/math/intersection';
import { registry } from './registry';

export interface TrajectorySpec {
  points: CourtPoint[];
  markers: { kind: 'bounce1' | 'bounce2'; at: CourtPoint }[];
  segments: { startIdx: number; endIdx: number; bendLevel?: number }[];
}

export interface SceneContext {
  gridCols: number;
  gridRows: number;
}

export interface ShotModel {
  id: ShotTypeId;
  label: string;
  resolve: (shot: ShotState, context: SceneContext) => TrajectorySpec;
}

export function withSecondBounce(shot: ShotState, context: SceneContext, cells: number): CourtPoint {
  const cellSize = 1 / Math.min(context.gridRows, context.gridCols);
  const dir = normalize(sub(shot.bounce1, shot.hitFrom));
  return add(shot.bounce1, mul(dir, cellSize * cells));
}

export function standardResolve(shot: ShotState): TrajectorySpec {
  const end = rayToCourtEdge(shot.bounce1, add(shot.bounce1, sub(shot.bounce1, shot.hitFrom)));
  return {
    points: [shot.hitFrom, shot.bounce1, end],
    markers: [{ kind: 'bounce1', at: shot.bounce1 }],
    segments: [
      { startIdx: 0, endIdx: 1, bendLevel: shot.bendLevel },
      { startIdx: 1, endIdx: 2, bendLevel: shot.bendLevel },
    ],
  };
}

export function resolveShot(shot: ShotState, context: SceneContext): TrajectorySpec {
  const model = registry[shot.typeId] ?? registry.flat;
  return model.resolve(shot, context);
}

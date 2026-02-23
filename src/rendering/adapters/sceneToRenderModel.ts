import type { Scene } from '../../domain/types/scene';
import type { CoordMapper } from '../../geometry/types';
import type { RenderModel } from '../types';
import { resolveShot } from '../../simulation/resolveShot';
import { segmentsToPathD } from '../../geometry/path/segmentsToPathD';

export function sceneToRenderModel(scene: Scene, mapper: CoordMapper): RenderModel {
  const model: RenderModel = {
    paths: [],
    markers: [],
    charIcons: [
      { id: 'self', charId: scene.players.self.charId, posPx: mapper.courtToPixel(scene.players.self.pos), role: 'self' },
      { id: 'opponent', charId: scene.players.opponent.charId, posPx: mapper.courtToPixel(scene.players.opponent.pos), role: 'opponent' },
    ],
    stars: scene.stars.map(star => ({ id: star.id, posPx: mapper.courtToPixel(star.pos) })),
    subtitle: scene.subtitle
      ? {
          text: scene.subtitle.text,
          anchorPx: mapper.courtToPixel(scene.subtitle.anchor),
          rectPx: {
            ...mapper.courtToPixel(scene.subtitle.anchor),
            w: 220,
            h: 44,
          },
        }
      : null,
  };

  if (!scene.shot) return model;
  const spec = resolveShot(scene.shot, { gridCols: 6, gridRows: 10 });
  const segments = spec.segments.map(segment => ({
    start: spec.points[segment.startIdx],
    end: spec.points[segment.endIdx],
    bendLevel: segment.bendLevel,
  }));
  model.paths.push({ id: `shot-${scene.id}`, d: segmentsToPathD(segments, mapper), kind: scene.shot.typeId });
  model.markers = spec.markers.map((marker, index) => ({
    id: `${scene.id}-${index}`,
    kind: marker.kind,
    posPx: mapper.courtToPixel(marker.at),
  }));
  return model;
}

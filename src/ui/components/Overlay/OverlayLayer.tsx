import type { RenderModel } from '../../../rendering/types';
import { CharIcon } from './CharIcon';
import { ShotMarker } from './ShotMarker';
import { ShotPath } from './ShotPath';
import { StarMarker } from './StarMarker';
import { SubtitleOverlay } from './SubtitleOverlay';

export function OverlayLayer({ model, onPlayerDown, onStarDown }: { model: RenderModel; onPlayerDown: (role: 'self' | 'opponent', e: React.PointerEvent) => void; onStarDown: (starId: string, e: React.PointerEvent) => void }) {
  return (
    <>
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {model.paths.map(path => <ShotPath key={path.id} d={path.d} />)}
      </svg>
      {model.markers.map(marker => <ShotMarker key={marker.id} pos={marker.posPx} kind={marker.kind} />)}
      {model.charIcons.map(icon => (
        <CharIcon key={icon.id} charId={icon.charId} pos={icon.posPx} role={icon.role} onPointerDown={e => onPlayerDown(icon.role, e)} />
      ))}
      {model.stars.map(star => <StarMarker key={star.id} pos={star.posPx} onPointerDown={e => onStarDown(star.id, e)} />)}
      <SubtitleOverlay text={model.subtitle?.text ?? ''} x={model.subtitle?.anchorPx.x ?? 0} y={model.subtitle?.anchorPx.y ?? 0} />
    </>
  );
}

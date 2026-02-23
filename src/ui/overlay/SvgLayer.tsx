import type { RefObject } from 'react';
import type { GameStateData } from '../../state/reducers/gameReducer';
import type { GameAction } from '../../state/actions/gameActions';
import { SHOT_CONFIGS } from '../../config';
import { ShotPath } from './ShotPath';
import { ShotPreviewPath } from './ShotPreviewPath';
import { ShotMarker } from './ShotMarker';
import { ForeBackLabel } from './ForeBackLabel';
import { StarMarker } from './StarMarker';
import { computeSceneVisual } from '../../geometry/shot/path';

interface Props {
  state: GameStateData;
  dispatch: React.Dispatch<GameAction>;
  draggingTo: { x: number; y: number } | null;
  containerRef: RefObject<HTMLDivElement | null>;
  onShotMarkerClick: () => void;
}

export function SvgLayer({ state, dispatch, draggingTo, containerRef, onShotMarkerClick }: Props) {
  const selectedShot =
    state.selectedShotId != null ? (state.rallySteps.find(s => s.id === state.selectedShotId) ?? null) : null;
  const lastShot = state.rallySteps.length > 0 ? state.rallySteps[state.rallySteps.length - 1] : null;
  const shotToShow = selectedShot ?? (state.shotPhase.status === 'awaiting' ? null : lastShot);

  const size = containerRef.current
    ? { width: containerRef.current.clientWidth, height: containerRef.current.clientHeight }
    : undefined;

  const finalVisual = shotToShow
    ? computeSceneVisual({
        hitFrom: shotToShow.hitFrom,
        bounce1: { x: shotToShow.bounceAt.x, y: shotToShow.bounceAt.y },
        returnAt: shotToShow.returnAt,
        type: shotToShow.type,
        bendLevel: shotToShow.curveLevel,
        baseCurve: SHOT_CONFIGS[shotToShow.type].curveAmount,
        containerSize: size,
      })
    : null;

  return (
    <>
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 30 }}>
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
            <feOffset dx="1" dy="2" result="offsetblur" />
            <feComponentTransfer><feFuncA type="linear" slope="0.3" /></feComponentTransfer>
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {shotToShow && finalVisual && <ShotPath type={shotToShow.type} pathD={finalVisual.d} />}

        {state.shotPhase.status === 'awaiting' && (
          <ShotPreviewPath
            hitFrom={state.shotPhase.hitFrom}
            bounceAt={{ x: state.shotPhase.bounceAt.x, y: state.shotPhase.bounceAt.y }}
            type={state.selectedShotType}
            dragPos={draggingTo ?? undefined}
            curveLevel={state.shotPhase.curveLevel}
          />
        )}

        {shotToShow && (
          <ForeBackLabel x={shotToShow.returnAt.x} y={shotToShow.returnAt.y} shotSide={shotToShow.shotSide} />
        )}
      </svg>

      {shotToShow && (
        <>
          <ShotMarker
            x={shotToShow.hitFrom.x}
            y={shotToShow.hitFrom.y}
            color={SHOT_CONFIGS[shotToShow.type].color}
            clickable
            onClick={e => {
              e.stopPropagation();
              onShotMarkerClick();
            }}
          />
          <ShotMarker
            x={shotToShow.bounceAt.x}
            y={shotToShow.bounceAt.y}
            color="#ef4444"
            clickable
            onClick={e => {
              e.stopPropagation();
              onShotMarkerClick();
            }}
          />
          {finalVisual?.markers.slice(1).map((marker, idx) => (
            <ShotMarker key={`extra-bounce-${idx}`} x={marker.x} y={marker.y} color="#ef4444" />
          ))}
          {shotToShow.starPos && (
            <StarMarker
              x={shotToShow.starPos.x}
              y={shotToShow.starPos.y}
              containerRef={containerRef}
              onDrop={(x, y) => dispatch({ type: 'SET_STAR_POS', id: shotToShow.id, pos: { x, y } })}
            />
          )}
        </>
      )}

      {state.shotPhase.status === 'awaiting' && (
        <>
          <ShotMarker
            x={state.shotPhase.hitFrom.x}
            y={state.shotPhase.hitFrom.y}
            color={SHOT_CONFIGS[state.selectedShotType].color}
            clickable
            onClick={e => {
              e.stopPropagation();
              onShotMarkerClick();
            }}
          />
          <ShotMarker
            x={state.shotPhase.bounceAt.x}
            y={state.shotPhase.bounceAt.y}
            color="#ef4444"
            clickable
            onClick={e => {
              e.stopPropagation();
              onShotMarkerClick();
            }}
          />
          {state.shotPhase.starPos && (
            <StarMarker
              x={state.shotPhase.starPos.x}
              y={state.shotPhase.starPos.y}
              containerRef={containerRef}
              onDrop={(x, y) => dispatch({ type: 'SET_PENDING_STAR', pos: { x, y } })}
            />
          )}
        </>
      )}
    </>
  );
}

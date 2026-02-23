import type { RefObject } from 'react';
import type { GameStateData } from '../../state/gameReducer';
import type { GameAction } from '../../state/gameActions';
import { SHOT_CONFIGS } from '../../config';
import { ShotPath } from './ShotPath';
import { ShotPreviewPath } from './ShotPreviewPath';
import { ShotMarker } from './ShotMarker';
import { ForeBackLabel } from './ForeBackLabel';
import { StarMarker } from './StarMarker';

interface Props {
  state: GameStateData;
  dispatch: React.Dispatch<GameAction>;
  draggingTo: { x: number; y: number } | null;
  containerRef: RefObject<HTMLDivElement | null>;
}

export function SvgLayer({ state, dispatch, draggingTo, containerRef }: Props) {
  const selectedShot =
    state.selectedShotId != null
      ? (state.rallySteps.find(s => s.id === state.selectedShotId) ?? null)
      : null;
  const lastShot = state.rallySteps.length > 0 ? state.rallySteps[state.rallySteps.length - 1] : null;
  const shotToShow = selectedShot ?? (state.shotPhase.status === 'awaiting' ? null : lastShot);

  return (
    <>
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{ zIndex: 30 }}
      >
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
            <feOffset dx="1" dy="2" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {shotToShow?.ballPathD && <ShotPath type={shotToShow.type} pathD={shotToShow.ballPathD} />}

        {state.shotPhase.status === 'awaiting' && (
          <ShotPreviewPath
            hitFrom={state.shotPhase.hitFrom}
            bounceAt={state.shotPhase.bounceAt}
            type={state.selectedShotType}
            dragPos={draggingTo ?? undefined}
          />
        )}

        {shotToShow && (
          <ForeBackLabel
            x={shotToShow.returnAt.x}
            y={shotToShow.returnAt.y}
            shotSide={shotToShow.shotSide}
          />
        )}
      </svg>

      {shotToShow && (
        <>
          <ShotMarker x={shotToShow.hitFrom.x} y={shotToShow.hitFrom.y} color={SHOT_CONFIGS[shotToShow.type].color} />
          <ShotMarker x={shotToShow.bounceAt.x} y={shotToShow.bounceAt.y} color="#ef4444" />
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
          />
          <ShotMarker
            x={state.shotPhase.bounceAt.x}
            y={state.shotPhase.bounceAt.y}
            color="#ef4444"
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

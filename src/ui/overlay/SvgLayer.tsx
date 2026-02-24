import type { RefObject } from 'react';
import type { GameStateData } from '../../state/reducers/gameReducer';
import type { GameAction } from '../../state/actions/gameActions';
import { SHOT_CONFIGS } from '../../config';
import { ShotPath } from './ShotPath';
import { ShotPreviewPath } from './ShotPreviewPath';
import { ShotMarker } from './ShotMarker';
import { ForeBackLabel } from './ForeBackLabel';
import { StarMarker } from './StarMarker';
import { computeSceneVisual } from '../../geometry/shot/computeShotPathD';

interface Props {
  state: GameStateData;
  dispatch: React.Dispatch<GameAction>;
  draggingTo: { x: number; y: number } | null;
  containerRef: RefObject<HTMLDivElement | null>;
  onShotMarkerClick: () => void;
}

export function SvgLayer({ state, dispatch, draggingTo, containerRef, onShotMarkerClick }: Props) {
  const isEditing = state.shotPhase.status === 'editing';

  const selectedScene =
    state.selectedSceneId != null ? (state.scenes.find(s => s.id === state.selectedSceneId) ?? null) : null;
  const lastScene = state.scenes.length > 0 ? state.scenes[state.scenes.length - 1] : null;
  const sceneToShow = selectedScene ?? lastScene;

  const size = containerRef.current
    ? { width: containerRef.current.clientWidth, height: containerRef.current.clientHeight }
    : undefined;

  const shot = sceneToShow?.shot;

  const editVisual =
    isEditing && sceneToShow && shot
      ? computeSceneVisual({
          hitFrom: shot.hitFrom,
          bounce1: { x: shot.bounceAt.x, y: shot.bounceAt.y },
          returnAt: draggingTo ?? shot.returnAt,
          type: state.selectedShotType,
          bendLevel: shot.curveLevel,
          baseCurve: SHOT_CONFIGS[state.selectedShotType].curveAmount,
          containerSize: size,
        })
      : null;

  const finalVisual =
    !isEditing && sceneToShow && shot
      ? computeSceneVisual({
          hitFrom: shot.hitFrom,
          bounce1: { x: shot.bounceAt.x, y: shot.bounceAt.y },
          returnAt: shot.returnAt,
          type: shot.type,
          bendLevel: shot.curveLevel,
          baseCurve: SHOT_CONFIGS[shot.type].curveAmount,
          containerSize: size,
        })
      : null;

  const activeVisual = editVisual ?? finalVisual;

  // レシーバー位置: bounceAt が下コートなら P1 がレシーバー
  const receiverPos = sceneToShow
    ? (sceneToShow.shot.bounceAt.r >= 5 ? sceneToShow.p1Pos : sceneToShow.p2Pos)
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

        {!isEditing && sceneToShow && shot && finalVisual && (
          <ShotPath type={shot.type} pathD={finalVisual.d} />
        )}

        {isEditing && sceneToShow && shot && (
          <ShotPreviewPath
            hitFrom={shot.hitFrom}
            bounceAt={{ x: shot.bounceAt.x, y: shot.bounceAt.y }}
            type={state.selectedShotType}
            dragPos={draggingTo ?? (receiverPos ?? shot.returnAt)}
            curveLevel={shot.curveLevel}
            containerSize={size}
          />
        )}

        {sceneToShow && shot && (
          <ForeBackLabel x={shot.returnAt.x} y={shot.returnAt.y} shotSide={shot.shotSide} />
        )}
      </svg>

      {sceneToShow && shot && (
        <>
          <ShotMarker
            x={shot.hitFrom.x}
            y={shot.hitFrom.y}
            color={SHOT_CONFIGS[isEditing ? state.selectedShotType : shot.type].color}
            clickable
            onClick={e => {
              e.stopPropagation();
              onShotMarkerClick();
            }}
          />
          <ShotMarker
            x={shot.bounceAt.x}
            y={shot.bounceAt.y}
            color="#ef4444"
            clickable
            onClick={e => {
              e.stopPropagation();
              onShotMarkerClick();
            }}
          />
          {activeVisual?.markers.slice(1).map((marker, idx) => (
            <ShotMarker key={`extra-bounce-${idx}`} x={marker.x} y={marker.y} color="#ef4444" />
          ))}
          {sceneToShow.starPos && (
            <StarMarker
              x={sceneToShow.starPos.x}
              y={sceneToShow.starPos.y}
              containerRef={containerRef}
              onDrop={(x, y) => dispatch({ type: 'SET_STAR_POS', id: sceneToShow.id, pos: { x, y } })}
            />
          )}
        </>
      )}
    </>
  );
}

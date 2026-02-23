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
  const isEditing = state.shotPhase.status === 'editing';

  const selectedShot =
    state.selectedShotId != null ? (state.rallySteps.find(s => s.id === state.selectedShotId) ?? null) : null;
  const lastShot = state.rallySteps.length > 0 ? state.rallySteps[state.rallySteps.length - 1] : null;
  const shotToShow = selectedShot ?? lastShot;

  const size = containerRef.current
    ? { width: containerRef.current.clientWidth, height: containerRef.current.clientHeight }
    : undefined;

  // 編集中: ドラッグ中は draggingTo、それ以外は保存済み returnAt を使ったビジュアル
  const editVisual =
    isEditing && shotToShow
      ? computeSceneVisual({
          hitFrom: shotToShow.hitFrom,
          bounce1: { x: shotToShow.bounceAt.x, y: shotToShow.bounceAt.y },
          returnAt: draggingTo ?? shotToShow.returnAt,
          type: state.selectedShotType,
          bendLevel: shotToShow.curveLevel,
          baseCurve: SHOT_CONFIGS[state.selectedShotType].curveAmount,
          containerSize: size,
        })
      : null;

  // 非編集時（閲覧のみ）のビジュアル
  const finalVisual =
    !isEditing && shotToShow
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

  const activeVisual = editVisual ?? finalVisual;

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

        {/* 非編集: 確定済みパス */}
        {!isEditing && shotToShow && finalVisual && (
          <ShotPath type={shotToShow.type} pathD={finalVisual.d} />
        )}

        {/* 編集中: ライブプレビューパス（ドラッグ位置 or 保存済み returnAt） */}
        {isEditing && shotToShow && (
          <ShotPreviewPath
            hitFrom={shotToShow.hitFrom}
            bounceAt={{ x: shotToShow.bounceAt.x, y: shotToShow.bounceAt.y }}
            type={state.selectedShotType}
            dragPos={draggingTo ?? shotToShow.playerAt}
            curveLevel={shotToShow.curveLevel}
            containerSize={size}
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
            color={SHOT_CONFIGS[isEditing ? state.selectedShotType : shotToShow.type].color}
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
          {activeVisual?.markers.slice(1).map((marker, idx) => (
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
    </>
  );
}

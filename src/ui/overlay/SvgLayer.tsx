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
  dimNonSelected?: boolean;
}

const DIM_OPACITY = 0.35;

export function SvgLayer({ state, dispatch, draggingTo, containerRef, onShotMarkerClick, dimNonSelected = true }: Props) {
  const isEditing = state.shotPhase.status === 'editing';

  const selectedScene =
    state.selectedSceneId != null ? (state.scenes.find(s => s.id === state.selectedSceneId) ?? null) : null;
  const lastScene = state.scenes.length > 0 ? state.scenes[state.scenes.length - 1] : null;
  const sceneToShow = selectedScene ?? lastScene;

  const size = containerRef.current
    ? { width: containerRef.current.clientWidth, height: containerRef.current.clientHeight }
    : undefined;

  // 全ショット（hiddenでないもの）
  const allShots = sceneToShow?.shots.filter(sh => !sh.hidden) ?? [];

  // 選択中ショット
  const selectedShot = allShots.find(sh => sh.id === state.selectedShotId) ?? allShots[allShots.length - 1];

  // 複数ショットのとき番号を表示
  const showNumbers = allShots.length > 1;

  const receiverPos = selectedShot
    ? (selectedShot.bounceAt.r >= 5 ? sceneToShow!.p1Pos : sceneToShow!.p2Pos)
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

        {/* 非選択ショットのパス（全ショット分、確定表示） */}
        {allShots.map(sh => {
          const isSelected = sh.id === selectedShot?.id;
          const shotType = isEditing && isSelected ? state.selectedShotType : sh.type;
          const visual = computeSceneVisual({
            hitFrom: sh.hitFrom,
            bounce1: { x: sh.bounceAt.x, y: sh.bounceAt.y },
            returnAt: isEditing && isSelected ? (draggingTo ?? sh.returnAt) : sh.returnAt,
            type: shotType,
            bendLevel: sh.curveLevel,
            baseCurve: SHOT_CONFIGS[shotType].curveAmount,
            containerSize: size,
          });
          if (!visual) return null;
          return (
            <ShotPath
              key={sh.id}
              type={shotType}
              pathD={visual.d}
              opacity={isSelected ? 1 : (dimNonSelected ? DIM_OPACITY : 1)}
            />
          );
        })}

        {/* 選択中ショットのプレビューパス（editing時） */}
        {isEditing && selectedShot && (
          <ShotPreviewPath
            hitFrom={selectedShot.hitFrom}
            bounceAt={{ x: selectedShot.bounceAt.x, y: selectedShot.bounceAt.y }}
            type={state.selectedShotType}
            dragPos={draggingTo ?? (receiverPos ?? selectedShot.returnAt)}
            curveLevel={selectedShot.curveLevel}
            containerSize={size}
          />
        )}

        {/* フォア/バックラベル（選択中ショットのみ） */}
        {selectedShot && (
          <ForeBackLabel x={selectedShot.returnAt.x} y={selectedShot.returnAt.y} shotSide={selectedShot.shotSide} />
        )}

        {/* ショット番号ラベル */}
        {showNumbers && allShots.map((sh, idx) => {
          const isSelected = sh.id === selectedShot?.id;
          return (
            <g key={`label-${sh.id}`} opacity={isSelected ? 1 : (dimNonSelected ? DIM_OPACITY + 0.15 : 1)}>
              <circle cx={sh.bounceAt.x} cy={sh.bounceAt.y - 18} r={9} fill={isSelected ? '#6366f1' : '#334155'} />
              <text
                x={sh.bounceAt.x}
                y={sh.bounceAt.y - 18}
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontSize="10"
                fontWeight="bold"
              >
                {idx + 1}
              </text>
            </g>
          );
        })}
      </svg>

      {/* DOM層マーカー（選択中ショットのみ clickable） */}
      {allShots.map(sh => {
        const isSelected = sh.id === selectedShot?.id;
        const shotType = isEditing && isSelected ? state.selectedShotType : sh.type;
        const markerOpacity = isSelected ? undefined : (dimNonSelected ? DIM_OPACITY : undefined);

        const visual = computeSceneVisual({
          hitFrom: sh.hitFrom,
          bounce1: { x: sh.bounceAt.x, y: sh.bounceAt.y },
          returnAt: sh.returnAt,
          type: shotType,
          bendLevel: sh.curveLevel,
          baseCurve: SHOT_CONFIGS[shotType].curveAmount,
          containerSize: size,
        });

        return (
          <span key={`markers-${sh.id}`}>
            <ShotMarker
              x={sh.hitFrom.x}
              y={sh.hitFrom.y}
              color={SHOT_CONFIGS[shotType].color}
              clickable={isSelected}
              opacity={markerOpacity}
              onClick={isSelected ? e => { e.stopPropagation(); onShotMarkerClick(); } : undefined}
            />
            <ShotMarker
              x={sh.bounceAt.x}
              y={sh.bounceAt.y}
              color="#ef4444"
              clickable={isSelected}
              opacity={markerOpacity}
              onClick={isSelected ? e => { e.stopPropagation(); onShotMarkerClick(); } : undefined}
            />
            {isSelected && visual?.markers.slice(1).map((marker, idx) => (
              <ShotMarker key={`extra-bounce-${idx}`} x={marker.x} y={marker.y} color="#ef4444" />
            ))}
          </span>
        );
      })}

      {sceneToShow?.starPos && (
        <StarMarker
          x={sceneToShow.starPos.x}
          y={sceneToShow.starPos.y}
          containerRef={containerRef}
          onDrop={(x, y) => dispatch({ type: 'SET_STAR_POS', id: sceneToShow.id, pos: { x, y } })}
        />
      )}
    </>
  );
}

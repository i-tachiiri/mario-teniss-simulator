import type { RefObject } from 'react';
import type { GameStateData } from '../../state/gameReducer';
import type { GameAction } from '../../state/gameActions';
import { SHOT_CONFIGS } from '../../config';
import { computeExtensionEndpoint } from '../../geometry/shotGeometry';
import { ShotPath } from './ShotPath';
import { ShotPreviewPath } from './ShotPreviewPath';
import { ShotMarker } from './ShotMarker';
import { ForeBackLabel } from './ForeBackLabel';
import { StarMarker } from './StarMarker';
import type { PlayingShot } from '../../hooks/useRallyAnimation';

interface Props {
  state: GameStateData;
  dispatch: React.Dispatch<GameAction>;
  /** useDragIcon からリアルタイム更新されるドラッグ位置 */
  draggingTo: { x: number; y: number } | null;
  /** 再生中は編集オーバーレイを非表示にする */
  isPlaying: boolean;
  /** 再生中に表示する現在ショットの線 */
  playingShot: PlayingShot | null;
  /** ☆マーカーのドラッグ基準コンテナ */
  containerRef: RefObject<HTMLDivElement | null>;
}

export function SvgLayer({ state, dispatch, draggingTo, isPlaying, playingShot, containerRef }: Props) {
  if (isPlaying) {
    if (!playingShot) return null;
    return (
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{ zIndex: 30 }}
      >
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
            <feOffset dx="1" dy="2" result="offsetblur" />
            <feComponentTransfer><feFuncA type="linear" slope="0.3" /></feComponentTransfer>
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <ShotPath type={playingShot.type} pathD={playingShot.pathD} />
      </svg>
    );
  }
  // 表示するショットを1本だけ決める
  const selectedShot =
    state.selectedShotId != null
      ? (state.rallySteps.find(s => s.id === state.selectedShotId) ?? null)
      : null;
  const lastShot =
    state.rallySteps.length > 0 ? state.rallySteps[state.rallySteps.length - 1] : null;
  // プレビュー中はそちらを優先（shotToShow を null にしてマーカーを出さない）
  const shotToShow = selectedShot ?? (state.shotPhase.status === 'awaiting' ? null : lastShot);

  // ラリー終了線のパス計算
  let finalPathD: string | null = null;
  let finalExtD: string | null = null;
  const finalConfig = SHOT_CONFIGS[state.finalShot?.type ?? 'strong-flat'];
  if (state.finalShot) {
    const { hitFrom, bounceAt, type } = state.finalShot;
    finalPathD = `M ${hitFrom.x} ${hitFrom.y} L ${bounceAt.x} ${bounceAt.y}`;
    const isShortShot = type === 'drop' || type === 'lob';
    const ext = computeExtensionEndpoint(hitFrom, bounceAt, isShortShot);
    if (ext) {
      finalExtD = `M ${bounceAt.x} ${bounceAt.y} L ${ext.x} ${ext.y}`;
    }
  }

  return (
    <>
      {/* SVG パス・ラベル */}
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

        {/* 現在のショット（1本のみ） */}
        {shotToShow?.ballPathD && (
          <ShotPath type={shotToShow.type} pathD={shotToShow.ballPathD} />
        )}

        {/* ショット入力プレビュー */}
        {state.shotPhase.status === 'awaiting' && (
          <ShotPreviewPath
            hitFrom={state.shotPhase.hitFrom}
            bounceAt={state.shotPhase.bounceAt}
            type={state.selectedShotType}
            dragPos={draggingTo ?? undefined}
          />
        )}

        {/* ラリー終了線 */}
        {finalPathD && (
          <>
            <path
              d={finalPathD}
              fill="none"
              stroke="white"
              strokeWidth={finalConfig.width + 5}
              strokeOpacity="0.6"
              strokeLinecap="round"
            />
            <path
              d={finalPathD}
              fill="none"
              stroke={finalConfig.color}
              strokeWidth={finalConfig.width}
              strokeOpacity="0.85"
              strokeLinecap="round"
              filter="url(#shadow)"
            />
            {finalExtD && (
              <>
                <path
                  d={finalExtD}
                  fill="none"
                  stroke="white"
                  strokeWidth={finalConfig.width + 5}
                  strokeOpacity="0.3"
                  strokeLinecap="round"
                  strokeDasharray="6,4"
                />
                <path
                  d={finalExtD}
                  fill="none"
                  stroke={finalConfig.color}
                  strokeWidth={finalConfig.width}
                  strokeOpacity="0.45"
                  strokeLinecap="round"
                  strokeDasharray="6,4"
                />
              </>
            )}
          </>
        )}

        {/* フォア/バックラベル */}
        {shotToShow && (
          <ForeBackLabel
            x={shotToShow.returnAt.x}
            y={shotToShow.returnAt.y}
            shotSide={shotToShow.shotSide}
          />
        )}
      </svg>

      {/* 現在のショットのマーカー */}
      {shotToShow && (
        <>
          <ShotMarker
            x={shotToShow.hitFrom.x}
            y={shotToShow.hitFrom.y}
            color={SHOT_CONFIGS[shotToShow.type].color}
          />
          <ShotMarker x={shotToShow.bounceAt.x} y={shotToShow.bounceAt.y} color="#ef4444" />
          <ShotMarker
            x={shotToShow.returnAt.x}
            y={shotToShow.returnAt.y}
            color={SHOT_CONFIGS[shotToShow.type].color}
            clickable
            onClick={() => dispatch({ type: 'SELECT_SHOT', id: shotToShow.id })}
          />
        </>
      )}

      {/* ☆マーカー */}
      {shotToShow?.starPos && (
        <StarMarker
          x={shotToShow.starPos.x}
          y={shotToShow.starPos.y}
          containerRef={containerRef}
          onDrop={(x, y) =>
            dispatch({ type: 'SET_STAR_POS', id: shotToShow.id, pos: { x, y } })
          }
        />
      )}

      {/* ラリー終了バウンドマーカー */}
      {state.finalShot && (
        <ShotMarker x={state.finalShot.bounceAt.x} y={state.finalShot.bounceAt.y} color="#ef4444" />
      )}

      {/* プレビューマーカー */}
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
          {/* awaiting中の☆マーカー */}
          {state.shotPhase.starPos && (
            <StarMarker
              x={state.shotPhase.starPos.x}
              y={state.shotPhase.starPos.y}
              containerRef={containerRef}
              onDrop={(x, y) =>
                dispatch({ type: 'SET_PENDING_STAR', pos: { x, y } })
              }
            />
          )}
        </>
      )}
    </>
  );
}

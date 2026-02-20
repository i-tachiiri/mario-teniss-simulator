import { type RefObject } from 'react';
import { useDragIcon } from './useDragIcon';
import type { GameAction } from '../state/gameActions';

interface UseIconDragOptions {
  containerRef: RefObject<HTMLDivElement | null>;
  p1Ref: RefObject<HTMLDivElement | null>;
  p2Ref: RefObject<HTMLDivElement | null>;
  /** バウンド選択後・レシーバーのドロップ待ち */
  isAwaitingReturn: boolean;
  /** 最後のショットのリポジション可能状態 */
  canReposition: boolean;
  activeSide: 'top' | 'bottom';
  /** 最後のショットのバウンドが P1 コート側（bottom）か */
  lastBounceInBottom: boolean;
  dispatch: React.Dispatch<GameAction>;
  onP1Click: () => void;
  onP2Click: () => void;
  /** ShotPreviewPath 用：レシーバードラッグ中の位置更新 */
  onReceiverMove: (x: number, y: number) => void;
  /** レシーバードロップ完了時のコールバック（FINALIZE_RETURN は内部で dispatch 済み） */
  onReceiverDrop: () => void;
}

/**
 * App.tsx の4つの useDragIcon 呼び出しをまとめた専用フック。
 * どのドラッグが有効かの条件式はここに集約される。
 */
export function useIconDrag({
  containerRef,
  p1Ref,
  p2Ref,
  isAwaitingReturn,
  canReposition,
  activeSide,
  lastBounceInBottom,
  dispatch,
  onP1Click,
  onP2Click,
  onReceiverMove,
  onReceiverDrop,
}: UseIconDragOptions): void {
  // P1 フリードラッグ / リポジション（バウンド地点未選択時）
  useDragIcon(
    p1Ref,
    {
      containerRef,
      onMove: (x, y) => {
        if (canReposition && lastBounceInBottom) {
          dispatch({ type: 'UPDATE_LAST_RETURN', iconX: x, iconY: y });
        }
      },
      onDrop: (x, y) => {
        if (canReposition && lastBounceInBottom) {
          dispatch({ type: 'UPDATE_LAST_RETURN', iconX: x, iconY: y });
        } else {
          dispatch({ type: 'SET_PLAYER_POS', player: 'p1', x, y });
        }
      },
      onClick: onP1Click,
    },
    !isAwaitingReturn,
  );

  // P2 フリードラッグ / リポジション（バウンド地点未選択時）
  useDragIcon(
    p2Ref,
    {
      containerRef,
      onMove: (x, y) => {
        if (canReposition && !lastBounceInBottom) {
          dispatch({ type: 'UPDATE_LAST_RETURN', iconX: x, iconY: y });
        }
      },
      onDrop: (x, y) => {
        if (canReposition && !lastBounceInBottom) {
          dispatch({ type: 'UPDATE_LAST_RETURN', iconX: x, iconY: y });
        } else {
          dispatch({ type: 'SET_PLAYER_POS', player: 'p2', x, y });
        }
      },
      onClick: onP2Click,
    },
    !isAwaitingReturn,
  );

  // バウンド選択後: レシーバードラッグ（activeSide=top → P2 が受ける）
  const receiverRef = activeSide === 'top' ? p2Ref : p1Ref;
  useDragIcon(
    receiverRef,
    {
      containerRef,
      onMove: (x, y) => onReceiverMove(x, y),
      onDrop: (x, y) => {
        onReceiverDrop();
        dispatch({ type: 'FINALIZE_RETURN', iconX: x, iconY: y });
      },
    },
    isAwaitingReturn,
  );

  // バウンド選択後: オフザボール側ドラッグ（ヒッター側も動かせる）
  const offBallRef = activeSide === 'top' ? p1Ref : p2Ref;
  const offBallPlayer: 'p1' | 'p2' = activeSide === 'top' ? 'p1' : 'p2';
  useDragIcon(
    offBallRef,
    {
      containerRef,
      onDrop: (x, y) => dispatch({ type: 'SET_PLAYER_POS', player: offBallPlayer, x, y }),
    },
    isAwaitingReturn,
  );
}

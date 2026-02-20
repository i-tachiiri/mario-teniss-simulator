import { useReducer } from 'react';
import { gameReducer, initialState } from './gameReducer';
import type { GameStateData } from './gameReducer';
import type { GameAction } from './gameActions';
import type { FinalShot } from '../types';

export interface GameStateHook {
  state: GameStateData;
  dispatch: React.Dispatch<GameAction>;
  /** バウンド選択後・レシーバーのドロップ待ち */
  isAwaitingReturn: boolean;
  /** ショット確定後・選択なし・ドラッグ待ちなし → リポジションドラッグ可能 */
  canReposition: boolean;
  /**
   * 再生時に使う最終ショット。
   * 明示的に確定済みの finalShot を優先し、なければ awaiting 中のショットを代用する。
   * 「ラリー終了」を押さずに再生した場合でも最後のバウンドを再生できる。
   */
  playbackFinalShot: FinalShot | null;
}

export function useGameState(): GameStateHook {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const isAwaitingReturn = state.shotPhase.status === 'awaiting';

  const canReposition =
    !isAwaitingReturn &&
    state.rallySteps.length > 0 &&
    state.selectedShotId === null;

  const playbackFinalShot: FinalShot | null =
    state.finalShot ??
    (state.shotPhase.status === 'awaiting'
      ? { bounceAt: state.shotPhase.bounceAt, hitFrom: state.shotPhase.hitFrom, type: state.selectedShotType }
      : null);

  return { state, dispatch, isAwaitingReturn, canReposition, playbackFinalShot };
}

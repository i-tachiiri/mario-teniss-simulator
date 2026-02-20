import { useReducer } from 'react';
import { gameReducer, initialState } from './gameReducer';
import type { GameStateData } from './gameReducer';
import type { GameAction } from './gameActions';

export interface GameStateHook {
  state: GameStateData;
  dispatch: React.Dispatch<GameAction>;
  /** バウンド選択後・レシーバーのドロップ待ち */
  isAwaitingReturn: boolean;
  /** ショット確定後・選択なし・ドラッグ待ちなし → リポジションドラッグ可能 */
  canReposition: boolean;
}

export function useGameState(): GameStateHook {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const isAwaitingReturn =
    state.mode === 'shot' &&
    state.shotPhase.status === 'awaiting';

  const canReposition =
    state.mode === 'shot' &&
    !isAwaitingReturn &&
    state.rallySteps.length > 0 &&
    state.shotPhase.status === 'idle' &&
    state.selectedShotId === null;

  return { state, dispatch, isAwaitingReturn, canReposition };
}

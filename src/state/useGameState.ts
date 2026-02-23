import { useReducer } from 'react';
import { gameReducer, initialState, type GameStateData } from './reducers/gameReducer';
import type { GameAction } from './actions/gameActions';

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

  const isAwaitingReturn = state.shotPhase.status === 'awaiting';

  const canReposition = !isAwaitingReturn && state.rallySteps.length > 0 && state.selectedShotId === null;

  return { state, dispatch, isAwaitingReturn, canReposition };
}

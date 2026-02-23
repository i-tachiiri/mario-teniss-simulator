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

  const isAwaitingReturn = state.shotPhase.status === 'editing';

  const canReposition = false;

  return { state, dispatch, isAwaitingReturn, canReposition };
}

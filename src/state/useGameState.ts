import { useReducer } from 'react';
import { gameReducer, initialState, type GameStateData } from './reducers/gameReducer';
import type { GameAction } from './actions/gameActions';
import type { PixelPos, ShotType } from '../domain/types';

export interface GameStateHook {
  state: GameStateData;
  dispatch: React.Dispatch<GameAction>;
  /** バウンド選択後・レシーバーのドロップ待ち */
  isAwaitingReturn: boolean;
  /** ショット確定後・選択なし・ドラッグ待ちなし → リポジションドラッグ可能 */
  canReposition: boolean;
  /** 選択中シーンのP1アイコン位置（派生値） */
  p1IconPos: PixelPos | null;
  /** 選択中シーンのP2アイコン位置（派生値） */
  p2IconPos: PixelPos | null;
  /** 選択中ショットの球種。ショット未選択時はデフォルト球種（派生値） */
  activeShotType: ShotType;
}

export function useGameState(): GameStateHook {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const isAwaitingReturn = state.shotPhase.status === 'editing' && state.selectedShotId !== null;
  const canReposition = false;

  const editId = state.selectedSceneId ?? (state.scenes.length > 0 ? state.scenes[state.scenes.length - 1].id : null);
  const activeScene = editId ? state.scenes.find(s => s.id === editId) : null;

  const p1Default = state.p1DefaultPos ? { x: state.p1DefaultPos.x, y: state.p1DefaultPos.y } : null;
  const p2Default = state.p2DefaultPos ? { x: state.p2DefaultPos.x, y: state.p2DefaultPos.y } : null;
  const p1IconPos: PixelPos | null = activeScene?.p1Pos ?? p1Default ?? null;
  const p2IconPos: PixelPos | null = activeScene?.p2Pos ?? p2Default ?? null;

  const activeShot = activeScene
    ? (state.selectedShotId !== null
        ? (activeScene.shots.find(s => s.id === state.selectedShotId) ?? activeScene.shots[activeScene.shots.length - 1])
        : activeScene.shots[activeScene.shots.length - 1])
    : undefined;
  const activeShotType: ShotType = activeShot?.type ?? state.selectedShotType;

  return { state, dispatch, isAwaitingReturn, canReposition, p1IconPos, p2IconPos, activeShotType };
}

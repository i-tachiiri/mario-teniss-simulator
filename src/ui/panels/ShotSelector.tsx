import { useRef, useState } from 'react';
import type { GameStateData } from '../../state/reducers/gameReducer';
import type { GameAction } from '../../state/actions/gameActions';

interface Props {
  state: GameStateData;
  dispatch: React.Dispatch<GameAction>;
}

export function ShotSelector({ state, dispatch }: Props) {
  const [reorderMode, setReorderMode] = useState(false);
  const timerRef = useRef<number | null>(null);

  const selectedSceneId = state.selectedSceneId ?? state.scenes[state.scenes.length - 1]?.id ?? null;

  const currentScene =
    state.selectedSceneId != null
      ? state.scenes.find(s => s.id === state.selectedSceneId)
      : state.scenes[state.scenes.length - 1];

  const visibleShots = currentScene?.shots.filter(sh => !sh.hidden) ?? [];

  return (
    <div className="flex flex-col gap-2">
      {/* Scene セレクター */}
      <div className="bg-slate-800 rounded-2xl px-3 py-2.5 shadow-lg flex gap-2 items-center flex-wrap">
        <span className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">Scene</span>

        {state.scenes.map((scene, idx) => {
          const active = scene.id === state.selectedSceneId;
          return (
            <button
              key={scene.id}
              className={`w-8 h-8 rounded-full text-xs font-black transition-all duration-150 ${
                active
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-900/50'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-slate-200'
              } ${reorderMode ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-800' : ''}`}
              onPointerDown={() => {
                timerRef.current = window.setTimeout(() => setReorderMode(true), 500);
              }}
              onPointerUp={() => {
                if (timerRef.current !== null) window.clearTimeout(timerRef.current);
              }}
              onPointerLeave={() => {
                if (timerRef.current !== null) window.clearTimeout(timerRef.current);
              }}
              onClick={() => dispatch({ type: 'SELECT_SHOT', id: scene.id })}
            >
              {idx + 1}
            </button>
          );
        })}

        <button
          className="w-8 h-8 rounded-full text-sm font-black bg-slate-700 text-slate-400 hover:bg-indigo-600 hover:text-white border border-slate-600 hover:border-indigo-500 transition-all duration-150"
          onClick={() => dispatch({ type: 'ADD_SCENE' })}
        >
          +
        </button>

        {state.scenes.length > 1 && (
          <button
            className="w-8 h-8 rounded-full text-sm font-black bg-slate-700 text-rose-400 hover:bg-rose-700 hover:text-rose-200 border border-slate-600 hover:border-rose-500 transition-all duration-150"
            onClick={() => dispatch({ type: 'DELETE_SELECTED_SCENE' })}
          >
            ×
          </button>
        )}

        {reorderMode && selectedSceneId !== null && (
          <>
            <button
              className="px-3 h-8 text-xs rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold hover:bg-amber-500/30 transition-colors"
              onClick={() => dispatch({ type: 'MOVE_SCENE', id: selectedSceneId, direction: -1 })}
            >
              ←
            </button>
            <button
              className="px-3 h-8 text-xs rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold hover:bg-amber-500/30 transition-colors"
              onClick={() => dispatch({ type: 'MOVE_SCENE', id: selectedSceneId, direction: 1 })}
            >
              →
            </button>
            <button
              className="px-3 h-8 text-xs rounded-lg bg-slate-700 border border-slate-600 text-slate-300 font-bold hover:bg-slate-600 transition-colors"
              onClick={() => setReorderMode(false)}
            >
              完了
            </button>
          </>
        )}
      </div>

      {/* Shot セレクター（シーン内） */}
      <div className="bg-slate-800 rounded-2xl px-3 py-2.5 shadow-lg flex gap-2 items-center flex-wrap">
        <span className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">Shot</span>

        {visibleShots.map((shot, idx) => {
          const active = shot.id === state.selectedShotId;
          return (
            <button
              key={shot.id}
              className={`w-8 h-8 rounded-full text-xs font-black transition-all duration-150 ${
                active
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-900/50'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-slate-200'
              }`}
              onClick={() => dispatch({ type: 'SELECT_SHOT_IN_SCENE', shotId: shot.id })}
            >
              {idx + 1}
            </button>
          );
        })}

        <button
          className="w-8 h-8 rounded-full text-sm font-black bg-slate-700 text-slate-400 hover:bg-indigo-600 hover:text-white border border-slate-600 hover:border-indigo-500 transition-all duration-150"
          onClick={() => dispatch({ type: 'ADD_SHOT' })}
        >
          +
        </button>

        {visibleShots.length > 0 && (
          <button
            className="w-8 h-8 rounded-full text-sm font-black bg-slate-700 text-rose-400 hover:bg-rose-700 hover:text-rose-200 border border-slate-600 hover:border-rose-500 transition-all duration-150"
            onClick={() => dispatch({ type: 'DELETE_SHOT' })}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

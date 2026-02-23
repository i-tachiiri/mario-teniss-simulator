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

  if (state.rallySteps.length === 0) return null;

  const selectedId = state.selectedShotId ?? state.rallySteps[state.rallySteps.length - 1]?.id ?? null;

  return (
    <div className="bg-slate-800 rounded-2xl px-3 py-2.5 shadow-lg flex gap-2 items-center flex-wrap">
      <span className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">Scene</span>

      {state.rallySteps.map((shot, idx) => {
        const active = shot.id === state.selectedShotId;
        return (
          <button
            key={shot.id}
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
            onClick={() => dispatch({ type: 'SELECT_SHOT', id: shot.id })}
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

      {reorderMode && selectedId !== null && (
        <>
          <button
            className="px-3 h-8 text-xs rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold hover:bg-amber-500/30 transition-colors"
            onClick={() => dispatch({ type: 'MOVE_SCENE', id: selectedId, direction: -1 })}
          >
            ←
          </button>
          <button
            className="px-3 h-8 text-xs rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold hover:bg-amber-500/30 transition-colors"
            onClick={() => dispatch({ type: 'MOVE_SCENE', id: selectedId, direction: 1 })}
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
  );
}

import { useRef, useState } from 'react';
import type { GameStateData } from '../../state/reducers/gameReducer';
import type { GameAction } from '../../state/actions/gameActions';

interface Props {
  state: GameStateData;
  dispatch: React.Dispatch<GameAction>;
}

export function ShotSelector({ state, dispatch }: Props) {
  const hasPending = state.shotPhase.status === 'awaiting';
  const [reorderMode, setReorderMode] = useState(false);
  const timerRef = useRef<number | null>(null);

  if (state.rallySteps.length === 0 && !hasPending) return null;

  const selectedId = state.selectedShotId ?? state.rallySteps[state.rallySteps.length - 1]?.id ?? null;

  return (
    <div className="flex gap-1.5 flex-wrap items-center">
      <span className="text-[9px] text-slate-400 font-bold">Scene:</span>

      {state.rallySteps.map((shot, idx) => {
        const active = shot.id === state.selectedShotId;
        return (
          <button
            key={shot.id}
            className={`w-7 h-7 rounded-full text-xs font-black border-2 transition-all ${
              active ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-600 border-slate-300'
            } ${reorderMode ? 'ring-2 ring-amber-300' : ''}`}
            onPointerDown={() => {
              timerRef.current = window.setTimeout(() => setReorderMode(true), 500);
            }}
            onPointerUp={() => {
              if (timerRef.current !== null) window.clearTimeout(timerRef.current);
            }}
            onPointerLeave={() => {
              if (timerRef.current !== null) window.clearTimeout(timerRef.current);
            }}
            onClick={() => {
              dispatch({ type: 'SELECT_SHOT', id: shot.id });
            }}
          >
            {idx + 1}
          </button>
        );
      })}

      <button
        className="w-7 h-7 rounded-full text-sm font-black border-2 border-slate-300 bg-white text-slate-700"
        onClick={() => dispatch({ type: 'ADD_SCENE' })}
      >
        +
      </button>

      {reorderMode && selectedId !== null && (
        <>
          <button className="px-2 h-7 text-xs rounded bg-amber-100 border border-amber-300" onClick={() => dispatch({ type: 'MOVE_SCENE', id: selectedId, direction: -1 })}>←</button>
          <button className="px-2 h-7 text-xs rounded bg-amber-100 border border-amber-300" onClick={() => dispatch({ type: 'MOVE_SCENE', id: selectedId, direction: 1 })}>→</button>
          <button className="px-2 h-7 text-xs rounded bg-slate-100 border border-slate-300" onClick={() => setReorderMode(false)}>完了</button>
        </>
      )}

      {hasPending && (
        <button
          disabled
          className="w-7 h-7 rounded-full text-xs font-black border-2 border-dashed border-slate-400 bg-white text-slate-400 opacity-60"
        >
          {state.rallySteps.length + 1}
        </button>
      )}
    </div>
  );
}

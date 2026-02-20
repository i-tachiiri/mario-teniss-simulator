import type { GameStateData } from '../../state/gameReducer';
import type { GameAction } from '../../state/gameActions';

interface Props {
  state: GameStateData;
  dispatch: React.Dispatch<GameAction>;
  onShotSelect: (id: number) => void;
}

export function ShotSelector({ state, dispatch, onShotSelect }: Props) {
  if (state.mode !== 'shot') return null;

  const hasPending = state.shotPhase.status === 'awaiting';
  const hasRallyEnd = state.finalShot !== null && !hasPending;

  if (state.rallySteps.length === 0 && !hasPending && !hasRallyEnd) return null;

  return (
    <div className="flex gap-1.5 flex-wrap items-center">
      <span className="text-[9px] text-slate-400 font-bold">Shot:</span>

      {state.rallySteps.map((shot, idx) => {
        const active = shot.id === state.selectedShotId;
        return (
          <button
            key={shot.id}
            className={`w-7 h-7 rounded-full text-xs font-black border-2 transition-all ${
              active
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-slate-100 text-slate-600 border-slate-300'
            }`}
            onClick={() => {
              dispatch({ type: 'SELECT_SHOT', id: shot.id });
              onShotSelect(shot.id);
            }}
          >
            {idx + 1}
          </button>
        );
      })}

      {/* バウンド選択済みで未確定のショット */}
      {hasPending && (
        <button
          disabled
          className="w-7 h-7 rounded-full text-xs font-black border-2 border-dashed border-slate-400 bg-white text-slate-400 opacity-60"
        >
          {state.rallySteps.length + 1}
        </button>
      )}

      {/* ラリー終了ショット */}
      {hasRallyEnd && (
        <button
          disabled
          className="w-7 h-7 rounded-full text-xs font-black border-2 bg-rose-100 text-rose-500 border-rose-400"
        >
          {state.rallySteps.length + 1}
        </button>
      )}
    </div>
  );
}

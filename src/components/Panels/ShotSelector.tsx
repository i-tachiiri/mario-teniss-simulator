import type { GameStateData } from '../../state/gameReducer';
import type { GameAction } from '../../state/gameActions';

interface Props {
  state: GameStateData;
  dispatch: React.Dispatch<GameAction>;
  onShotSelect: () => void;
}

export function ShotSelector({ state, dispatch, onShotSelect }: Props) {
  const hasPending = state.shotPhase.status === 'awaiting';

  if (state.rallySteps.length === 0 && !hasPending) return null;

  return (
    <div className="flex gap-1.5 flex-wrap items-center">
      <span className="text-[9px] text-slate-400 font-bold">Scene:</span>

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
              onShotSelect();
            }}
          >
            {idx + 1}
          </button>
        );
      })}

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

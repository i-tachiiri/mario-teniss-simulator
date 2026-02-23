import type { GameStateData } from '../../state/gameReducer';
import type { GameAction } from '../../state/gameActions';
import { ShotSelector } from './ShotSelector';

interface Props {
  state: GameStateData;
  dispatch: React.Dispatch<GameAction>;
  onShotSelect: () => void;
  onShotButtonClick: () => void;
  onP1Click: () => void;
  onP2Click: () => void;
}

export function EditPanel({
  state,
  dispatch,
  onShotSelect,
  onShotButtonClick,
  onP1Click,
  onP2Click,
}: Props) {
  const pendingPhase = state.shotPhase.status === 'awaiting' ? state.shotPhase : null;
  const currentShot =
    state.selectedShotId != null
      ? state.rallySteps.find(s => s.id === state.selectedShotId)
      : state.rallySteps[state.rallySteps.length - 1];
  const hasStar = pendingPhase ? !!pendingPhase.starPos : !!currentShot?.starPos;
  const starDisabled = !pendingPhase && !currentShot;

  return (
    <div className="flex flex-col gap-2">
      <div className="bg-white rounded-2xl p-3 shadow flex flex-col gap-2">
        <div className="flex gap-1.5 items-center">
          <button
            disabled
            className="h-9 min-w-16 flex-1 px-2 text-[10px] bg-slate-100 text-slate-500 border border-slate-300 rounded-lg font-bold opacity-80"
          >
            ▶ 再生（実装予定）
          </button>
          <button
            disabled={starDisabled}
            className={`h-9 min-w-9 px-2.5 text-base rounded-lg font-bold border transition-colors ${
              hasStar
                ? 'bg-yellow-400 text-yellow-900 border-yellow-500'
                : 'bg-white text-slate-400 border-slate-300'
            } ${starDisabled ? 'opacity-30' : ''}`}
            onClick={() => {
              if (pendingPhase) {
                dispatch({
                  type: 'SET_PENDING_STAR',
                  pos: hasStar ? null : pendingPhase.bounceAt,
                });
              } else {
                if (!currentShot) return;
                dispatch({
                  type: 'SET_STAR_POS',
                  id: currentShot.id,
                  pos: hasStar ? null : currentShot.bounceAt,
                });
              }
            }}
          >
            {hasStar ? '★' : '☆'}
          </button>
          <button
            className="h-9 min-w-16 px-2 text-[10px] bg-slate-100 text-slate-600 border border-slate-300 rounded-lg font-bold"
            onClick={onShotButtonClick}
          >
            SHOT
          </button>
          <button
            className="h-9 min-w-16 px-2 text-[9px] bg-slate-100 text-slate-600 border border-slate-300 rounded-lg font-bold max-w-[64px] truncate"
            onClick={onP1Click}
          >
            自分
          </button>
          <button
            className="h-9 min-w-16 px-2 text-[9px] bg-slate-100 text-slate-600 border border-slate-300 rounded-lg font-bold max-w-[64px] truncate"
            onClick={onP2Click}
          >
            相手
          </button>
          <button
            className="h-9 min-w-16 px-2.5 text-xs bg-white border border-slate-300 text-slate-600 rounded-lg font-bold"
            onClick={() => dispatch({ type: 'UNDO_LAST' })}
          >
            戻す
          </button>
        </div>

        <ShotSelector state={state} dispatch={dispatch} onShotSelect={onShotSelect} />

        <button
          className="text-[10px] text-slate-400 hover:text-rose-500 underline font-bold text-right transition-colors"
          onClick={() => dispatch({ type: 'RESET_ALL' })}
        >
          全てリセット
        </button>
      </div>
    </div>
  );
}

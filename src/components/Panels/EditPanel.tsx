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

export function EditPanel({ state, dispatch, onShotSelect, onShotButtonClick, onP1Click, onP2Click }: Props) {
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
        <div className="flex gap-1.5 items-center flex-wrap">
          <button
            disabled={starDisabled}
            className={`h-9 min-w-10 px-2.5 text-base rounded-lg font-black border shadow-sm ${
              hasStar ? 'bg-yellow-300 text-yellow-900 border-yellow-500' : 'bg-yellow-100 text-yellow-700 border-yellow-400'
            } ${starDisabled ? 'opacity-30' : 'hover:brightness-95'}`}
            onClick={() => {
              if (pendingPhase) {
                dispatch({ type: 'SET_PENDING_STAR', pos: hasStar ? null : pendingPhase.bounceAt });
              } else if (currentShot) {
                dispatch({ type: 'SET_STAR_POS', id: currentShot.id, pos: hasStar ? null : currentShot.bounceAt });
              }
            }}
          >
            ★
          </button>
          <button className="h-9 min-w-16 px-2 text-[10px] bg-slate-100 text-slate-600 border border-slate-300 rounded-lg font-bold" onClick={onShotButtonClick}>SHOT</button>
          <button className="h-9 min-w-16 px-2 text-[9px] bg-slate-100 text-slate-600 border border-slate-300 rounded-lg font-bold" onClick={onP1Click}>自分</button>
          <button className="h-9 min-w-16 px-2 text-[9px] bg-slate-100 text-slate-600 border border-slate-300 rounded-lg font-bold" onClick={onP2Click}>相手</button>
          <button className="h-9 min-w-16 px-2 text-[10px] bg-white border border-slate-300 text-slate-600 rounded-lg font-bold" onClick={() => dispatch({ type: 'SET_SHOT_CURVE', delta: -1 })}>⤺ 右→左</button>
          <button className="h-9 min-w-16 px-2 text-[10px] bg-white border border-slate-300 text-slate-600 rounded-lg font-bold" onClick={() => dispatch({ type: 'SET_SHOT_CURVE', delta: 1 })}>⤻ 左→右</button>
          <button className="h-9 min-w-9 px-2 text-sm bg-rose-50 border border-rose-300 text-rose-600 rounded-lg font-bold" onClick={() => dispatch({ type: 'DELETE_SELECTED_SCENE' })}>🗑</button>
          <button className="h-9 min-w-16 px-2.5 text-xs bg-white border border-slate-300 text-slate-600 rounded-lg font-bold" onClick={() => dispatch({ type: 'UNDO_LAST' })}>戻す</button>
        </div>

        <ShotSelector state={state} dispatch={dispatch} onShotSelect={onShotSelect} />

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-500">字幕</label>
          <input
            value={state.subtitleDraft}
            onChange={e => {
              const subtitle = e.target.value;
              dispatch({ type: 'SET_SUBTITLE_DRAFT', subtitle });
              if (state.selectedShotId !== null) {
                dispatch({ type: 'SET_SCENE_SUBTITLE', id: state.selectedShotId, subtitle });
              }
            }}
            className="h-9 px-2 rounded-lg border border-slate-300 text-xs"
            placeholder="字幕を入力"
          />
        </div>

        <button className="text-[10px] text-slate-400 hover:text-rose-500 underline font-bold text-right transition-colors" onClick={() => dispatch({ type: 'RESET_ALL' })}>
          全てリセット
        </button>
      </div>
    </div>
  );
}

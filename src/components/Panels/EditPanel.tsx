import type { GameStateData } from '../../state/gameReducer';
import type { GameAction } from '../../state/gameActions';
import { ShotHint } from './ShotHint';
import { ShotSelector } from './ShotSelector';

interface Props {
  state: GameStateData;
  dispatch: React.Dispatch<GameAction>;
  isAwaitingReturn: boolean;
  onEnterPlay: () => void;
  onShotSelect: (id: number) => void;
}

export function EditPanel({ state, dispatch, isAwaitingReturn, onEnterPlay, onShotSelect }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="bg-white rounded-2xl p-3 shadow flex flex-col gap-2">
        <div className="flex gap-1.5 items-center">
          <button
            className="flex-1 py-2 text-[9px] bg-rose-100 text-rose-700 border border-rose-300 rounded-lg font-bold"
            onClick={() => dispatch({ type: 'CANCEL_PENDING_SHOT' })}
          >
            ラリー終了
          </button>
          <button
            className="py-2 px-2.5 text-xs bg-white border border-slate-300 text-slate-600 rounded-lg font-bold"
            onClick={() => dispatch({ type: 'UNDO_LAST' })}
          >
            戻す
          </button>
          <button
            className="py-2 px-3 bg-rose-500 text-white font-black rounded-xl text-xs shadow-lg"
            onClick={onEnterPlay}
          >
            ▶ 再生
          </button>
        </div>

        <ShotHint state={state} isAwaitingReturn={isAwaitingReturn} />
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

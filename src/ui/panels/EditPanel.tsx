import type { GameStateData } from '../../state/reducers/gameReducer';
import type { GameAction } from '../../state/actions/gameActions';
import { ShotSelector } from './ShotSelector';
import { toPng } from 'html-to-image';

interface Props {
  state: GameStateData;
  dispatch: React.Dispatch<GameAction>;
  onShotButtonClick: () => void;
  onCharClick: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3,6 5,6 21,6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6m4-6v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

export function EditPanel({ state, dispatch, onShotButtonClick, onCharClick, containerRef }: Props) {
  async function handleDownload() {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const prev = el.style.boxShadow;
    el.style.boxShadow = 'none';
    const textarea = el.querySelector('textarea');
    const prevPlaceholder = textarea?.getAttribute('placeholder') ?? '';
    textarea?.setAttribute('placeholder', '');
    try {
      const dataUrl = await toPng(el, { pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = 'rally.png';
      link.href = dataUrl;
      link.click();
    } finally {
      el.style.boxShadow = prev;
      textarea?.setAttribute('placeholder', prevPlaceholder);
    }
  }

  const currentShot =
    state.selectedShotId != null
      ? state.rallySteps.find(s => s.id === state.selectedShotId)
      : state.rallySteps[state.rallySteps.length - 1];
  const hasStar = !!currentShot?.starPos;
  const starDisabled = !currentShot;

  const btn = 'h-11 rounded-xl flex items-center justify-center transition-colors duration-150 text-xs font-bold';
  const btnSlate = `${btn} bg-slate-700 hover:bg-slate-600 text-slate-200`;
  const btnDanger = `${btn} w-11 bg-slate-700 hover:bg-rose-700 text-slate-400 hover:text-rose-200`;

  return (
    <div className="flex flex-col gap-2">
      <div className="bg-slate-800 rounded-2xl px-3 py-3 shadow-lg flex flex-col gap-2.5">

        {/* Row 1: 球種・キャラ・ダウンロード・★ */}
        <div className="flex items-center gap-2">
          <button
            className={`flex-1 ${btn} bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white tracking-widest`}
            onClick={onShotButtonClick}
          >
            球種
          </button>
          <button
            className={`flex-1 ${btnSlate}`}
            onClick={onCharClick}
          >
            キャラ
          </button>
          <button
            className={`flex-1 ${btn} bg-slate-700 hover:bg-sky-700 text-slate-300 hover:text-sky-100`}
            onClick={handleDownload}
          >
            ダウンロード
          </button>
          <button
            disabled={starDisabled}
            className={`w-11 ${btn} text-lg transition-colors duration-150 ${
              hasStar
                ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-300'
                : 'bg-slate-700 text-slate-500 hover:bg-slate-600 hover:text-yellow-400'
            } ${starDisabled ? 'opacity-30 pointer-events-none' : ''}`}
            onClick={e => {
              e.stopPropagation();
              if (currentShot) {
                dispatch({ type: 'SET_STAR_POS', id: currentShot.id, pos: hasStar ? null : currentShot.bounceAt });
              }
            }}
          >
            ★
          </button>
        </div>

        {/* Row 2: 左曲・右曲・リセット・削除 */}
        <div className="flex items-center gap-2">
          <button
            className={`flex-1 ${btnSlate}`}
            onClick={e => { e.stopPropagation(); dispatch({ type: 'SET_SHOT_CURVE', delta: -1 }); }}
          >
            左曲
          </button>
          <button
            className={`flex-1 ${btnSlate}`}
            onClick={e => { e.stopPropagation(); dispatch({ type: 'SET_SHOT_CURVE', delta: 1 }); }}
          >
            右曲
          </button>
          <button
            className={`flex-1 ${btn} bg-slate-700 hover:bg-rose-800 text-slate-400 hover:text-rose-200`}
            onClick={() => dispatch({ type: 'RESET_CURRENT_SCENE' })}
          >
            リセット
          </button>
          <button className={btnDanger} onClick={() => dispatch({ type: 'DELETE_SELECTED_SCENE' })}>
            <IconTrash />
          </button>
        </div>
      </div>

      <ShotSelector state={state} dispatch={dispatch} />
    </div>
  );
}

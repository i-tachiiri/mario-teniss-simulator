import type { GameStateData } from '../../state/reducers/gameReducer';
import type { GameAction } from '../../state/actions/gameActions';
import { ShotSelector } from './ShotSelector';
import { toPng } from 'html-to-image';

interface Props {
  state: GameStateData;
  dispatch: React.Dispatch<GameAction>;
  onShotButtonClick: () => void;
  onP1Click: () => void;
  onP2Click: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function IconUndo() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7h10a6 6 0 0 1 0 12H7" />
      <polyline points="3,3 3,7 7,7" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12m0 0l-4-4m4 4l4-4" />
      <rect x="3" y="17" width="18" height="4" rx="1" />
    </svg>
  );
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

function IconCurveLeft() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 20 Q2 16 6 4" />
      <polyline points="8,9 6,4 2,7" />
    </svg>
  );
}

function IconCurveRight() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20 Q22 16 18 4" />
      <polyline points="16,9 18,4 22,7" />
    </svg>
  );
}

export function EditPanel({ state, dispatch, onShotButtonClick, onP1Click, onP2Click, containerRef }: Props) {
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

  const iconBtn = 'w-11 h-11 rounded-xl flex items-center justify-center transition-colors duration-150';
  const iconBtnBase = `${iconBtn} bg-slate-700 hover:bg-slate-600 text-slate-300`;
  const iconBtnDanger = `${iconBtn} bg-slate-700 hover:bg-rose-700 text-slate-400 hover:text-rose-200`;

  return (
    <div className="flex flex-col gap-2">
      <div className="bg-slate-800 rounded-2xl px-3 py-3 shadow-lg flex flex-col gap-2.5">

        {/* Row 1: Shot controls */}
        <div className="flex items-center gap-2">
          <button
            className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl text-xs font-black tracking-widest transition-colors duration-150"
            onClick={onShotButtonClick}
          >
            SHOT
          </button>

          <button
            disabled={starDisabled}
            className={`${iconBtn} text-lg transition-colors duration-150 ${
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

          <button
            title="右→左に曲げる"
            className={iconBtnBase}
            onClick={e => { e.stopPropagation(); dispatch({ type: 'SET_SHOT_CURVE', delta: -1 }); }}
          >
            <IconCurveLeft />
          </button>

          <button
            title="左→右に曲げる"
            className={iconBtnBase}
            onClick={e => { e.stopPropagation(); dispatch({ type: 'SET_SHOT_CURVE', delta: 1 }); }}
          >
            <IconCurveRight />
          </button>
        </div>

        {/* Row 2: Players + utility */}
        <div className="flex items-center gap-2">
          <button
            className="flex-1 h-11 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-bold tracking-wide transition-colors duration-150"
            onClick={onP1Click}
          >
            自分
          </button>
          <button
            className="flex-1 h-11 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-bold tracking-wide transition-colors duration-150"
            onClick={onP2Click}
          >
            相手
          </button>

          <div className="w-px h-7 bg-slate-600 mx-0.5" />

          <button title="元に戻す" className={iconBtnBase} onClick={() => dispatch({ type: 'UNDO_LAST' })}>
            <IconUndo />
          </button>
          <button title="画像を保存" className={`${iconBtn} bg-slate-700 hover:bg-sky-700 text-slate-300 hover:text-sky-100 transition-colors duration-150`} onClick={handleDownload}>
            <IconDownload />
          </button>
          <button title="シーンを削除" className={iconBtnDanger} onClick={() => dispatch({ type: 'DELETE_SELECTED_SCENE' })}>
            <IconTrash />
          </button>
        </div>

        <button
          className="text-[10px] text-slate-600 hover:text-rose-400 font-bold text-right transition-colors duration-150"
          onClick={() => dispatch({ type: 'RESET_ALL' })}
        >
          全てリセット
        </button>
      </div>

      <ShotSelector state={state} dispatch={dispatch} />
    </div>
  );
}

import { flushSync } from 'react-dom';
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
  onSetDownloading?: (value: boolean) => void;
}


function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export function EditPanel({ state, dispatch, onShotButtonClick, onCharClick, containerRef, onSetDownloading }: Props) {
  async function handleDownload() {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const prev = el.style.boxShadow;
    el.style.boxShadow = 'none';
    const textarea = el.querySelector('textarea');
    const prevPlaceholder = textarea?.getAttribute('placeholder') ?? '';
    textarea?.setAttribute('placeholder', '');
    flushSync(() => onSetDownloading?.(true));
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    try {
      const dataUrl = await toPng(el, { pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = 'rally.png';
      link.href = dataUrl;
      link.click();
    } finally {
      el.style.boxShadow = prev;
      textarea?.setAttribute('placeholder', prevPlaceholder);
      onSetDownloading?.(false);
    }
  }

  async function handleDownloadCombined() {
    if (!containerRef.current || state.scenes.length < 2) return;

    const el = containerRef.current;
    const prev = el.style.boxShadow;
    el.style.boxShadow = 'none';
    const textarea = el.querySelector('textarea');
    const prevPlaceholder = textarea?.getAttribute('placeholder') ?? '';
    textarea?.setAttribute('placeholder', '');

    const originalSceneId = state.selectedSceneId;
    const dataUrls: string[] = [];

    // アイコンのCSSトランジションをOFFにしてシーン切り替えを瞬時に反映
    const charIcons = Array.from(el.querySelectorAll<HTMLElement>('.char-icon'));
    charIcons.forEach(icon => { icon.style.transition = 'none'; });

    flushSync(() => onSetDownloading?.(true));

    try {
      for (const scene of state.scenes) {
        flushSync(() => dispatch({ type: 'SELECT_SHOT', id: scene.id }));
        await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        const url = await toPng(el, { pixelRatio: 2 });
        dataUrls.push(url);
      }

      const images = await Promise.all(dataUrls.map(loadImage));

      const GAP = 8;
      const totalWidth = images.reduce((s, img) => s + img.width, 0) + GAP * (images.length - 1);
      const maxHeight = Math.max(...images.map(img => img.height));

      const canvas = document.createElement('canvas');
      canvas.width = totalWidth;
      canvas.height = maxHeight;
      const ctx = canvas.getContext('2d')!;

      let x = 0;
      for (const img of images) {
        ctx.drawImage(img, x, 0);
        x += img.width + GAP;
      }

      const link = document.createElement('a');
      link.download = 'rally_combined.png';
      link.href = canvas.toDataURL('image/png');
      link.click();

    } finally {
      el.style.boxShadow = prev;
      textarea?.setAttribute('placeholder', prevPlaceholder);
      const restoreId = originalSceneId ?? state.scenes[state.scenes.length - 1]?.id ?? null;
      flushSync(() => dispatch({ type: 'SELECT_SHOT', id: restoreId }));
      // トランジションを元に戻す（次フレームで復元してガクつきを防ぐ）
      requestAnimationFrame(() => {
        charIcons.forEach(icon => { icon.style.transition = ''; });
      });
      onSetDownloading?.(false);
    }
  }

  const currentScene =
    state.selectedSceneId != null
      ? state.scenes.find(s => s.id === state.selectedSceneId)
      : state.scenes[state.scenes.length - 1];
  const selectedShot =
    currentScene?.shots.find(s => s.id === state.selectedShotId) ??
    currentScene?.shots[currentScene.shots.length - 1];
  const hasStar = !!currentScene?.starPos;
  const starDisabled = !selectedShot || !!selectedShot.hidden;

  const btn = 'h-11 rounded-xl flex items-center justify-center transition-colors duration-150 text-xs font-bold';
  const btnSlate = `${btn} bg-slate-700 hover:bg-slate-600 text-slate-200`;

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
            className={`flex-1 lg:hidden ${btnSlate}`}
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
              if (currentScene && selectedShot && !selectedShot.hidden) {
                dispatch({ type: 'SET_STAR_POS', id: currentScene.id, pos: hasStar ? null : selectedShot.bounceAt });
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
        </div>

        {/* Row 3: くっつけてダウンロード */}
        <button
          className={`${btn} w-full bg-slate-700 hover:bg-sky-700 text-slate-300 hover:text-sky-100`}
          onClick={handleDownloadCombined}
        >
          くっつけてダウンロード
        </button>
      </div>

      <ShotSelector state={state} dispatch={dispatch} />
    </div>
  );
}

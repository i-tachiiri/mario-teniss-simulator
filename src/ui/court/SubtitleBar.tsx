import { useState } from 'react';
import type { GameStateData } from '../../state/reducers/gameReducer';
import type { GameAction } from '../../state/actions/gameActions';

interface Props {
  state: GameStateData;
  dispatch: React.Dispatch<GameAction>;
}

const MIN_FONT = 10;
const MAX_FONT = 32;
const STEP = 2;

export function SubtitleBar({ state, dispatch }: Props) {
  const [fontSize, setFontSize] = useState(16);

  const currentEditId =
    state.selectedShotId ??
    (state.rallySteps.length > 0 ? state.rallySteps[state.rallySteps.length - 1].id : null);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = e.target.value;
    dispatch({ type: 'SET_SUBTITLE_DRAFT', subtitle: text });
    if (currentEditId !== null) {
      dispatch({ type: 'SET_SCENE_SUBTITLE', id: currentEditId, subtitle: text });
    }
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 flex items-stretch gap-2 bg-black/50 px-3 py-2" style={{ height: '72px' }}>
      <textarea
        className="flex-1 bg-transparent text-white resize-none outline-none placeholder-white/35 leading-snug"
        style={{ fontSize }}
        value={state.subtitleDraft}
        onChange={handleChange}
        placeholder="字幕を入力…"
      />
      <div className="flex flex-col items-center justify-center gap-1 shrink-0">
        <button
          className="w-7 h-7 rounded bg-white/10 text-white/80 text-sm font-bold leading-none flex items-center justify-center active:bg-white/20"
          onPointerDown={e => { e.preventDefault(); setFontSize(s => Math.min(s + STEP, MAX_FONT)); }}
          aria-label="文字拡大"
        >
          A<sup className="text-[8px]">+</sup>
        </button>
        <span className="text-white/40 text-[10px] leading-none">{fontSize}</span>
        <button
          className="w-7 h-7 rounded bg-white/10 text-white/80 text-sm font-bold leading-none flex items-center justify-center active:bg-white/20"
          onPointerDown={e => { e.preventDefault(); setFontSize(s => Math.max(s - STEP, MIN_FONT)); }}
          aria-label="文字縮小"
        >
          A<sub className="text-[8px]">−</sub>
        </button>
      </div>
    </div>
  );
}

import type { GameStateData } from '../../state/reducers/gameReducer';
import type { GameAction } from '../../state/actions/gameActions';

interface Props {
  state: GameStateData;
  dispatch: React.Dispatch<GameAction>;
}

export function SubtitleBar({ state, dispatch }: Props) {
  const currentEditId =
    state.selectedShotId ??
    (state.rallySteps.length > 0 ? state.rallySteps[state.rallySteps.length - 1].id : null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const text = e.target.value;
    dispatch({ type: 'SET_SUBTITLE_DRAFT', subtitle: text });
    if (currentEditId !== null) {
      dispatch({ type: 'SET_SCENE_SUBTITLE', id: currentEditId, subtitle: text });
    }
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-center px-4" style={{ height: '76px' }}>
      <input
        type="text"
        className="w-full bg-transparent text-white outline-none placeholder-white/35 font-bold text-center text-base"
        value={state.subtitleDraft}
        onChange={handleChange}
        placeholder="字幕を入力…"
      />
    </div>
  );
}

import type { GameStateData } from '../../state/reducers/gameReducer';
import type { GameAction } from '../../state/actions/gameActions';

interface Props {
  state: GameStateData;
  dispatch: React.Dispatch<GameAction>;
}

export function SubtitleBar({ state, dispatch }: Props) {
  const currentEditId =
    state.selectedSceneId ??
    (state.scenes.length > 0 ? state.scenes[state.scenes.length - 1].id : null);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = e.target.value;
    dispatch({ type: 'SET_SUBTITLE_DRAFT', subtitle: text });
    if (currentEditId !== null) {
      dispatch({ type: 'SET_SCENE_SUBTITLE', id: currentEditId, subtitle: text });
    }
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 flex px-4" style={{ height: '76px' }}>
      <textarea
        className="w-full bg-transparent text-white resize-none outline-none placeholder-white/35 font-bold text-center text-base pt-3"
        value={state.subtitleDraft}
        onChange={handleChange}
        placeholder="コメントを入力…"
      />
    </div>
  );
}

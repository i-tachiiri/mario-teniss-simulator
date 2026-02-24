import { useRef, useState } from 'react';
import { useGameState } from './state/useGameState';
import { useIconDrag } from './hooks/useIconDrag';
import { Court } from './ui/court/Court';
import { SvgLayer } from './ui/overlay/SvgLayer';
import { CharIcon } from './components/CharIcon';
import { EditPanel } from './ui/panels/EditPanel';
import { SubtitleBar } from './ui/court/SubtitleBar';
import { ShotTypeSheet } from './ui/sheets/ShotTypeSheet';
import { CharPickerSheet } from './ui/sheets/CharPickerSheet';
import type { ShotType } from './domain/types';

export function App() {
  const { state, dispatch, isAwaitingReturn, canReposition } = useGameState();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const p1Ref = useRef<HTMLDivElement | null>(null);
  const p2Ref = useRef<HTMLDivElement | null>(null);

  const [shotTypeSheetOpen, setShotTypeSheetOpen] = useState(false);
  const [charSheetOpen, setCharSheetOpen] = useState(false);
  const [selectingPlayer, setSelectingPlayer] = useState<'p1' | 'p2'>('p1');

  const lastShot = state.scenes[state.scenes.length - 1];

  const { receiverDragPos } = useIconDrag({
    containerRef,
    p1Ref,
    p2Ref,
    isAwaitingReturn,
    canReposition,
    activeSide: state.activeSide,
    lastBounceInBottom: lastShot !== undefined && lastShot.shot.bounceAt.r >= 5,
    dispatch,
    onP1Click: () => { setSelectingPlayer('p1'); setCharSheetOpen(true); },
    onP2Click: () => { setSelectingPlayer('p2'); setCharSheetOpen(true); },
  });

  const shotSheetVisible = shotTypeSheetOpen;

  function handleShotTypeSelect(type: ShotType) {
    setShotTypeSheetOpen(false);
    dispatch({ type: 'SET_SHOT_TYPE', shotType: type });
    if (state.selectedSceneId !== null) {
      dispatch({ type: 'SELECT_SHOT', id: null });
    }
  }

  function handleCloseShotSheet() {
    setShotTypeSheetOpen(false);
    if (state.selectedSceneId !== null) {
      dispatch({ type: 'SELECT_SHOT', id: null });
    }
  }

  function handlePickChar(name: string) {
    const newP1 = selectingPlayer === 'p1' ? name : state.p1CharName;
    const newP2 = selectingPlayer === 'p2' ? name : state.p2CharName;
    dispatch({ type: 'SET_CHARACTERS', p1: newP1, p2: newP2 });
    setCharSheetOpen(false);
  }

  return (
    <div className="bg-slate-700 min-h-screen font-sans">
      <div className="max-w-md mx-auto flex flex-col gap-3 px-2 py-2 pb-6">
        <Court
          dispatch={dispatch}
          containerRef={containerRef}
        >
          <SvgLayer
            state={state}
            dispatch={dispatch}
            draggingTo={receiverDragPos}
            containerRef={containerRef}
            onShotMarkerClick={() => setShotTypeSheetOpen(true)}
          />
          <CharIcon
            ref={p1Ref}
            charName={state.p1CharName}
            alt="P1"
            pos={state.p1IconPos}
          />
          <CharIcon
            ref={p2Ref}
            charName={state.p2CharName}
            alt="P2"
            pos={state.p2IconPos}
          />
          <SubtitleBar state={state} dispatch={dispatch} />
        </Court>

        <EditPanel
          state={state}
          dispatch={dispatch}
          onShotButtonClick={() => {
            if (state.selectedSceneId === null && state.scenes.length > 0) {
              dispatch({ type: 'SELECT_SHOT', id: state.scenes[state.scenes.length - 1].id });
            }
            setShotTypeSheetOpen(true);
          }}
          onCharClick={() => { setSelectingPlayer('p1'); setCharSheetOpen(true); }}
          containerRef={containerRef}
        />
      </div>

      <ShotTypeSheet
        open={shotSheetVisible}
        selectedType={state.selectedShotType}
        onClose={handleCloseShotSheet}
        onSelect={handleShotTypeSelect}
      />

      <CharPickerSheet
        open={charSheetOpen}
        selectingPlayer={selectingPlayer}
        p1CharName={state.p1CharName}
        p2CharName={state.p2CharName}
        onClose={() => setCharSheetOpen(false)}
        onSelectPlayer={player => setSelectingPlayer(player)}
        onPickChar={handlePickChar}
      />
    </div>
  );
}

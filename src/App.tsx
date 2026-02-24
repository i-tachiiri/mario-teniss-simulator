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
import { CharPickerContent } from './ui/sheets/CharPickerContent';
import type { ShotType } from './domain/types';

export function App() {
  const { state, dispatch, isAwaitingReturn, canReposition } = useGameState();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const p1Ref = useRef<HTMLDivElement | null>(null);
  const p2Ref = useRef<HTMLDivElement | null>(null);

  const [shotTypeSheetOpen, setShotTypeSheetOpen] = useState(false);
  const [charSheetOpen, setCharSheetOpen] = useState(false);
  const [selectingPlayer, setSelectingPlayer] = useState<'p1' | 'p2'>('p1');
  const [isDownloading, setIsDownloading] = useState(false);

  const lastScene = state.scenes[state.scenes.length - 1];
  const lastShot = lastScene?.shots[lastScene.shots.length - 1];

  const { receiverDragPos } = useIconDrag({
    containerRef,
    p1Ref,
    p2Ref,
    isAwaitingReturn,
    canReposition,
    activeSide: state.activeSide,
    lastBounceInBottom: lastShot !== undefined && lastShot.bounceAt.r >= 5,
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
    <div className="bg-slate-700 h-dvh font-sans overflow-hidden flex flex-col gap-3 lg:flex-row lg:gap-0 lg:justify-center">

      {/* コートカラム: モバイル=全幅, デスクトップ=高さから幅を逆算 */}
      <div
        className="shrink-0 px-2 pt-2 lg:p-0 lg:overflow-hidden"
        style={{ ['--court-w' as string]: 'calc(60dvh - 27px)' }}
      >
        <div className="w-full lg:w-[calc(60dvh-27px)]">
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
              dimNonSelected={!isDownloading}
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
        </div>
      </div>

      {/* コントロールカラム */}
      <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-4 flex flex-col gap-3 lg:flex-none lg:w-80 lg:px-3 lg:py-3">

        {/* キャラ選択: デスクトップのみ常時表示 */}
        <div className="hidden lg:block bg-slate-800 rounded-2xl px-3 py-3 shadow-lg">
          <CharPickerContent
            selectingPlayer={selectingPlayer}
            p1CharName={state.p1CharName}
            p2CharName={state.p2CharName}
            onSelectPlayer={player => setSelectingPlayer(player)}
            onPickChar={handlePickChar}
          />
        </div>

        <EditPanel
          state={state}
          dispatch={dispatch}
          onSetDownloading={setIsDownloading}
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

      {/* キャラシート: モバイルのみ */}
      <div className="lg:hidden">
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
    </div>
  );
}

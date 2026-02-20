import { useRef, useState, useEffect } from 'react';
import { useGameState } from './state/useGameState';
import { useIconDrag } from './hooks/useIconDrag';
import { useRallyAnimation } from './hooks/useRallyAnimation';
import { Court } from './components/Court/Court';
import { SvgLayer } from './components/Overlay/SvgLayer';
import { CharIcon } from './components/CharIcon';
import { Ball } from './components/Ball';
import { EditPanel } from './components/Panels/EditPanel';
import { PlayPanel } from './components/Panels/PlayPanel';
import { ShotTypeSheet } from './components/Sheets/ShotTypeSheet';
import { CharPickerSheet } from './components/Sheets/CharPickerSheet';
import type { ShotType } from './types';

export function App() {
  const { state, dispatch, isAwaitingReturn, canReposition, playbackFinalShot } = useGameState();

  // Refs
  const containerRef = useRef<HTMLDivElement | null>(null);
  const p1Ref = useRef<HTMLDivElement | null>(null);
  const p2Ref = useRef<HTMLDivElement | null>(null);
  const ballRef = useRef<HTMLDivElement | null>(null);

  // ドラッグ中プレビュー用のローカル状態
  const [draggingTo, setDraggingTo] = useState<{ x: number; y: number } | null>(null);

  // アプリモード
  const [appMode, setAppMode] = useState<'edit' | 'play'>('edit');

  // ショット種別シートの dismiss フラグ（バウンド地点変わる度にリセット）
  const [shotSheetDismissed, setShotSheetDismissed] = useState(false);

  // キャラクター選択シート
  const [charSheetOpen, setCharSheetOpen] = useState(false);
  const [selectingPlayer, setSelectingPlayer] = useState<'p1' | 'p2'>('p1');

  // ラリーアニメーション
  const { isPlaying, playRally } = useRallyAnimation({
    state,
    playbackFinalShot,
    p1Ref,
    p2Ref,
    ballRef,
    containerRef,
  });

  // shotPhase / selectedShotId が変わるたびに dismiss フラグをリセット
  // （オートファイナライズで新しいバウンドに切り替わった場合もシートを再表示）
  useEffect(() => {
    setShotSheetDismissed(false);
  }, [state.shotPhase, state.selectedShotId]);

  // =========================
  // ドラッグフック
  // =========================

  const lastShot = state.rallySteps[state.rallySteps.length - 1];

  useIconDrag({
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
    onReceiverMove: (x, y) => setDraggingTo({ x, y }),
    onReceiverDrop: () => setDraggingTo(null),
  });

  // =========================
  // ショット種別シートの表示
  // =========================
  const shotSheetVisible =
    !shotSheetDismissed &&
    (state.shotPhase.status === 'awaiting' || state.selectedShotId !== null);

  // =========================
  // ハンドラー
  // =========================

  function handleEnterPlay() {
    setAppMode('play');
    void playRally();
  }

  function handleShotTypeSelect(type: ShotType) {
    setShotSheetDismissed(true);
    dispatch({ type: 'SET_SHOT_TYPE', shotType: type });
    if (state.selectedShotId !== null) {
      dispatch({ type: 'SELECT_SHOT', id: null });
    }
  }

  function handleCloseShotSheet() {
    setShotSheetDismissed(true);
    if (state.shotPhase.status === 'awaiting') {
      dispatch({ type: 'UNDO_LAST' });
    } else if (state.selectedShotId !== null) {
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
      <div className="max-w-md mx-auto flex flex-col gap-3 px-2 py-3 pb-8">
        <h1 className="text-lg font-black text-center text-white tracking-tighter">
          MARIO TENNIS <span className="text-blue-400">RALLY SIM</span>
        </h1>

        <Court
          state={state}
          dispatch={dispatch}
          isAwaitingReturn={isAwaitingReturn}
          containerRef={containerRef}
        >
          <SvgLayer state={state} dispatch={dispatch} draggingTo={draggingTo} isPlaying={isPlaying} />
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
          <Ball ref={ballRef} />
        </Court>

        {appMode === 'edit' ? (
          <EditPanel
            state={state}
            dispatch={dispatch}
            isAwaitingReturn={isAwaitingReturn}
            onEnterPlay={handleEnterPlay}
            onShotSelect={() => setShotSheetDismissed(false)}
          />
        ) : (
          <PlayPanel
            isPlaying={isPlaying}
            onPlay={() => void playRally()}
            onExitPlay={() => setAppMode('edit')}
          />
        )}
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

import type { GameStateData } from '../../state/gameReducer';

interface Props {
  state: GameStateData;
  isAwaitingReturn: boolean;
}

export function ShotHint({ state, isAwaitingReturn }: Props) {
  // バウンド選択済み → レシーバーがドラッグ中
  if (isAwaitingReturn) {
    const isBottom = state.activeSide === 'bottom';
    return (
      <div
        className={`text-[10px] text-center font-bold rounded-lg py-1.5 px-2 mt-1 ${
          isBottom ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
        }`}
      >
        {isBottom ? '↓ P1' : '↑ P2'} ／ アイコンをドラッグして返球
      </div>
    );
  }

  // 初期状態（ショットなし・バウンド未選択）
  if (state.rallySteps.length === 0 && state.shotPhase.status === 'idle') {
    return (
      <div className="text-[10px] text-center font-bold rounded-lg py-1.5 px-2 mt-1 bg-blue-50 text-blue-600">
        アイコンをドラッグして選手を配置 ／ コートをタップしてショット開始
      </div>
    );
  }

  // バウンド地点選択待ち
  return (
    <div className="text-[10px] text-center font-bold rounded-lg py-1.5 px-2 mt-1 bg-slate-100 text-slate-600">
      バウンド地点を選択（どちらのコートでも可）
    </div>
  );
}

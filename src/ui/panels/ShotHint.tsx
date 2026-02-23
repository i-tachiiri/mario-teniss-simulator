import type { GameStateData } from '../../state/reducers/gameReducer';

interface Props {
  state: GameStateData;
  isAwaitingReturn: boolean;
}

export function ShotHint({ state, isAwaitingReturn }: Props) {
  // 編集中: アイコンドラッグで返球位置を更新
  if (isAwaitingReturn) {
    const isBottom = state.activeSide === 'bottom';
    return (
      <div
        className={`text-[10px] text-center font-bold rounded-lg py-1.5 px-2 mt-1 ${
          isBottom ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
        }`}
      >
        {isBottom ? '↓ P1' : '↑ P2'} ／ コートをタップしてバウンド変更 ／ アイコンをドラッグして返球位置を変更
      </div>
    );
  }

  // 初期状態（シーンなし）
  return (
    <div className="text-[10px] text-center font-bold rounded-lg py-1.5 px-2 mt-1 bg-blue-50 text-blue-600">
      アイコンをドラッグして選手を配置 ／ コートをタップしてショット開始
    </div>
  );
}

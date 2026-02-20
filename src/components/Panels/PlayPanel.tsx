interface Props {
  isPlaying: boolean;
  onPlay: () => void;
  onExitPlay: () => void;
}

export function PlayPanel({ isPlaying, onPlay, onExitPlay }: Props) {
  return (
    <div>
      <div className="bg-white rounded-2xl p-3 shadow flex gap-2 items-center">
        <button
          className="py-2.5 px-4 bg-slate-200 text-slate-700 font-black rounded-xl text-sm"
          onClick={onExitPlay}
        >
          ◀ 編集
        </button>
        <button
          className="flex-1 py-3 bg-rose-500 text-white font-black rounded-xl text-sm shadow-lg disabled:opacity-50"
          disabled={isPlaying}
          onClick={onPlay}
        >
          {isPlaying ? '⏸ 再生中…' : '▶ 再生'}
        </button>
      </div>
    </div>
  );
}

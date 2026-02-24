import { CHARACTERS, charImgPath } from '../../characters';

interface Props {
  selectingPlayer: 'p1' | 'p2';
  p1CharName: string;
  p2CharName: string;
  onSelectPlayer: (player: 'p1' | 'p2') => void;
  onPickChar: (name: string) => void;
  onClose?: () => void;
}

export function CharPickerContent({
  selectingPlayer,
  p1CharName,
  p2CharName,
  onSelectPlayer,
  onPickChar,
  onClose,
}: Props) {
  const slotBase = 'flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all';

  return (
    <div className="flex flex-col gap-3">
      {onClose != null && (
        <div className="flex items-center justify-between">
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              selectingPlayer === 'p1'
                ? 'text-yellow-700 bg-yellow-100'
                : 'text-green-700 bg-green-100'
            }`}
          >
            {selectingPlayer === 'p1' ? 'P1 選択中' : 'P2 選択中'}
          </span>
          <button
            className="text-slate-400 hover:text-slate-700 text-lg font-bold leading-none px-2"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
      )}

      {/* スロット */}
      <div className="flex items-center gap-3">
        <button
          className={`${slotBase} ${
            selectingPlayer === 'p1'
              ? 'border-yellow-400 bg-yellow-50'
              : 'border-transparent bg-slate-100 hover:bg-slate-200'
          }`}
          onClick={() => onSelectPlayer('p1')}
        >
          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
            <img src={charImgPath(p1CharName)} alt="P1" className="w-full h-full object-cover" />
          </div>
          <div className="text-left">
            <div className="text-[9px] font-black text-yellow-600 uppercase">P1 自分</div>
            <div className="text-xs font-bold text-slate-700">{p1CharName}</div>
          </div>
        </button>
        <span className="text-slate-300 font-black">VS</span>
        <button
          className={`${slotBase} ${
            selectingPlayer === 'p2'
              ? 'border-green-400 bg-green-50'
              : 'border-transparent bg-slate-100 hover:bg-slate-200'
          }`}
          onClick={() => onSelectPlayer('p2')}
        >
          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
            <img src={charImgPath(p2CharName)} alt="P2" className="w-full h-full object-cover" />
          </div>
          <div className="text-left">
            <div className="text-[9px] font-black text-green-600 uppercase">P2 相手</div>
            <div className="text-xs font-bold text-slate-700">{p2CharName}</div>
          </div>
        </button>
      </div>

      {/* キャラクターグリッド */}
      <div
        className="grid gap-1.5 max-h-48 overflow-y-auto"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(36px, 1fr))' }}
      >
        {CHARACTERS.map(name => {
          const isP1 = name === p1CharName;
          const isP2 = name === p2CharName;
          let borderClass = 'border-transparent hover:border-slate-400';
          if (isP1 && isP2) {
            borderClass = 'border-yellow-400 outline outline-2 outline-offset-1 outline-green-400';
          } else if (isP1) {
            borderClass = 'border-yellow-400';
          } else if (isP2) {
            borderClass = 'border-green-400';
          }
          return (
            <button
              key={name}
              className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all ${borderClass}`}
              title={name}
              onClick={() => onPickChar(name)}
            >
              <img src={charImgPath(name)} alt={name} className="w-full h-full object-cover" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

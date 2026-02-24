import type { ShotType } from '../../domain/types';
import { BottomSheet } from './BottomSheet';

const SHOT_BUTTONS: { id: ShotType; label: string; className: string }[] = [
  { id: 'strong-flat',  label: '強フラット', className: 'py-2 text-[9px] bg-[#9370DB] text-white rounded-md font-bold' },
  { id: 'strong-top',   label: '強トップ',   className: 'py-2 text-[9px] bg-[#FFA500] text-white rounded-md font-bold' },
  { id: 'strong-slice', label: '強スライス', className: 'py-2 text-[9px] bg-[#6495ED] text-white rounded-md font-bold' },
  { id: 'lob',          label: 'ロブ',        className: 'py-2 text-[9px] bg-[#F0E68C] border border-yellow-500 text-slate-800 rounded-md font-bold' },
  { id: 'drop',         label: 'ドロップ',   className: 'py-2 text-[9px] bg-slate-200 border border-slate-400 rounded-md font-bold text-slate-700' },
  { id: 'weak-flat',    label: '弱フラット', className: 'py-2 text-[9px] bg-[#9370DB]/60 text-white rounded-md font-bold' },
  { id: 'weak-top',     label: '弱トップ',   className: 'py-2 text-[9px] bg-[#FFA500]/60 text-white rounded-md font-bold' },
  { id: 'weak-slice',   label: '弱スライス', className: 'py-2 text-[9px] bg-[#6495ED]/60 text-white rounded-md font-bold' },
  { id: 'jump',         label: '飛びつき',   className: 'py-2 text-[9px] bg-white border border-slate-400 text-slate-600 rounded-md font-bold' },
];

interface Props {
  open: boolean;
  selectedType: ShotType;
  onClose: () => void;
  onSelect: (type: ShotType) => void;
}

export function ShotTypeSheet({ open, selectedType, onClose, onSelect }: Props) {
  return (
    <BottomSheet open={open} onClose={onClose} backdropInteractive={false}>
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Shot Type
          </div>
          <button
            className="text-slate-400 hover:text-slate-700 text-lg font-bold leading-none px-2"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {SHOT_BUTTONS.map(btn => (
            <button
              key={btn.id}
              className={`shot-btn ${btn.className} ${selectedType === btn.id ? 'active' : ''}`}
              onClick={() => onSelect(btn.id)}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </BottomSheet>
  );
}

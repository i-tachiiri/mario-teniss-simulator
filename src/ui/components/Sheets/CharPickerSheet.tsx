import { CHARACTERS } from '../../../characters';

export function CharPickerSheet({ open, onClose, onSelect, title }: { open: boolean; onClose: () => void; onSelect: (charId: string) => void; title: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-end" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-t-xl p-3" onClick={e => e.stopPropagation()}>
        <h3 className="font-black mb-2">{title}</h3>
        <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
          {CHARACTERS.map(char => <button key={char} type="button" onClick={() => onSelect(char)} className="rounded bg-slate-100 h-10 text-xs font-bold">{char}</button>)}
        </div>
      </div>
    </div>
  );
}

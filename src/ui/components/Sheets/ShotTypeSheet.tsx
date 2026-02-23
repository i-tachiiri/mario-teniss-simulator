import { shotModels } from '../../../simulation/registry';
import type { ShotTypeId } from '../../../domain/types/shot';

export function ShotTypeSheet({ open, selected, onClose, onSelect }: { open: boolean; selected: ShotTypeId; onClose: () => void; onSelect: (id: ShotTypeId) => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-end" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-t-xl p-3" onClick={e => e.stopPropagation()}>
        <h3 className="font-black mb-2">ショット選択</h3>
        <div className="grid grid-cols-2 gap-2">
          {shotModels.map(shot => (
            <button key={shot.id} type="button" onClick={() => onSelect(shot.id)} className={`h-10 rounded font-bold ${selected === shot.id ? 'bg-blue-500 text-white' : 'bg-slate-100'}`}>
              {shot.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

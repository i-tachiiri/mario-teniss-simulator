import { DeleteSceneButton } from './DeleteSceneButton';
import { DownloadButton } from './DownloadButton';
import { ButtonIcon } from './ButtonIcon';
import { ShotTypeButton } from './ShotTypeButton';
import { ShotBendControl } from './ShotBendControl';

export function EditToolbar({
  bendLevel,
  onBend,
  onSelf,
  onOpponent,
  onShot,
  onAddStar,
  onDownload,
  onDelete,
  subtitle,
  onSubtitle,
}: {
  bendLevel: number;
  onBend: (v: number) => void;
  onSelf: () => void;
  onOpponent: () => void;
  onShot: () => void;
  onAddStar: () => void;
  onDownload: () => void;
  onDelete: () => void;
  subtitle: string;
  onSubtitle: (v: string) => void;
}) {
  return (
    <div className="bg-slate-700 rounded-lg p-2 space-y-2">
      <div className="grid grid-cols-4 gap-2">
        <ButtonIcon label="自分" onClick={onSelf} />
        <ButtonIcon label="相手" onClick={onOpponent} />
        <ShotTypeButton onClick={onShot} />
        <ButtonIcon label="⭐" className="bg-yellow-500 text-black" onClick={onAddStar} />
        <DownloadButton onClick={onDownload} />
        <DeleteSceneButton onClick={onDelete} />
      </div>
      <ShotBendControl value={bendLevel} onChange={onBend} />
      <input value={subtitle} onChange={e => onSubtitle(e.target.value)} placeholder="字幕" className="w-full h-10 rounded px-3 font-bold" />
    </div>
  );
}

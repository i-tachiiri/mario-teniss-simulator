import { BottomSheet } from './BottomSheet';
import { CharPickerContent } from './CharPickerContent';

interface Props {
  open: boolean;
  selectingPlayer: 'p1' | 'p2';
  p1CharName: string;
  p2CharName: string;
  onClose: () => void;
  onSelectPlayer: (player: 'p1' | 'p2') => void;
  onPickChar: (name: string) => void;
}

export function CharPickerSheet({
  open,
  selectingPlayer,
  p1CharName,
  p2CharName,
  onClose,
  onSelectPlayer,
  onPickChar,
}: Props) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="p-4">
        <CharPickerContent
          selectingPlayer={selectingPlayer}
          p1CharName={p1CharName}
          p2CharName={p2CharName}
          onSelectPlayer={onSelectPlayer}
          onPickChar={onPickChar}
          onClose={onClose}
        />
      </div>
    </BottomSheet>
  );
}

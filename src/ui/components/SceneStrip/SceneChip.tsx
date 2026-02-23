export function SceneChip({ label, active, onClick, onLongPressStart, draggable, onDragStart, onDrop, onDragOver }: {
  label: string;
  active: boolean;
  onClick: () => void;
  onLongPressStart: () => void;
  draggable: boolean;
  onDragStart: () => void;
  onDrop: () => void;
  onDragOver: (e: React.DragEvent) => void;
}) {
  return (
    <button
      type="button"
      draggable={draggable}
      onDragStart={onDragStart}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onPointerDown={onLongPressStart}
      onClick={onClick}
      className={`px-3 h-9 rounded font-bold ${active ? 'bg-blue-500 text-white' : 'bg-slate-200'}`}
    >
      {label}
    </button>
  );
}

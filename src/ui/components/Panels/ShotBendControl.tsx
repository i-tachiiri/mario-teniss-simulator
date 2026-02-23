import { ButtonIcon } from './ButtonIcon';

export function ShotBendControl({ value, onChange }: { value: number; onChange: (next: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      <ButtonIcon label="←" onClick={() => onChange(value - 1)} />
      <div className="h-10 min-w-12 rounded bg-slate-900 text-white grid place-items-center font-bold">{value}</div>
      <ButtonIcon label="→" onClick={() => onChange(value + 1)} />
    </div>
  );
}

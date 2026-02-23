export function ButtonIcon({ label, onClick, className = '' }: { label: string; onClick: () => void; className?: string }) {
  return (
    <button type="button" onClick={onClick} className={`h-10 px-3 rounded bg-slate-800 text-white font-bold text-sm ${className}`}>
      {label}
    </button>
  );
}

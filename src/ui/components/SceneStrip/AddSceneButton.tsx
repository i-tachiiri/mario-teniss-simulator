export function AddSceneButton({ onClick }: { onClick: () => void }) {
  return <button type="button" onClick={onClick} className="h-9 px-3 rounded bg-emerald-500 text-white font-black">＋</button>;
}

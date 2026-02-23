export function SubtitleOverlay({ text, x, y }: { text: string; x: number; y: number }) {
  if (!text) return null;
  return (
    <div className="absolute px-3 py-2 text-white font-black bg-black/70 rounded-lg max-w-[80%] text-center" style={{ left: x, top: y, transform: 'translate(-50%, 0)' }}>
      {text}
    </div>
  );
}

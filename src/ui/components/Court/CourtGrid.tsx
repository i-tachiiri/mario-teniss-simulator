export function CourtGrid() {
  const cells = Array.from({ length: 60 }, (_, index) => index + 1);
  return (
    <div className="absolute inset-0 grid grid-cols-6 grid-rows-10 pointer-events-none">
      {cells.map(cell => (
        <div key={cell} className="border border-white/15 text-white/40 text-[10px] font-bold flex items-center justify-center">
          {cell}
        </div>
      ))}
    </div>
  );
}

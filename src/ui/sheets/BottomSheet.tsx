interface Props {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  backdropInteractive?: boolean;
}

export function BottomSheet({ open, onClose, children, backdropInteractive = true }: Props) {
  return (
    <>
      {/* バックドロップ */}
      <div
        className={`fixed inset-0 bg-black/40 z-[90] ${open ? '' : 'hidden'} ${backdropInteractive ? '' : 'pointer-events-none'}`}
        onClick={backdropInteractive ? onClose : undefined}
      />
      {/* シート本体 */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[100] bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {children}
      </div>
    </>
  );
}

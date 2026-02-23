import { ButtonIcon } from './ButtonIcon';

export function DownloadButton({ onClick }: { onClick: () => void }) {
  return <ButtonIcon label="⬇" onClick={onClick} />;
}

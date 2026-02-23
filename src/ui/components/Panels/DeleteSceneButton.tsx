import { ButtonIcon } from './ButtonIcon';

export function DeleteSceneButton({ onClick }: { onClick: () => void }) {
  return <ButtonIcon label="🗑" onClick={onClick} className="bg-red-700" />;
}

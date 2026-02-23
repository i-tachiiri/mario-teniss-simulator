import { ButtonIcon } from './ButtonIcon';

export function ShotTypeButton({ onClick }: { onClick: () => void }) {
  return <ButtonIcon label="SHOT" onClick={onClick} />;
}

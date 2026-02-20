import type { RefObject } from 'react';
import type { GameAction } from '../../state/gameActions';

interface Props {
  r: number;
  c: number;
  label: string;
  isUpsideDown: boolean;
  isInCourt: boolean;
  borderClasses: string;
  containerRef: RefObject<HTMLDivElement | null>;
  dispatch: React.Dispatch<GameAction>;
}

export function CourtCell({
  r,
  c,
  label,
  isUpsideDown,
  isInCourt,
  borderClasses,
  containerRef,
  dispatch,
}: Props) {
  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const container = containerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const cellRect = el.getBoundingClientRect();
    const x = cellRect.left - containerRect.left + cellRect.width / 2;
    const y = cellRect.top - containerRect.top + cellRect.height / 2;
    dispatch({ type: 'CELL_CLICKED', r, c, x, y });
  }

  const classes = [
    'cell',
    isUpsideDown ? 'upside-down' : '',
    isInCourt ? 'in-court' : '',
    borderClasses,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} onClick={handleClick}>
      <span>{label}</span>
    </div>
  );
}

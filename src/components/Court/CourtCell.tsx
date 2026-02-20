import type { RefObject } from 'react';
import type { GameAction } from '../../state/gameActions';
import { getCellPosition } from '../../geometry/coordUtils';

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
    const container = containerRef.current;
    if (!container) return;
    const pos = getCellPosition(container, e.currentTarget, r, c);
    dispatch({ type: 'CELL_CLICKED', r: pos.r, c: pos.c, x: pos.x, y: pos.y });
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

import type { RefObject } from 'react';
import type { GameAction } from '../../state/actions/gameActions';

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
    const containerRect = container.getBoundingClientRect();
    dispatch({
      type: 'CELL_CLICKED',
      r,
      c,
      x: e.clientX - containerRect.left,
      y: e.clientY - containerRect.top,
    });
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
    <div className={classes} onClick={handleClick} data-row={r} data-col={c}>
      <span>{label}</span>
    </div>
  );
}

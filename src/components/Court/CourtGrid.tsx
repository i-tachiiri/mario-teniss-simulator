import type { RefObject } from 'react';
import { GRID_LABELS } from '../../config';
import type { GameAction } from '../../state/gameActions';
import { CourtCell } from './CourtCell';

interface Props {
  /** 0–4 = top half (P2), 5–9 = bottom half (P1) */
  rowStart: 0 | 5;
  containerRef: RefObject<HTMLDivElement | null>;
  dispatch: React.Dispatch<GameAction>;
  isActive: boolean | null;
}

function getBorderClasses(r: number, c: number): string {
  const classes: string[] = [];
  const isInCourt = r >= 1 && r <= 8 && c >= 1 && c <= 4;
  if (!isInCourt) return '';

  if (c === 1) classes.push('lb-l');
  if (c === 4) classes.push('lb-r');

  if (r >= 5) {
    if (r === 7) classes.push('lb-t');
    if (r === 8) classes.push('lb-b');
    if (c === 2 && (r === 5 || r === 6)) classes.push('lb-r');
  } else {
    if (r === 2) classes.push('lb-b');
    if (r === 1) classes.push('lb-t');
    if (c === 2 && (r === 3 || r === 4)) classes.push('lb-r');
  }

  return classes.join(' ');
}

export function CourtGrid({ rowStart, containerRef, dispatch, isActive }: Props) {
  const rows = GRID_LABELS.slice(rowStart, rowStart + 5);

  const gridClass = [
    'court-grid',
    isActive === true ? 'court-active' : '',
    isActive === false ? 'court-inactive' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={gridClass}>
      {rows.map((row, relR) => {
        const r = rowStart + relR;
        return row.map((label, c) => {
          const isInCourt = r >= 1 && r <= 8 && c >= 1 && c <= 4;
          return (
            <CourtCell
              key={`${r}-${c}`}
              r={r}
              c={c}
              label={label}
              isUpsideDown={rowStart === 0}
              isInCourt={isInCourt}
              borderClasses={getBorderClasses(r, c)}
              containerRef={containerRef}
              dispatch={dispatch}
            />
          );
        });
      })}
    </div>
  );
}

import { useEffect, type RefObject } from 'react';
import type { GameAction } from '../../state/actions/gameActions';
import { CourtGrid } from './CourtGrid';
import { NetDivider } from './NetDivider';

interface Props {
  dispatch: React.Dispatch<GameAction>;
  containerRef: RefObject<HTMLDivElement | null>;
  children?: React.ReactNode;
}

export function Court({ dispatch, containerRef, children }: Props) {
  // デフォルト位置（P1=row9,col2 / P2=row0,col3）を初回マウント時に設定。
  // useEffect は DOM ペイント後に実行されるので getBoundingClientRect が正確に取れる。
  // dispatch が同じ値で2回呼ばれても reducer は冪等なので StrictMode でも問題なし。
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const cells = container.querySelectorAll<HTMLElement>('.cell');
    // Top grid rows 0-4: cells[0..29].  P2 default: row=0, col=3 → index 3
    const p2Cell = cells[3] as HTMLElement | undefined;
    // Bottom grid rows 5-9: cells[30..59].  P1 default: row=9, col=2 → (9-5)*6+2=26 → index 56
    const p1Cell = cells[56] as HTMLElement | undefined;

    if (!p1Cell || !p2Cell) return;

    const p1Rect = p1Cell.getBoundingClientRect();
    const p2Rect = p2Cell.getBoundingClientRect();

    dispatch({
      type: 'SET_DEFAULT_POSITIONS',
      p1Pos: {
        r: 9,
        c: 2,
        x: p1Rect.left - containerRect.left + p1Rect.width / 2,
        y: p1Rect.top - containerRect.top + p1Rect.height / 2,
      },
      p2Pos: {
        r: 0,
        c: 3,
        x: p2Rect.left - containerRect.left + p2Rect.width / 2,
        y: p2Rect.top - containerRect.top + p2Rect.height / 2,
      },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div className="w-full flex flex-col">
      <div ref={containerRef} className="relative flex flex-col items-center court-container-bg">
        <CourtGrid
          rowStart={0}
          containerRef={containerRef}
          dispatch={dispatch}
          isActive={null}
        />
        <NetDivider />
        <CourtGrid
          rowStart={5}
          containerRef={containerRef}
          dispatch={dispatch}
          isActive={null}
        />
        {children}
      </div>
    </div>
  );
}

import { useRef, useState, type RefObject } from 'react';
import type { GameStateData } from '../state/gameReducer';
import type { FinalShot } from '../types';
import { SHOT_CONFIGS, ICON_HALF_SIZE } from '../config';

interface Props {
  state: GameStateData;
  p1Ref: RefObject<HTMLDivElement | null>;
  p2Ref: RefObject<HTMLDivElement | null>;
  ballRef: RefObject<HTMLDivElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
}

/** アイコン要素の中央を (x, y) に配置。CharIcon useEffect と同じロジック。 */
function placeIcon(el: HTMLDivElement, x: number, y: number) {
  el.style.display = 'flex';
  el.style.left = x - ICON_HALF_SIZE + 'px';
  el.style.top = y - ICON_HALF_SIZE + 'px';
}

function makePath(d: string): SVGPathElement {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', d);
  return path;
}

export function useRallyAnimation({ state, p1Ref, p2Ref, ballRef, containerRef }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const abortRef = useRef(false);

  async function playRally(): Promise<void> {
    const { rallySteps, p1Pos, p2Pos } = state;
    // ラリー終了ボタンを押さず再生した場合、awaiting のバウンドを finalShot として扱う
    const finalShot: FinalShot | null =
      state.finalShot ??
      (state.shotPhase.status === 'awaiting'
        ? { bounceAt: state.shotPhase.bounceAt, hitFrom: state.shotPhase.hitFrom, type: state.selectedShotType }
        : null);
    if (rallySteps.length === 0 && !finalShot) return;

    abortRef.current = false;
    setIsPlaying(true);

    const p1El = p1Ref.current;
    const p2El = p2Ref.current;
    const ballEl = ballRef.current;
    if (!p1El || !p2El || !ballEl) { setIsPlaying(false); return; }

    // 初期位置に即スナップ
    p1El.style.transition = 'none';
    p2El.style.transition = 'none';
    if (p1Pos) placeIcon(p1El, p1Pos.x, p1Pos.y);
    if (p2Pos) placeIcon(p2El, p2Pos.x, p2Pos.y);

    // 2フレーム待ってブラウザに描画を確定させる
    await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));

    if (abortRef.current) { setIsPlaying(false); return; }

    ballEl.style.display = 'block';

    for (const shot of rallySteps) {
      if (abortRef.current) break;
      if (!shot.ballPathD) continue;

      const config = SHOT_CONFIGS[shot.type];
      const bounceInBottom = shot.bounceAt.r >= 5;
      const hitter = bounceInBottom ? p2El : p1El;
      const receiver = bounceInBottom ? p1El : p2El;

      const tempPath = makePath(shot.ballPathD);
      const totalLen = tempPath.getTotalLength();

      const speed = config.dashed ? 0.27 : 0.52;
      const duration = Math.max(400, Math.round(totalLen / speed));

      hitter.style.transition = 'none';
      placeIcon(hitter, shot.hitFrom.x, shot.hitFrom.y);

      receiver.style.transition = `all ${duration * 0.85}ms ease-out`;
      placeIcon(receiver, shot.playerAt.x, shot.playerAt.y);

      const startTime = performance.now();
      await new Promise<void>(resolve => {
        const animate = (time: number) => {
          if (abortRef.current) { resolve(); return; }
          const elapsed = time - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const p = tempPath.getPointAtLength(progress * totalLen);
          ballEl.style.left = p.x - 7 + 'px';
          ballEl.style.top = p.y - 7 + 'px';
          if (progress < 1) requestAnimationFrame(animate);
          else resolve();
        };
        requestAnimationFrame(animate);
      });
    }

    // ラリー終了バウンドがある場合
    if (!abortRef.current && finalShot) {
      const lastReturn =
        rallySteps.length > 0
          ? rallySteps[rallySteps.length - 1].returnAt
          : finalShot.hitFrom;

      const { x: bx, y: by } = finalShot.bounceAt;
      const dx = bx - lastReturn.x;
      const dy = by - lastReturn.y;
      const len = Math.hypot(dx, dy);

      if (len > 0) {
        const nx = dx / len;
        const ny = dy / len;

        // drop/lob は短い延長、それ以外はコート端まで計算
        const isShortShot = finalShot.type === 'drop' || finalShot.type === 'lob';
        let endX: number;
        let endY: number;
        if (isShortShot) {
          endX = bx + nx * 60;
          endY = by + ny * 60;
        } else {
          const containerEl = containerRef.current;
          if (containerEl) {
            const W = containerEl.offsetWidth;
            const H = containerEl.offsetHeight;
            let t = Infinity;
            if (nx > 0) t = Math.min(t, (W - bx) / nx);
            else if (nx < 0) t = Math.min(t, -bx / nx);
            if (ny > 0) t = Math.min(t, (H - by) / ny);
            else if (ny < 0) t = Math.min(t, -by / ny);
            endX = bx + (isFinite(t) ? t : 0) * nx;
            endY = by + (isFinite(t) ? t : 0) * ny;
          } else {
            endX = bx + nx * 500;
            endY = by + ny * 500;
          }
        }
        const tempPath = makePath(
          `M ${lastReturn.x} ${lastReturn.y} L ${bx} ${by} L ${endX} ${endY}`,
        );
        const totalLen = tempPath.getTotalLength();
        const duration = Math.max(400, Math.round(totalLen / 0.7));
        const startTime = performance.now();

        await new Promise<void>(resolve => {
          const anim = (time: number) => {
            if (abortRef.current) { resolve(); return; }
            const p = tempPath.getPointAtLength(
              Math.min((time - startTime) / duration, 1) * totalLen,
            );
            ballEl.style.left = p.x - 7 + 'px';
            ballEl.style.top = p.y - 7 + 'px';
            if (time - startTime < duration) requestAnimationFrame(anim);
            else resolve();
          };
          requestAnimationFrame(anim);
        });
      }
    }

    await new Promise<void>(r => setTimeout(r, 400));
    ballEl.style.display = 'none';
    setIsPlaying(false);
  }

  return { isPlaying, playRally };
}

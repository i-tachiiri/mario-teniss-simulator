import { useLayoutEffect, forwardRef } from 'react';
import { charImgPath } from '../characters';
import { ICON_HALF_SIZE } from '../config';

/**
 * ICON POSITION AUTHORITY MODEL（位置管理の2つの権威）
 * =====================================================
 * 1. React state 権威 (gameReducer.ts):
 *    p1IconPos / p2IconPos が正準位置。
 *    ドロップ・UNDO・RESET 後に更新。この useEffect が DOM に同期する。
 *
 * 2. DOM直接権威 (useDragIcon.ts):
 *    ポインタドラッグ中は style.left/top を直接書き換える（再レンダリングなし）。
 *    ドロップ時に dispatch → React state 更新 → この useEffect が同じ値を書き直す。
 *
 * 不変条件: ジェスチャー終了時、両権威は同じ値を持つ。
 * ドラッグ中に React state で left/top を管理するとジャンクが発生するため、意図的に DOM 直接操作を使用。
 */

interface Props {
  charName: string;
  alt: string;
  pos: { x: number; y: number } | null;
}

export const CharIcon = forwardRef<HTMLDivElement, Props>(function CharIcon(
  { charName, alt, pos },
  ref,
) {
  useLayoutEffect(() => {
    const el = (ref as React.RefObject<HTMLDivElement | null>)?.current;
    if (!el) return;
    if (pos) {
      el.style.left    = pos.x - ICON_HALF_SIZE + 'px';
      el.style.top     = pos.y - ICON_HALF_SIZE + 'px';
      el.style.display = 'flex';
    } else {
      el.style.display = 'none';
    }
  }, [pos?.x, pos?.y, ref]);

  // style={{ display: 'none' }} は初期状態を React vdom に登録するためのもの。
  // React は vdom に変化がなければ実際の DOM を上書きしないので、
  // useDragIcon による left/top の直接更新は再レンダー後も維持される。
  return (
    <div ref={ref} className="char-icon" style={{ display: 'none' }}>
      <img src={charImgPath(charName)} alt={alt} className="w-full h-full object-cover" />
    </div>
  );
});

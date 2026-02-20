import { forwardRef } from 'react';

/**
 * テニスボール（絶対配置）。
 * useRallyAnimation が ref を直接操作して位置を更新する。
 */
export const Ball = forwardRef<HTMLDivElement, object>(function Ball(_props, ref) {
  return <div ref={ref} className="tennis-ball" />;
});

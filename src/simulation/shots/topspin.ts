import type { ShotModel } from '../resolveShot';
import { standardResolve } from '../resolveShot';

export const topspin: ShotModel = {
  id: 'topspin',
  label: 'トップスピン',
  resolve: standardResolve,
};

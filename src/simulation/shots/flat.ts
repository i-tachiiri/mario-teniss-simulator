import type { ShotModel } from '../resolveShot';
import { standardResolve } from '../resolveShot';

export const flat: ShotModel = {
  id: 'flat',
  label: 'フラット',
  resolve: standardResolve,
};

import type { ShotModel } from '../resolveShot';
import { standardResolve } from '../resolveShot';

export const lob: ShotModel = {
  id: 'lob',
  label: 'ロブ',
  resolve: standardResolve,
};

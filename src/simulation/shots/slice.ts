import type { ShotModel } from '../resolveShot';
import { standardResolve } from '../resolveShot';

export const slice: ShotModel = {
  id: 'slice',
  label: 'スライス',
  resolve: standardResolve,
};

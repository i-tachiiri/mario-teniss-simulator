import type { ShotModel } from './resolveShot';
import { flat } from './shots/flat';
import { topspin } from './shots/topspin';
import { slice } from './shots/slice';
import { lob } from './shots/lob';
import { drop } from './shots/drop';
import { dive } from './shots/dive';
import { slide } from './shots/slide';

export const shotModels: ShotModel[] = [flat, topspin, slice, lob, drop, dive, slide];

export const registry: Record<string, ShotModel> = Object.fromEntries(shotModels.map(model => [model.id, model]));

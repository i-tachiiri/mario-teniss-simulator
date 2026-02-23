import type { ShotType, ShotConfig } from './types';

/** アイコンは 44×44px。カーソルをアイコン中央に合わせるためのオフセット。
 *  CharIcon.tsx / useDragIcon.ts / useRallyAnimation.ts で共有。*/
export const ICON_HALF_SIZE = 22;

export const GRID_LABELS: string[][] = [
  ['T', 'S', 'R', 'Q', 'P', 'O'],
  ['N', 'L', 'K', 'J', 'I', 'M'],
  ['H', '16', '15', '14', '13', 'G'],
  ['F', '12', '11', '10', '9', 'E'],
  ['D', '8', '7', '6', '5', 'C'],
  ['B', '4', '3', '2', '1', 'A'],
  // --- NET ---
  ['A', '1', '2', '3', '4', 'B'],
  ['C', '5', '6', '7', '8', 'D'],
  ['E', '9', '10', '11', '12', 'F'],
  ['G', '13', '14', '15', '16', 'H'],
  ['I', 'J', 'K', 'L', 'M', 'N'],
  ['O', 'P', 'Q', 'R', 'S', 'T'],
];

export const SHOT_CONFIGS: Record<ShotType, ShotConfig> = {
  'strong-flat': { color: '#9370DB', width: 7, curveAmount: 0 },
  'strong-top': { color: '#FFA500', width: 7, curveAmount: 0 },
  'strong-slice': { color: '#6495ED', width: 7, curveAmount: 0 },
  'drop': { color: '#d4d4d4', width: 7, curveAmount: 0 },
  'weak-flat': { color: '#9370DB', width: 3, curveAmount: 0 },
  'weak-top': { color: '#FFA500', width: 3, curveAmount: 0 },
  'weak-slice': { color: '#6495ED', width: 3, curveAmount: 0 },
  'lob': { color: '#F0E68C', width: 4, dashed: true, curveAmount: 0 },
  'jump': { color: '#aaaaaa', width: 2, dashed: true, curveAmount: 0 },
};

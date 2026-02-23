import type { PixelPos } from '../geometry/types';

export interface RenderModel {
  paths: { id: string; d: string; kind: string }[];
  markers: { id: string; kind: 'bounce1' | 'bounce2'; posPx: PixelPos }[];
  charIcons: { id: string; charId: string; posPx: PixelPos; role: 'self' | 'opponent' }[];
  stars: { id: string; posPx: PixelPos }[];
  subtitle: { text: string; rectPx: { x: number; y: number; w: number; h: number }; anchorPx: PixelPos } | null;
}

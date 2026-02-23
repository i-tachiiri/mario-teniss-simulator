import type { DocumentState } from '../types/document';
import type { Scene } from '../types/scene';

const makeId = () => crypto.randomUUID();

export function newScene(): Scene {
  return {
    id: makeId(),
    court: { presetId: 'default' },
    players: {
      self: { charId: 'ノコノコ', pos: { u: 0.5, v: 0.83 } },
      opponent: { charId: 'ノコノコ', pos: { u: 0.5, v: 0.17 } },
    },
    shot: {
      typeId: 'flat',
      hitFrom: { u: 0.5, v: 0.83 },
      bounce1: { u: 0.5, v: 0.45 },
      bendLevel: 0,
      stopRule: { kind: 'none' },
      showSecondBounceMarker: false,
    },
    subtitle: { text: '', anchor: { u: 0.5, v: 0.06 } },
    stars: [],
  };
}

export function newDocument(): DocumentState {
  const scene = newScene();
  return { scenes: [scene], selectedSceneId: scene.id };
}

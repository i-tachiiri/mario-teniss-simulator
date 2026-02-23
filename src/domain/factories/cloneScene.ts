import type { Scene } from '../types/scene';

export function cloneScene(scene: Scene): Scene {
  return {
    ...scene,
    id: crypto.randomUUID(),
    players: {
      self: { ...scene.players.self, pos: { ...scene.players.self.pos } },
      opponent: { ...scene.players.opponent, pos: { ...scene.players.opponent.pos } },
    },
    shot: scene.shot
      ? {
          ...scene.shot,
          hitFrom: { ...scene.shot.hitFrom },
          bounce1: { ...scene.shot.bounce1 },
          stopRule: { ...scene.shot.stopRule },
        }
      : undefined,
    subtitle: scene.subtitle ? { ...scene.subtitle, anchor: { ...scene.subtitle.anchor } } : undefined,
    stars: scene.stars.map(star => ({ ...star, pos: { ...star.pos }, id: crypto.randomUUID() })),
  };
}

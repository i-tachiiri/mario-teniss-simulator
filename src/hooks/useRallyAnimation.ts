import { useState } from 'react';
import type { ShotType } from '../domain/types';

export interface PlayingShot { pathD: string; type: ShotType }

export function useRallyAnimation() {
  const [isPlaying] = useState(false);
  const [playingShot] = useState<PlayingShot | null>(null);

  async function playRally(): Promise<void> {
    return Promise.resolve();
  }

  return { isPlaying, playingShot, playRally };
}

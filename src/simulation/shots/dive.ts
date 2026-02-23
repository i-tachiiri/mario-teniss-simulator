import type { ShotModel } from '../resolveShot';
import { withSecondBounce } from '../resolveShot';

export const dive: ShotModel = {
  id: 'dive',
  label: '飛びつき',
  resolve: (shot, context) => {
    const bounce2 = withSecondBounce(shot, context, 3);
    return {
      points: [shot.hitFrom, shot.bounce1, bounce2],
      markers: [
        { kind: 'bounce1', at: shot.bounce1 },
        { kind: 'bounce2', at: bounce2 },
      ],
      segments: [
        { startIdx: 0, endIdx: 1, bendLevel: shot.bendLevel },
        { startIdx: 1, endIdx: 2, bendLevel: shot.bendLevel },
      ],
    };
  },
};

import type { SceneId } from './ids';
import type { Scene } from './scene';

export interface DocumentState {
  scenes: Scene[];
  selectedSceneId: SceneId;
}

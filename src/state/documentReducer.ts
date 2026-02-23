import { cloneScene } from '../domain/factories/cloneScene';
import { newDocument } from '../domain/factories/newDocument';
import type { DocumentState } from '../domain/types/document';
import type { CourtPoint } from '../domain/types/coords';
import type { SceneId } from '../domain/types/ids';
import type { ShotTypeId } from '../domain/types/shot';

export type DocumentAction =
  | { type: 'selectScene'; sceneId: SceneId }
  | { type: 'setChar'; sceneId: SceneId; role: 'self' | 'opponent'; charId: string }
  | { type: 'movePlayer'; sceneId: SceneId; role: 'self' | 'opponent'; pos: CourtPoint }
  | { type: 'setShotType'; sceneId: SceneId; shotTypeId: ShotTypeId }
  | { type: 'setBounce1'; sceneId: SceneId; pos: CourtPoint }
  | { type: 'setBendLevel'; sceneId: SceneId; bendLevel: number }
  | { type: 'setSubtitleText'; sceneId: SceneId; text: string }
  | { type: 'moveSubtitle'; sceneId: SceneId; pos: CourtPoint }
  | { type: 'addScene'; sourceSceneId: SceneId }
  | { type: 'deleteScene'; sceneId: SceneId }
  | { type: 'reorderScenes'; activeId: SceneId; overId: SceneId }
  | { type: 'addStar'; sceneId: SceneId }
  | { type: 'moveStar'; sceneId: SceneId; starId: string; pos: CourtPoint };

const findScene = (state: DocumentState, id: SceneId) => state.scenes.find(scene => scene.id === id);

export function documentReducer(state: DocumentState, action: DocumentAction): DocumentState {
  if (action.type === 'selectScene') return { ...state, selectedSceneId: action.sceneId };
  if (action.type === 'addScene') {
    const source = findScene(state, action.sourceSceneId) ?? findScene(state, state.selectedSceneId);
    if (!source) return state;
    const clone = cloneScene(source);
    return { ...state, scenes: [...state.scenes, clone], selectedSceneId: clone.id };
  }
  if (action.type === 'deleteScene') {
    if (state.scenes.length <= 1) return state;
    const nextScenes = state.scenes.filter(scene => scene.id !== action.sceneId);
    const selected = nextScenes[Math.max(0, nextScenes.length - 1)]?.id ?? state.selectedSceneId;
    return { ...state, scenes: nextScenes, selectedSceneId: selected };
  }
  if (action.type === 'reorderScenes') {
    const oldIndex = state.scenes.findIndex(scene => scene.id === action.activeId);
    const newIndex = state.scenes.findIndex(scene => scene.id === action.overId);
    if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return state;
    const next = [...state.scenes];
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved);
    return { ...state, scenes: next };
  }

  return {
    ...state,
    scenes: state.scenes.map(scene => {
      if (scene.id !== ('sceneId' in action ? action.sceneId : '')) return scene;
      switch (action.type) {
        case 'setChar':
          return { ...scene, players: { ...scene.players, [action.role]: { ...scene.players[action.role], charId: action.charId } } };
        case 'movePlayer':
          return { ...scene, players: { ...scene.players, [action.role]: { ...scene.players[action.role], pos: action.pos } } };
        case 'setShotType': {
          const stopRule: import('../domain/types/shot').StopRule = action.shotTypeId === 'drop'
            ? { kind: 'secondBounceDistanceCells', value: 1 }
            : action.shotTypeId === 'dive' || action.shotTypeId === 'slide'
              ? { kind: 'secondBounceDistanceCells', value: 3 }
              : { kind: 'none' };
          return {
            ...scene,
            shot: {
              ...(scene.shot ?? { typeId: 'flat', hitFrom: scene.players.self.pos, bounce1: { u: 0.5, v: 0.45 }, bendLevel: 0, stopRule: { kind: 'none' as const }, showSecondBounceMarker: false }),
              typeId: action.shotTypeId,
              hitFrom: scene.players.self.pos,
              stopRule,
              showSecondBounceMarker: stopRule.kind !== 'none',
            },
          };
        }
        case 'setBounce1':
          return scene.shot ? { ...scene, shot: { ...scene.shot, bounce1: action.pos } } : scene;
        case 'setBendLevel':
          return scene.shot ? { ...scene, shot: { ...scene.shot, bendLevel: Math.max(-3, Math.min(3, action.bendLevel)) } } : scene;
        case 'setSubtitleText':
          return { ...scene, subtitle: { ...(scene.subtitle ?? { anchor: { u: 0.5, v: 0.06 }, text: '' }), text: action.text } };
        case 'moveSubtitle':
          return { ...scene, subtitle: { ...(scene.subtitle ?? { text: '', anchor: action.pos }), anchor: action.pos } };
        case 'addStar':
          return { ...scene, stars: [...scene.stars, { id: crypto.randomUUID(), pos: { u: 0.5, v: 0.5 } }] };
        case 'moveStar':
          return { ...scene, stars: scene.stars.map(star => (star.id === action.starId ? { ...star, pos: action.pos } : star)) };
        default:
          return scene;
      }
    }),
  };
}

export const initialDocumentState = newDocument();

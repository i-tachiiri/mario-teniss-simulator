import type { PixelPos, Position, Scene, Shot, ShotPhase, ShotType } from '../../domain/types';
import type { GameAction } from '../actions/gameActions';
import { computeReturnAndSide } from '../../geometry/shot/returnAndSide';
import { getHitFrom } from '../../geometry/shot/hitFrom';
import { positionToPixelPos } from '../../geometry/coord/coordUtils';

export interface GameStateData {
  p1Pos: Position | null;
  p2Pos: Position | null;
  p1DefaultPos: Position | null;
  p2DefaultPos: Position | null;
  p1IconPos: PixelPos | null;
  p2IconPos: PixelPos | null;
  scenes: Scene[];
  shotPhase: ShotPhase;
  selectedShotType: ShotType;
  activeSide: 'top' | 'bottom';
  selectedSceneId: number | null;
  p1CharName: string;
  p2CharName: string;
  subtitleDraft: string;
}

export const initialState: GameStateData = {
  p1Pos: null,
  p2Pos: null,
  p1DefaultPos: null,
  p2DefaultPos: null,
  p1IconPos: null,
  p2IconPos: null,
  scenes: [],
  shotPhase: { status: 'idle' },
  selectedShotType: 'strong-flat',
  activeSide: 'top',
  selectedSceneId: null,
  p1CharName: 'ノコノコ',
  p2CharName: 'ノコノコ',
  subtitleDraft: '',
};

const clampCurve = (v: number) => Math.max(-10, Math.min(10, v));
const newId = () => Date.now() + Math.floor(Math.random() * 1000);

/** 現在編集中のシーンIDを返す（selectedSceneId → 最終シーン → null） */
function getEditId(state: GameStateData): number | null {
  return state.selectedSceneId ?? (state.scenes.length > 0 ? state.scenes[state.scenes.length - 1].id : null);
}

export function gameReducer(state: GameStateData, action: GameAction): GameStateData {
  switch (action.type) {
    case 'SET_SHOT_TYPE': {
      const editId = getEditId(state);
      if (editId !== null) {
        return {
          ...state,
          selectedShotType: action.shotType,
          scenes: state.scenes.map(s =>
            s.id === editId ? { ...s, shot: { ...s.shot, type: action.shotType } } : s
          ),
        };
      }
      return { ...state, selectedShotType: action.shotType };
    }

    case 'SET_SHOT_CURVE': {
      const editId = getEditId(state);
      if (!editId) return state;
      return {
        ...state,
        scenes: state.scenes.map(s =>
          s.id === editId
            ? { ...s, shot: { ...s.shot, curveLevel: clampCurve(s.shot.curveLevel + action.delta) } }
            : s
        ),
      };
    }

    case 'SET_PLAYER_POS': {
      const pos: Position = { r: 0, c: 0, x: action.x, y: action.y };
      const iconPos: PixelPos = { x: action.x, y: action.y };
      const baseState = action.player === 'p1'
        ? { ...state, p1Pos: pos, p1IconPos: iconPos }
        : { ...state, p2Pos: pos, p2IconPos: iconPos };

      const editId = state.shotPhase.status === 'editing' ? getEditId(state) : null;
      if (editId !== null) {
        const isHitter = (action.player === 'p1' && state.activeSide === 'top') ||
                         (action.player === 'p2' && state.activeSide === 'bottom');
        const posKey = action.player === 'p1' ? 'p1Pos' : 'p2Pos';
        return {
          ...baseState,
          scenes: state.scenes.map(s => {
            if (s.id !== editId) return s;
            return {
              ...s,
              [posKey]: iconPos,
              shot: isHitter ? { ...s.shot, hitFrom: iconPos } : s.shot,
            };
          }),
        };
      }
      return baseState;
    }

    case 'SET_DEFAULT_POSITIONS':
      return {
        ...state,
        p1Pos: action.p1Pos,
        p2Pos: action.p2Pos,
        p1DefaultPos: action.p1Pos,
        p2DefaultPos: action.p2Pos,
        p1IconPos: { x: action.p1Pos.x, y: action.p1Pos.y },
        p2IconPos: { x: action.p2Pos.x, y: action.p2Pos.y },
      };

    case 'SET_CHARACTERS':
      return { ...state, p1CharName: action.p1, p2CharName: action.p2 };

    case 'CELL_CLICKED': {
      const activeSide: 'top' | 'bottom' = action.r < 5 ? 'top' : 'bottom';
      const bounceAt: Position = { r: action.r, c: action.c, x: action.x, y: action.y };
      const editId = getEditId(state);

      if (editId !== null) {
        const priorScenes = state.scenes.filter(s => s.id !== editId);
        const hitFrom = getHitFrom(priorScenes, activeSide, state.p1Pos, state.p2Pos);
        return {
          ...state,
          activeSide,
          shotPhase: { status: 'editing' },
          scenes: state.scenes.map(s =>
            s.id === editId ? { ...s, shot: { ...s.shot, bounceAt, hitFrom } } : s
          ),
        };
      }

      const hitFrom = getHitFrom([], activeSide, state.p1Pos, state.p2Pos);
      const receiverIconPos = activeSide === 'top' ? state.p2IconPos : state.p1IconPos;
      const defaultReturnAt = receiverIconPos ?? { x: bounceAt.x, y: bounceAt.y };
      const id = newId();
      const shot: Shot = {
        hitFrom,
        bounceAt,
        returnAt: defaultReturnAt,
        shotSide: 'forehand',
        type: state.selectedShotType,
        curveLevel: 0,
      };
      const scene: Scene = {
        id,
        p1Pos: state.p1IconPos ?? { x: bounceAt.x, y: bounceAt.y },
        p2Pos: state.p2IconPos ?? { x: bounceAt.x, y: bounceAt.y },
        subtitle: state.subtitleDraft,
        shot,
      };
      return {
        ...state,
        activeSide,
        shotPhase: { status: 'editing' },
        selectedSceneId: id,
        scenes: [scene],
      };
    }

    case 'FINALIZE_RETURN': {
      const editId = getEditId(state);
      if (!editId) return state;
      const scene = state.scenes.find(s => s.id === editId);
      if (!scene) return state;

      const { returnAt, shotSide } = computeReturnAndSide(
        scene.shot.hitFrom,
        positionToPixelPos(scene.shot.bounceAt),
        action.iconX,
        action.iconY,
        state.activeSide,
      );
      const bounceInBottom = scene.shot.bounceAt.r >= 5;
      const receiverPos: PixelPos = { x: action.iconX, y: action.iconY };
      return {
        ...state,
        scenes: state.scenes.map(s =>
          s.id === editId
            ? {
                ...s,
                p1Pos: bounceInBottom ? receiverPos : s.p1Pos,
                p2Pos: !bounceInBottom ? receiverPos : s.p2Pos,
                shot: { ...s.shot, returnAt, shotSide },
              }
            : s
        ),
        p1IconPos: bounceInBottom ? receiverPos : state.p1IconPos,
        p2IconPos: !bounceInBottom ? receiverPos : state.p2IconPos,
      };
    }

    case 'SELECT_SHOT': {
      if (action.id !== null) {
        const scene = state.scenes.find(s => s.id === action.id);
        if (scene) {
          const activeSide: 'top' | 'bottom' = scene.shot.bounceAt.r < 5 ? 'top' : 'bottom';
          return {
            ...state,
            selectedSceneId: action.id,
            selectedShotType: scene.shot.type,
            subtitleDraft: scene.subtitle,
            activeSide,
            shotPhase: { status: 'editing' },
            p1IconPos: scene.p1Pos,
            p2IconPos: scene.p2Pos,
          };
        }
      }
      return { ...state, selectedSceneId: action.id };
    }

    case 'UPDATE_LAST_RETURN': {
      if (state.scenes.length === 0) return state;
      const lastScene = state.scenes[state.scenes.length - 1];
      const { returnAt, shotSide } = computeReturnAndSide(
        lastScene.shot.hitFrom,
        positionToPixelPos(lastScene.shot.bounceAt),
        action.iconX,
        action.iconY,
        lastScene.shot.bounceAt.r >= 5 ? 'bottom' : 'top',
      );
      const receiverPos: PixelPos = { x: action.iconX, y: action.iconY };
      const bounceInBottom = lastScene.shot.bounceAt.r >= 5;
      const updatedScene: Scene = {
        ...lastScene,
        p1Pos: bounceInBottom ? receiverPos : lastScene.p1Pos,
        p2Pos: !bounceInBottom ? receiverPos : lastScene.p2Pos,
        shot: { ...lastScene.shot, returnAt, shotSide },
      };
      return { ...state, scenes: [...state.scenes.slice(0, -1), updatedScene] };
    }

    case 'ADD_SCENE': {
      if (state.scenes.length === 0) return state;
      const source =
        state.selectedSceneId !== null
          ? state.scenes.find(s => s.id === state.selectedSceneId) ?? state.scenes[state.scenes.length - 1]
          : state.scenes[state.scenes.length - 1];
      const clone: Scene = { ...source, id: newId() };
      return {
        ...state,
        scenes: [...state.scenes, clone],
        shotPhase: { status: 'editing' },
        selectedSceneId: clone.id,
        selectedShotType: clone.shot.type,
        subtitleDraft: clone.subtitle,
      };
    }

    case 'DELETE_SELECTED_SCENE': {
      if (state.scenes.length === 0) return state;
      const removeId = state.selectedSceneId ?? state.scenes[state.scenes.length - 1].id;
      const next = state.scenes.filter(s => s.id !== removeId);
      const last = next[next.length - 1];
      return {
        ...state,
        scenes: next,
        shotPhase: next.length === 0 ? { status: 'idle' } : { status: 'editing' },
        selectedSceneId: last ? last.id : null,
        selectedShotType: last ? last.shot.type : state.selectedShotType,
        subtitleDraft: last ? last.subtitle : '',
      };
    }

    case 'MOVE_SCENE': {
      const idx = state.scenes.findIndex(s => s.id === action.id);
      if (idx < 0) return state;
      const to = idx + action.direction;
      if (to < 0 || to >= state.scenes.length) return state;
      const list = [...state.scenes];
      [list[idx], list[to]] = [list[to], list[idx]];
      return { ...state, scenes: list };
    }

    case 'SET_SCENE_SUBTITLE':
      return {
        ...state,
        scenes: state.scenes.map(s => (s.id === action.id ? { ...s, subtitle: action.subtitle } : s)),
      };

    case 'SET_SUBTITLE_DRAFT':
      return { ...state, subtitleDraft: action.subtitle };

    case 'UNDO_LAST': {
      if (state.scenes.length === 0) return state;
      const removed = state.scenes[state.scenes.length - 1];
      const next = state.scenes.slice(0, -1);
      const bounceInBottom = removed.shot.bounceAt.r >= 5;
      return {
        ...state,
        scenes: next,
        shotPhase: next.length === 0 ? { status: 'idle' } : { status: 'editing' },
        selectedSceneId: null,
        p1IconPos: bounceInBottom ? removed.p1Pos : state.p1IconPos,
        p2IconPos: !bounceInBottom ? removed.p2Pos : state.p2IconPos,
      };
    }

    case 'SET_STAR_POS':
      return {
        ...state,
        scenes: state.scenes.map(s => (s.id === action.id ? { ...s, starPos: action.pos ?? undefined } : s)),
      };

    case 'RESET_ALL':
      return {
        ...initialState,
        p1DefaultPos: state.p1DefaultPos,
        p2DefaultPos: state.p2DefaultPos,
        p1Pos: state.p1DefaultPos,
        p2Pos: state.p2DefaultPos,
        p1IconPos: state.p1DefaultPos ? { x: state.p1DefaultPos.x, y: state.p1DefaultPos.y } : null,
        p2IconPos: state.p2DefaultPos ? { x: state.p2DefaultPos.x, y: state.p2DefaultPos.y } : null,
        p1CharName: state.p1CharName,
        p2CharName: state.p2CharName,
      };

    case 'RESET_CURRENT_SCENE': {
      const editId = getEditId(state);
      if (!editId || !state.p1DefaultPos || !state.p2DefaultPos) return state;
      const p1Default: PixelPos = { x: state.p1DefaultPos.x, y: state.p1DefaultPos.y };
      const p2Default: PixelPos = { x: state.p2DefaultPos.x, y: state.p2DefaultPos.y };
      const hitterDefault = state.activeSide === 'top' ? p1Default : p2Default;
      return {
        ...state,
        subtitleDraft: '',
        p1IconPos: p1Default,
        p2IconPos: p2Default,
        scenes: state.scenes.map(s =>
          s.id === editId
            ? { ...s, p1Pos: p1Default, p2Pos: p2Default, subtitle: '', shot: { ...s.shot, hitFrom: hitterDefault } }
            : s
        ),
      };
    }

    default:
      return state;
  }
}

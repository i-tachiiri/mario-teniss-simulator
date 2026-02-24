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
  selectedShotId: number | null;
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
  selectedShotId: null,
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

/** シーン内の選択中ショットを返す（selectedShotId → 末尾 → undefined） */
function getSelectedShot(state: GameStateData, scene: Scene): Shot | undefined {
  if (state.selectedShotId !== null) {
    const found = scene.shots.find(s => s.id === state.selectedShotId);
    if (found) return found;
  }
  return scene.shots[scene.shots.length - 1];
}

/** シーン内の選択中ショットIDを返す */
function getSelectedShotId(state: GameStateData, scene: Scene): number | null {
  const shot = getSelectedShot(state, scene);
  return shot?.id ?? null;
}

/** selectedShotId のショットを updater で差し替える */
function mapSelectedShot(
  state: GameStateData,
  scene: Scene,
  updater: (shot: Shot) => Shot,
): Scene {
  const shotId = getSelectedShotId(state, scene);
  return {
    ...scene,
    shots: scene.shots.map(sh => (sh.id === shotId ? updater(sh) : sh)),
  };
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
            s.id === editId
              ? mapSelectedShot(state, s, sh => ({ ...sh, type: action.shotType }))
              : s
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
            ? mapSelectedShot(state, s, sh => ({ ...sh, curveLevel: clampCurve(sh.curveLevel + action.delta) }))
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
            const updated = isHitter
              ? mapSelectedShot(state, s, sh => ({ ...sh, hitFrom: iconPos }))
              : s;
            return { ...updated, [posKey]: iconPos };
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

        if (state.selectedShotId === null) {
          const receiverIconPos = activeSide === 'top' ? state.p2IconPos : state.p1IconPos;
          const defaultReturnAt = receiverIconPos ?? { x: bounceAt.x, y: bounceAt.y };
          const shotId = newId();
          const shot: Shot = {
            id: shotId,
            hitFrom,
            bounceAt,
            returnAt: defaultReturnAt,
            shotSide: 'forehand',
            type: state.selectedShotType,
            curveLevel: 0,
          };
          return {
            ...state,
            activeSide,
            shotPhase: { status: 'editing' },
            selectedShotId: shotId,
            scenes: state.scenes.map(s =>
              s.id === editId ? { ...s, shots: [...s.shots, shot] } : s
            ),
          };
        }

        return {
          ...state,
          activeSide,
          shotPhase: { status: 'editing' },
          scenes: state.scenes.map(s =>
            s.id === editId
              ? mapSelectedShot(state, s, sh => ({ ...sh, bounceAt, hitFrom, hidden: undefined }))
              : s
          ),
        };
      }

      const hitFrom = getHitFrom([], activeSide, state.p1Pos, state.p2Pos);
      const receiverIconPos = activeSide === 'top' ? state.p2IconPos : state.p1IconPos;
      const defaultReturnAt = receiverIconPos ?? { x: bounceAt.x, y: bounceAt.y };
      const shotId = newId();
      const id = newId();
      const shot: Shot = {
        id: shotId,
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
        shots: [shot],
      };
      return {
        ...state,
        activeSide,
        shotPhase: { status: 'editing' },
        selectedSceneId: id,
        selectedShotId: shotId,
        scenes: [scene],
      };
    }

    case 'FINALIZE_RETURN': {
      const editId = getEditId(state);
      if (!editId) return state;
      const scene = state.scenes.find(s => s.id === editId);
      if (!scene) return state;

      const selectedShot = getSelectedShot(state, scene);
      if (!selectedShot) return state;

      const { returnAt, shotSide } = computeReturnAndSide(
        selectedShot.hitFrom,
        positionToPixelPos(selectedShot.bounceAt),
        action.iconX,
        action.iconY,
        state.activeSide,
      );
      const bounceInBottom = selectedShot.bounceAt.r >= 5;
      const receiverPos: PixelPos = { x: action.iconX, y: action.iconY };
      return {
        ...state,
        scenes: state.scenes.map(s => {
          if (s.id !== editId) return s;
          return {
            ...mapSelectedShot(state, s, sh => ({ ...sh, returnAt, shotSide })),
            p1Pos: bounceInBottom ? receiverPos : s.p1Pos,
            p2Pos: !bounceInBottom ? receiverPos : s.p2Pos,
          };
        }),
        p1IconPos: bounceInBottom ? receiverPos : state.p1IconPos,
        p2IconPos: !bounceInBottom ? receiverPos : state.p2IconPos,
      };
    }

    case 'SELECT_SHOT': {
      if (action.id !== null) {
        const scene = state.scenes.find(s => s.id === action.id);
        if (scene && scene.shots.length > 0) {
          const firstShot = scene.shots[0];
          const activeSide: 'top' | 'bottom' = firstShot.bounceAt.r < 5 ? 'top' : 'bottom';
          return {
            ...state,
            selectedSceneId: action.id,
            selectedShotId: firstShot.id,
            selectedShotType: firstShot.type,
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

    case 'SELECT_SHOT_IN_SCENE': {
      const editId = getEditId(state);
      if (!editId) return state;
      const scene = state.scenes.find(s => s.id === editId);
      if (!scene) return state;
      const shot = scene.shots.find(s => s.id === action.shotId);
      if (!shot) return state;
      const activeSide: 'top' | 'bottom' = shot.bounceAt.r < 5 ? 'top' : 'bottom';
      return {
        ...state,
        selectedShotId: action.shotId,
        selectedShotType: shot.type,
        activeSide,
        shotPhase: { status: 'editing' },
      };
    }

    case 'ADD_SHOT': {
      const editId = getEditId(state);
      if (!editId) return state;
      return {
        ...state,
        selectedShotId: null,
        shotPhase: { status: 'idle' },
      };
    }

    case 'DELETE_SHOT': {
      const editId = getEditId(state);
      if (!editId) return state;
      const scene = state.scenes.find(s => s.id === editId);
      if (!scene) return state;
      const shotId = getSelectedShotId(state, scene);
      const remaining = scene.shots.filter(s => s.id !== shotId);
      const newSelected = remaining[remaining.length - 1];
      return {
        ...state,
        selectedShotId: newSelected?.id ?? null,
        selectedShotType: newSelected?.type ?? state.selectedShotType,
        shotPhase: remaining.length === 0 ? { status: 'idle' } : state.shotPhase,
        scenes: state.scenes.map(s =>
          s.id === editId ? { ...s, shots: remaining } : s
        ),
      };
    }

    case 'UPDATE_LAST_RETURN': {
      if (state.scenes.length === 0) return state;
      const lastScene = state.scenes[state.scenes.length - 1];
      const lastShot = lastScene.shots[lastScene.shots.length - 1];
      if (!lastShot) return state;
      const { returnAt, shotSide } = computeReturnAndSide(
        lastShot.hitFrom,
        positionToPixelPos(lastShot.bounceAt),
        action.iconX,
        action.iconY,
        lastShot.bounceAt.r >= 5 ? 'bottom' : 'top',
      );
      const receiverPos: PixelPos = { x: action.iconX, y: action.iconY };
      const bounceInBottom = lastShot.bounceAt.r >= 5;
      const updatedScene: Scene = {
        ...lastScene,
        p1Pos: bounceInBottom ? receiverPos : lastScene.p1Pos,
        p2Pos: !bounceInBottom ? receiverPos : lastScene.p2Pos,
        shots: lastScene.shots.map((sh, idx) =>
          idx === lastScene.shots.length - 1 ? { ...sh, returnAt, shotSide } : sh
        ),
      };
      return { ...state, scenes: [...state.scenes.slice(0, -1), updatedScene] };
    }

    case 'ADD_SCENE': {
      if (state.scenes.length === 0) return state;
      const source =
        state.selectedSceneId !== null
          ? state.scenes.find(s => s.id === state.selectedSceneId) ?? state.scenes[state.scenes.length - 1]
          : state.scenes[state.scenes.length - 1];
      const clone: Scene = {
        ...source,
        id: newId(),
        shots: source.shots.map(sh => ({ ...sh, id: newId() })),
      };
      const firstShot = clone.shots[0];
      return {
        ...state,
        scenes: [...state.scenes, clone],
        shotPhase: { status: 'editing' },
        selectedSceneId: clone.id,
        selectedShotId: firstShot?.id ?? null,
        selectedShotType: firstShot?.type ?? state.selectedShotType,
        subtitleDraft: clone.subtitle,
      };
    }

    case 'DELETE_SELECTED_SCENE': {
      if (state.scenes.length === 0) return state;
      const removeId = state.selectedSceneId ?? state.scenes[state.scenes.length - 1].id;
      const next = state.scenes.filter(s => s.id !== removeId);
      const last = next[next.length - 1];
      const lastShot = last?.shots[last.shots.length - 1];
      return {
        ...state,
        scenes: next,
        shotPhase: next.length === 0 ? { status: 'idle' } : { status: 'editing' },
        selectedSceneId: last ? last.id : null,
        selectedShotId: lastShot?.id ?? null,
        selectedShotType: lastShot?.type ?? state.selectedShotType,
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
      const removedShot = removed.shots[removed.shots.length - 1];
      const bounceInBottom = removedShot ? removedShot.bounceAt.r >= 5 : false;
      const last = next[next.length - 1];
      const lastShot = last?.shots[last.shots.length - 1];
      return {
        ...state,
        scenes: next,
        shotPhase: next.length === 0 ? { status: 'idle' } : { status: 'editing' },
        selectedSceneId: null,
        selectedShotId: lastShot?.id ?? null,
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
      return {
        ...state,
        subtitleDraft: '',
        shotPhase: { status: 'idle' },
        selectedShotId: null,
        p1IconPos: p1Default,
        p2IconPos: p2Default,
        scenes: state.scenes.map(s =>
          s.id === editId
            ? {
                ...s,
                p1Pos: p1Default,
                p2Pos: p2Default,
                subtitle: '',
                starPos: undefined,
                shots: [],
              }
            : s
        ),
      };
    }

    default:
      return state;
  }
}

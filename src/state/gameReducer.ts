import type { Position, ShotStep, ShotType, PixelPos, ShotPhase } from '../types';
import type { GameAction } from './gameActions';
import { computeBallPathD, computeReturnAndSide, getHitFrom } from '../geometry/shotGeometry';

export interface GameStateData {
  p1Pos: Position | null;
  p2Pos: Position | null;
  p1DefaultPos: Position | null;
  p2DefaultPos: Position | null;
  p1IconPos: PixelPos | null;
  p2IconPos: PixelPos | null;
  rallySteps: ShotStep[];
  shotPhase: ShotPhase;
  selectedShotType: ShotType;
  activeSide: 'top' | 'bottom';
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
  rallySteps: [],
  shotPhase: { status: 'idle' },
  selectedShotType: 'strong-flat',
  activeSide: 'top',
  selectedShotId: null,
  p1CharName: 'ノコノコ',
  p2CharName: 'ノコノコ',
  subtitleDraft: '',
};

const clampCurve = (v: number) => Math.max(-5, Math.min(5, v));
const newId = () => Date.now() + Math.floor(Math.random() * 1000);

function autoFinalizePendingShot(state: GameStateData): GameStateData {
  if (state.shotPhase.status !== 'awaiting') return state;
  const receiverIconPos = state.activeSide === 'top' ? state.p2IconPos : state.p1IconPos;
  if (!receiverIconPos) {
    return { ...state, shotPhase: { status: 'idle' }, selectedShotId: null };
  }
  const { bounceAt, hitFrom, starPos: pendingStarPos, curveLevel } = state.shotPhase;
  const { returnAt, shotSide } = computeReturnAndSide(
    hitFrom,
    bounceAt,
    receiverIconPos.x,
    receiverIconPos.y,
    state.activeSide,
  );
  const shot: ShotStep = {
    hitFrom,
    bounceAt,
    returnAt,
    playerAt: { x: receiverIconPos.x, y: receiverIconPos.y },
    shotSide,
    type: state.selectedShotType,
    id: newId(),
    ballPathD: computeBallPathD(hitFrom, bounceAt, returnAt, 0),
    starPos: pendingStarPos,
    curveLevel,
    subtitle: state.subtitleDraft,
  };
  const bounceInBottom = bounceAt.r >= 5;
  return {
    ...state,
    rallySteps: [...state.rallySteps, shot],
    shotPhase: { status: 'idle' },
    selectedShotId: shot.id,
    p1IconPos: bounceInBottom ? { x: receiverIconPos.x, y: receiverIconPos.y } : state.p1IconPos,
    p2IconPos: !bounceInBottom ? { x: receiverIconPos.x, y: receiverIconPos.y } : state.p2IconPos,
  };
}

export function gameReducer(state: GameStateData, action: GameAction): GameStateData {
  switch (action.type) {
    case 'SET_SHOT_TYPE': {
      if (state.selectedShotId !== null) {
        const updatedSteps = state.rallySteps.map(s =>
          s.id === state.selectedShotId ? { ...s, type: action.shotType } : s,
        );
        return { ...state, selectedShotType: action.shotType, rallySteps: updatedSteps };
      }
      return { ...state, selectedShotType: action.shotType };
    }

    case 'SET_SHOT_CURVE': {
      if (state.shotPhase.status === 'awaiting') {
        return {
          ...state,
          shotPhase: { ...state.shotPhase, curveLevel: clampCurve(state.shotPhase.curveLevel + action.delta) },
        };
      }
      if (state.selectedShotId !== null) {
        return {
          ...state,
          rallySteps: state.rallySteps.map(s =>
            s.id === state.selectedShotId ? { ...s, curveLevel: clampCurve(s.curveLevel + action.delta) } : s,
          ),
        };
      }
      return state;
    }

    case 'SET_PLAYER_POS': {
      const pos: Position = { r: 0, c: 0, x: action.x, y: action.y };
      const iconPos: PixelPos = { x: action.x, y: action.y };
      if (action.player === 'p1') return { ...state, p1Pos: pos, p1IconPos: iconPos };
      return { ...state, p2Pos: pos, p2IconPos: iconPos };
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
      const baseState = autoFinalizePendingShot(state);
      const activeSide: 'top' | 'bottom' = action.r < 5 ? 'top' : 'bottom';
      const bounceAt: Position = { r: action.r, c: action.c, x: action.x, y: action.y };
      const hitFrom = getHitFrom(baseState.rallySteps, activeSide, baseState.p1Pos, baseState.p2Pos);
      return {
        ...baseState,
        activeSide,
        shotPhase: { status: 'awaiting', bounceAt, hitFrom, curveLevel: 0 },
        selectedShotId: null,
      };
    }

    case 'FINALIZE_RETURN': {
      if (state.shotPhase.status !== 'awaiting') return state;
      const { bounceAt, hitFrom, starPos: pendingStarPos, curveLevel } = state.shotPhase;
      const { returnAt, shotSide } = computeReturnAndSide(
        hitFrom,
        bounceAt,
        action.iconX,
        action.iconY,
        state.activeSide,
      );
      const shot: ShotStep = {
        hitFrom,
        bounceAt,
        returnAt,
        playerAt: { x: action.iconX, y: action.iconY },
        shotSide,
        type: state.selectedShotType,
        id: newId(),
        ballPathD: computeBallPathD(hitFrom, bounceAt, returnAt, 0),
        starPos: pendingStarPos,
        curveLevel,
        subtitle: state.subtitleDraft,
      };
      const bounceInBottom = bounceAt.r >= 5;
      return {
        ...state,
        rallySteps: [...state.rallySteps, shot],
        shotPhase: { status: 'idle' },
        selectedShotId: shot.id,
        p1IconPos: bounceInBottom ? { x: action.iconX, y: action.iconY } : state.p1IconPos,
        p2IconPos: !bounceInBottom ? { x: action.iconX, y: action.iconY } : state.p2IconPos,
      };
    }

    case 'SELECT_SHOT': {
      if (action.id !== null) {
        const shot = state.rallySteps.find(s => s.id === action.id);
        if (shot) {
          return { ...state, selectedShotId: action.id, selectedShotType: shot.type, subtitleDraft: shot.subtitle };
        }
      }
      return { ...state, selectedShotId: action.id };
    }

    case 'UPDATE_LAST_RETURN': {
      if (state.rallySteps.length === 0) return state;
      const lastShot = state.rallySteps[state.rallySteps.length - 1];
      const { returnAt, shotSide } = computeReturnAndSide(
        lastShot.hitFrom,
        lastShot.bounceAt,
        action.iconX,
        action.iconY,
        lastShot.bounceAt.r >= 5 ? 'bottom' : 'top',
      );
      const updatedShot: ShotStep = {
        ...lastShot,
        returnAt,
        playerAt: { x: action.iconX, y: action.iconY },
        shotSide,
      };
      return { ...state, rallySteps: [...state.rallySteps.slice(0, -1), updatedShot] };
    }

    case 'ADD_SCENE': {
      if (state.rallySteps.length === 0) return state;
      const source =
        state.selectedShotId !== null
          ? state.rallySteps.find(s => s.id === state.selectedShotId) ?? state.rallySteps[state.rallySteps.length - 1]
          : state.rallySteps[state.rallySteps.length - 1];
      const clone: ShotStep = { ...source, id: newId() };
      return {
        ...state,
        rallySteps: [...state.rallySteps, clone],
        selectedShotId: clone.id,
        selectedShotType: clone.type,
        subtitleDraft: clone.subtitle,
      };
    }

    case 'DELETE_SELECTED_SCENE': {
      if (state.rallySteps.length === 0) return state;
      const removeId = state.selectedShotId ?? state.rallySteps[state.rallySteps.length - 1].id;
      const next = state.rallySteps.filter(s => s.id !== removeId);
      const last = next[next.length - 1];
      return {
        ...state,
        rallySteps: next,
        selectedShotId: last ? last.id : null,
        selectedShotType: last ? last.type : state.selectedShotType,
        subtitleDraft: last ? last.subtitle : '',
      };
    }

    case 'MOVE_SCENE': {
      const idx = state.rallySteps.findIndex(s => s.id === action.id);
      if (idx < 0) return state;
      const to = idx + action.direction;
      if (to < 0 || to >= state.rallySteps.length) return state;
      const list = [...state.rallySteps];
      [list[idx], list[to]] = [list[to], list[idx]];
      return { ...state, rallySteps: list };
    }

    case 'SET_SCENE_SUBTITLE':
      return {
        ...state,
        rallySteps: state.rallySteps.map(s => (s.id === action.id ? { ...s, subtitle: action.subtitle } : s)),
      };

    case 'SET_SUBTITLE_DRAFT':
      return { ...state, subtitleDraft: action.subtitle };

    case 'UNDO_LAST': {
      if (state.shotPhase.status === 'awaiting') {
        return { ...state, shotPhase: { status: 'idle' }, selectedShotId: null };
      }
      if (state.rallySteps.length === 0) return state;
      const removed = state.rallySteps[state.rallySteps.length - 1];
      const bounceInBottom = removed.bounceAt.r >= 5;
      return {
        ...state,
        rallySteps: state.rallySteps.slice(0, -1),
        selectedShotId: null,
        p1IconPos: bounceInBottom ? { x: removed.playerAt.x, y: removed.playerAt.y } : state.p1IconPos,
        p2IconPos: !bounceInBottom ? { x: removed.playerAt.x, y: removed.playerAt.y } : state.p2IconPos,
      };
    }

    case 'SET_PENDING_STAR': {
      if (state.shotPhase.status !== 'awaiting') return state;
      return { ...state, shotPhase: { ...state.shotPhase, starPos: action.pos ?? undefined } };
    }

    case 'SET_STAR_POS':
      return {
        ...state,
        rallySteps: state.rallySteps.map(s => (s.id === action.id ? { ...s, starPos: action.pos ?? undefined } : s)),
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

    default:
      return state;
  }
}

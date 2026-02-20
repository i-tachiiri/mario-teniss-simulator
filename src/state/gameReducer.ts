import type { Position, ShotStep, ShotType, PixelPos, ShotPhase, FinalShot } from '../types';
import type { GameAction } from './gameActions';
import {
  computeBallPathD,
  computeReturnAndSide,
  getHitFrom,
} from '../geometry/shotGeometry';

export interface GameStateData {
  p1Pos: Position | null;
  p2Pos: Position | null;
  p1DefaultPos: Position | null;
  p2DefaultPos: Position | null;
  /** 現在のアイコン表示位置（ドラッグ後・アンドゥ後に更新） */
  p1IconPos: PixelPos | null;
  p2IconPos: PixelPos | null;
  rallySteps: ShotStep[];
  shotPhase: ShotPhase;
  selectedShotType: ShotType;
  activeSide: 'top' | 'bottom';
  selectedShotId: number | null;
  finalShot: FinalShot | null;
  p1CharName: string;
  p2CharName: string;
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
  finalShot: null,
  p1CharName: 'ノコノコ',
  p2CharName: 'ノコノコ',
};

/**
 * ショットが awaiting 状態なら、現在のアイコン位置で自動確定してから返す。
 * CELL_CLICKED の前処理として呼ばれる唯一の場所。
 */
function autoFinalizePendingShot(state: GameStateData): GameStateData {
  if (state.shotPhase.status !== 'awaiting') return state;
  const receiverIconPos = state.activeSide === 'top' ? state.p2IconPos : state.p1IconPos;
  if (!receiverIconPos) {
    return { ...state, shotPhase: { status: 'idle' }, selectedShotId: null };
  }
  const { bounceAt, hitFrom } = state.shotPhase;
  const { returnAt, shotSide } = computeReturnAndSide(
    hitFrom,
    bounceAt,
    receiverIconPos.x,
    receiverIconPos.y,
    state.activeSide,
  );
  const ballPathD = computeBallPathD(hitFrom, bounceAt, returnAt);
  const shot: ShotStep = {
    hitFrom,
    bounceAt,
    returnAt,
    playerAt: { x: receiverIconPos.x, y: receiverIconPos.y },
    shotSide,
    type: state.selectedShotType,
    id: Date.now(),
    ballPathD,
  };
  const bounceInBottom = bounceAt.r >= 5;
  return {
    ...state,
    rallySteps: [...state.rallySteps, shot],
    shotPhase: { status: 'idle' },
    selectedShotId: null,
    p1IconPos: bounceInBottom ? { x: receiverIconPos.x, y: receiverIconPos.y } : state.p1IconPos,
    p2IconPos: !bounceInBottom ? { x: receiverIconPos.x, y: receiverIconPos.y } : state.p2IconPos,
  };
}

export function gameReducer(
  state: GameStateData,
  action: GameAction,
): GameStateData {
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

    case 'SET_PLAYER_POS': {
      const pos: Position = { r: 0, c: 0, x: action.x, y: action.y };
      const iconPos: PixelPos = { x: action.x, y: action.y };
      if (action.player === 'p1') {
        return { ...state, p1Pos: pos, p1IconPos: iconPos };
      }
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
      // Step 1: 前のショットがドロップ待ちなら、現在位置で自動確定
      const baseState = autoFinalizePendingShot(state);

      // Step 2: 新しいバウンド地点の選択を開始
      const activeSide: 'top' | 'bottom' = action.r < 5 ? 'top' : 'bottom';
      const bounceAt: Position = { r: action.r, c: action.c, x: action.x, y: action.y };
      const hitFrom = getHitFrom(baseState.rallySteps, activeSide, baseState.p1Pos, baseState.p2Pos);
      return { ...baseState, activeSide, shotPhase: { status: 'awaiting', bounceAt, hitFrom }, selectedShotId: null, finalShot: null };
    }

    case 'FINALIZE_RETURN': {
      if (state.shotPhase.status !== 'awaiting') return state;
      const { bounceAt, hitFrom } = state.shotPhase;
      const { returnAt, shotSide } = computeReturnAndSide(
        hitFrom,
        bounceAt,
        action.iconX,
        action.iconY,
        state.activeSide,
      );
      const ballPathD = computeBallPathD(hitFrom, bounceAt, returnAt);
      const shot: ShotStep = {
        hitFrom,
        bounceAt,
        returnAt,
        playerAt: { x: action.iconX, y: action.iconY },
        shotSide,
        type: state.selectedShotType,
        id: Date.now(),
        ballPathD,
      };
      const bounceInBottom = bounceAt.r >= 5;
      return {
        ...state,
        rallySteps: [...state.rallySteps, shot],
        shotPhase: { status: 'idle' },
        selectedShotId: null,
        finalShot: null,
        p1IconPos: bounceInBottom
          ? { x: action.iconX, y: action.iconY }
          : state.p1IconPos,
        p2IconPos: !bounceInBottom
          ? { x: action.iconX, y: action.iconY }
          : state.p2IconPos,
      };
    }

    case 'SELECT_SHOT': {
      if (action.id !== null) {
        const shot = state.rallySteps.find(s => s.id === action.id);
        if (shot) {
          return { ...state, selectedShotId: action.id, selectedShotType: shot.type };
        }
      }
      return { ...state, selectedShotId: action.id };
    }

    case 'CANCEL_PENDING_SHOT':
      if (state.shotPhase.status !== 'awaiting') return state;
      return {
        ...state,
        finalShot: {
          bounceAt: state.shotPhase.bounceAt,
          hitFrom: state.shotPhase.hitFrom,
          type: state.selectedShotType,
        },
        shotPhase: { status: 'idle' },
        selectedShotId: null,
      };

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
      const ballPathD = computeBallPathD(lastShot.hitFrom, lastShot.bounceAt, returnAt);
      const updatedShot: ShotStep = {
        ...lastShot,
        returnAt,
        playerAt: { x: action.iconX, y: action.iconY },
        shotSide,
        ballPathD,
      };
      return {
        ...state,
        rallySteps: [...state.rallySteps.slice(0, -1), updatedShot],
      };
    }

    case 'UNDO_LAST': {
      if (state.shotPhase.status === 'awaiting') {
        return {
          ...state,
          shotPhase: { status: 'idle' },
          selectedShotId: null,
        };
      }
      // ラリー終了マーカーがあればそれを先に取り消す
      if (state.finalShot !== null) {
        return { ...state, finalShot: null };
      }
      if (state.rallySteps.length === 0) return state;
      const removed = state.rallySteps[state.rallySteps.length - 1];
      const bounceInBottom = removed.bounceAt.r >= 5;
      return {
        ...state,
        rallySteps: state.rallySteps.slice(0, -1),
        selectedShotId: null,
        p1IconPos: bounceInBottom
          ? { x: removed.playerAt.x, y: removed.playerAt.y }
          : state.p1IconPos,
        p2IconPos: !bounceInBottom
          ? { x: removed.playerAt.x, y: removed.playerAt.y }
          : state.p2IconPos,
      };
    }

    case 'RESET_ALL':
      return {
        ...initialState,
        p1DefaultPos: state.p1DefaultPos,
        p2DefaultPos: state.p2DefaultPos,
        p1Pos: state.p1DefaultPos,
        p2Pos: state.p2DefaultPos,
        p1IconPos: state.p1DefaultPos
          ? { x: state.p1DefaultPos.x, y: state.p1DefaultPos.y }
          : null,
        p2IconPos: state.p2DefaultPos
          ? { x: state.p2DefaultPos.x, y: state.p2DefaultPos.y }
          : null,
        p1CharName: state.p1CharName,
        p2CharName: state.p2CharName,
      };

    default:
      return state;
  }
}

import type { PixelPos, Position, ShotPhase, ShotStep, ShotType } from '../../domain/types';
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

const clampCurve = (v: number) => Math.max(-10, Math.min(10, v));
const newId = () => Date.now() + Math.floor(Math.random() * 1000);

/** 現在編集中のシーンIDを返す（selectedShotId → 最終シーン → null） */
function getEditId(state: GameStateData): number | null {
  return state.selectedShotId ?? (state.rallySteps.length > 0 ? state.rallySteps[state.rallySteps.length - 1].id : null);
}

export function gameReducer(state: GameStateData, action: GameAction): GameStateData {
  switch (action.type) {
    case 'SET_SHOT_TYPE': {
      const editId = getEditId(state);
      if (editId !== null) {
        return {
          ...state,
          selectedShotType: action.shotType,
          rallySteps: state.rallySteps.map(s => s.id === editId ? { ...s, type: action.shotType } : s),
        };
      }
      return { ...state, selectedShotType: action.shotType };
    }

    case 'SET_SHOT_CURVE': {
      const editId = getEditId(state);
      if (!editId) return state;
      return {
        ...state,
        rallySteps: state.rallySteps.map(s =>
          s.id === editId ? { ...s, curveLevel: clampCurve(s.curveLevel + action.delta) } : s
        ),
      };
    }

    case 'SET_PLAYER_POS': {
      const pos: Position = { r: 0, c: 0, x: action.x, y: action.y };
      const iconPos: PixelPos = { x: action.x, y: action.y };
      const baseState = action.player === 'p1'
        ? { ...state, p1Pos: pos, p1IconPos: iconPos }
        : { ...state, p2Pos: pos, p2IconPos: iconPos };

      // 編集中のショットのヒッター側が動いた場合、hitFrom を追従させる
      // activeSide='top'（上コートにバウンド）→ 下コート側の P1 がヒッター
      const isHitter = (action.player === 'p1' && state.activeSide === 'top') ||
                       (action.player === 'p2' && state.activeSide === 'bottom');
      const editId = state.shotPhase.status === 'editing' ? getEditId(state) : null;
      if (editId !== null && isHitter) {
        return {
          ...baseState,
          rallySteps: state.rallySteps.map(s => s.id === editId ? { ...s, hitFrom: iconPos } : s),
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
        // 既存シーンのバウンド地点を更新（確定なしで即反映）
        const priorSteps = state.rallySteps.filter(s => s.id !== editId);
        const hitFrom = getHitFrom(priorSteps, activeSide, state.p1Pos, state.p2Pos);
        return {
          ...state,
          activeSide,
          shotPhase: { status: 'editing' },
          rallySteps: state.rallySteps.map(s =>
            s.id === editId ? { ...s, bounceAt, hitFrom } : s
          ),
        };
      }

      // 初回: 新しいシーンを即 rallySteps に追加
      const hitFrom = getHitFrom([], activeSide, state.p1Pos, state.p2Pos);
      const receiverIconPos = activeSide === 'top' ? state.p2IconPos : state.p1IconPos;
      const defaultReturnAt = receiverIconPos ?? { x: bounceAt.x, y: bounceAt.y };
      const id = newId();
      const shot: ShotStep = {
        hitFrom,
        bounceAt,
        returnAt: defaultReturnAt,
        playerAt: defaultReturnAt,
        shotSide: 'forehand',
        type: state.selectedShotType,
        id,
        curveLevel: 0,
        subtitle: state.subtitleDraft,
      };
      return {
        ...state,
        activeSide,
        shotPhase: { status: 'editing' },
        selectedShotId: id,
        rallySteps: [shot],
      };
    }

    case 'FINALIZE_RETURN': {
      // レシーバーがドラッグ終了 → シーンの returnAt を更新（確定概念なし）
      const editId = getEditId(state);
      if (!editId) return state;
      const shot = state.rallySteps.find(s => s.id === editId);
      if (!shot) return state;

      const { returnAt, shotSide } = computeReturnAndSide(
        shot.hitFrom,
        positionToPixelPos(shot.bounceAt),
        action.iconX,
        action.iconY,
        state.activeSide,
      );
      const bounceInBottom = shot.bounceAt.r >= 5;
      return {
        ...state,
        rallySteps: state.rallySteps.map(s =>
          s.id === editId
            ? { ...s, returnAt, playerAt: { x: action.iconX, y: action.iconY }, shotSide }
            : s
        ),
        p1IconPos: bounceInBottom ? { x: action.iconX, y: action.iconY } : state.p1IconPos,
        p2IconPos: !bounceInBottom ? { x: action.iconX, y: action.iconY } : state.p2IconPos,
      };
    }

    case 'SELECT_SHOT': {
      if (action.id !== null) {
        const shot = state.rallySteps.find(s => s.id === action.id);
        if (shot) {
          const activeSide: 'top' | 'bottom' = shot.bounceAt.r < 5 ? 'top' : 'bottom';
          // bounceAt が下コート(r>=5) → P2がヒッター(hitFrom=P2)・P1がレシーバー(playerAt=P1)
          const isBottomBounce = shot.bounceAt.r >= 5;
          const p1IconPos = isBottomBounce ? shot.playerAt : shot.hitFrom;
          const p2IconPos = isBottomBounce ? shot.hitFrom  : shot.playerAt;
          return {
            ...state,
            selectedShotId: action.id,
            selectedShotType: shot.type,
            subtitleDraft: shot.subtitle,
            activeSide,
            shotPhase: { status: 'editing' },
            p1IconPos,
            p2IconPos,
          };
        }
      }
      return { ...state, selectedShotId: action.id };
    }

    case 'UPDATE_LAST_RETURN': {
      if (state.rallySteps.length === 0) return state;
      const lastShot = state.rallySteps[state.rallySteps.length - 1];
      const { returnAt, shotSide } = computeReturnAndSide(
        lastShot.hitFrom,
        positionToPixelPos(lastShot.bounceAt),
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
        shotPhase: { status: 'editing' },
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
        shotPhase: next.length === 0 ? { status: 'idle' } : { status: 'editing' },
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
      if (state.rallySteps.length === 0) return state;
      const removed = state.rallySteps[state.rallySteps.length - 1];
      const next = state.rallySteps.slice(0, -1);
      const bounceInBottom = removed.bounceAt.r >= 5;
      return {
        ...state,
        rallySteps: next,
        shotPhase: next.length === 0 ? { status: 'idle' } : { status: 'editing' },
        selectedShotId: null,
        p1IconPos: bounceInBottom ? { x: removed.playerAt.x, y: removed.playerAt.y } : state.p1IconPos,
        p2IconPos: !bounceInBottom ? { x: removed.playerAt.x, y: removed.playerAt.y } : state.p2IconPos,
      };
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

    case 'RESET_CURRENT_SCENE': {
      // 現在の局面を削除し、両アイコンをデフォルト位置に戻す。他のrallyStepsは変更しない。
      const editId = getEditId(state);
      if (!editId || !state.p1DefaultPos || !state.p2DefaultPos) return state;
      const p1Default: PixelPos = { x: state.p1DefaultPos.x, y: state.p1DefaultPos.y };
      const p2Default: PixelPos = { x: state.p2DefaultPos.x, y: state.p2DefaultPos.y };
      const remaining = state.rallySteps.filter(s => s.id !== editId);
      const last = remaining[remaining.length - 1];
      return {
        ...state,
        rallySteps: remaining,
        shotPhase: remaining.length === 0 ? { status: 'idle' } : { status: 'editing' },
        selectedShotId: last ? last.id : null,
        subtitleDraft: last ? last.subtitle : '',
        p1IconPos: p1Default,
        p2IconPos: p2Default,
      };
    }

    default:
      return state;
  }
}

import test from 'node:test';
import assert from 'node:assert/strict';
import { gameReducer, initialState } from '../.tmp-test/state/gameReducer.js';
import { buildShotPoints } from '../.tmp-test/geometry/shot/buildShotPoints.js';

const baseShot = {
  hitFrom: { x: 10, y: 10 },
  bounceAt: { r: 2, c: 2, x: 20, y: 20 },
  returnAt: { x: 30, y: 30 },
  playerAt: { x: 31, y: 31 },
  shotSide: 'forehand',
  type: 'strong-flat',
  id: 1,
  curveLevel: 0,
  subtitle: 'a',
};

test('SET_CHARACTERS updates both player names', () => {
  const next = gameReducer(initialState, { type: 'SET_CHARACTERS', p1: 'マリオ', p2: 'ルイージ' });
  assert.equal(next.p1CharName, 'マリオ');
  assert.equal(next.p2CharName, 'ルイージ');
});

test('ADD_SCENE duplicates selected scene', () => {
  const state = { ...initialState, rallySteps: [baseShot], selectedShotId: 1 };
  const next = gameReducer(state, { type: 'ADD_SCENE' });
  assert.equal(next.rallySteps.length, 2);
  assert.notEqual(next.rallySteps[1].id, 1);
  assert.equal(next.rallySteps[1].subtitle, 'a');
});

test('MOVE_SCENE swaps scene order', () => {
  const state = { ...initialState, rallySteps: [baseShot, { ...baseShot, id: 2, subtitle: 'b' }] };
  const next = gameReducer(state, { type: 'MOVE_SCENE', id: 2, direction: -1 });
  assert.equal(next.rallySteps[0].id, 2);
});

test('DELETE_SELECTED_SCENE removes selected scene', () => {
  const state = { ...initialState, rallySteps: [baseShot, { ...baseShot, id: 2 }], selectedShotId: 2 };
  const next = gameReducer(state, { type: 'DELETE_SELECTED_SCENE' });
  assert.equal(next.rallySteps.length, 1);
  assert.equal(next.rallySteps[0].id, 1);
});

test('buildShotPoints keeps second marker for normal shots', () => {
  const points = buildShotPoints({
    hitFromPx: { x: 30, y: 250 },
    bouncePx: { x: 120, y: 180 },
    returnPx: { x: 170, y: 120 },
    isDropLike: false,
    isJumpLike: false,
    containerSize: { width: 360, height: 640 },
  });

  assert.equal(points.markers.length, 2);
  assert.deepEqual(points.markers[0], points.bouncePx);
  assert.deepEqual(points.markers[1], points.returnPx);
});

test('buildShotPoints still keeps second marker for drop-like shots', () => {
  const points = buildShotPoints({
    hitFromPx: { x: 30, y: 250 },
    bouncePx: { x: 120, y: 180 },
    returnPx: { x: 170, y: 120 },
    isDropLike: true,
    isJumpLike: false,
    containerSize: { width: 360, height: 640 },
  });

  assert.equal(points.markers.length, 2);
  assert.deepEqual(points.markers[0], points.bouncePx);
  assert.deepEqual(points.markers[1], points.returnPx);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { gameReducer, initialState } from '../.tmp-test/state/gameReducer.js';

test('SET_CHARACTERS updates both player names', () => {
  const next = gameReducer(initialState, { type: 'SET_CHARACTERS', p1: 'マリオ', p2: 'ルイージ' });
  assert.equal(next.p1CharName, 'マリオ');
  assert.equal(next.p2CharName, 'ルイージ');
});

test('SELECT_SHOT null clears selectedShotId', () => {
  const withSelection = { ...initialState, selectedShotId: 123 };
  const next = gameReducer(withSelection, { type: 'SELECT_SHOT', id: null });
  assert.equal(next.selectedShotId, null);
});

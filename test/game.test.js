import assert from 'node:assert/strict';
import test from 'node:test';
import { PIECE_TYPES, pieceMatrix, rotateMatrix, createGenerator, nextPiece } from '../src/shared/pieces.js';
import { emptyBoard, canPlace, clearLines, createGame, applyAction, advance } from '../src/shared/game.js';

function setPiece(game, type, x, y, turns = 0) {
  let matrix = pieceMatrix(type);
  for (let index = 0; index < turns; index += 1) matrix = rotateMatrix(matrix);
  game.active = { type, matrix, x, y };
}

test('all seven tetrominoes have four cells and return after four rotations', () => {
  for (const type of PIECE_TYPES) {
    const original = pieceMatrix(type);
    assert.equal(original.flat().filter(Boolean).length, 4);
    let rotated = original;
    for (let turn = 0; turn < 4; turn += 1) rotated = rotateMatrix(rotated);
    assert.deepEqual(rotated, original, type);
    rotated[0][0] = 99;
    assert.notDeepEqual(pieceMatrix(type), rotated, 'Shape templates must remain independent.');
  }
  assert.throws(() => pieceMatrix('Q'), /Unknown/);
});

test('clockwise rotation has the specified orientation', () => {
  assert.deepEqual(rotateMatrix(pieceMatrix('T')), [[0, 1, 0], [0, 1, 1], [0, 1, 0]]);
});

test('each of 100 bags contains exactly one of each type, including seed zero', () => {
  for (const seed of [0, 42, 0xffffffff]) {
    const generator = createGenerator(seed);
    for (let bag = 0; bag < 100; bag += 1) {
      const pieces = Array.from({ length: 7 }, () => nextPiece(generator));
      assert.deepEqual(pieces.sort(), [...PIECE_TYPES].sort());
    }
  }
});

test('seeds reproduce sequences and a generator can be resumed from saved state', () => {
  const first = createGenerator(123);
  const second = createGenerator(123);
  const other = createGenerator(456);
  const sequence = Array.from({ length: 40 }, () => nextPiece(first));
  assert.deepEqual(sequence, Array.from({ length: 40 }, () => nextPiece(second)));
  assert.notDeepEqual(sequence, Array.from({ length: 40 }, () => nextPiece(other)));
  const restored = structuredClone(first);
  assert.deepEqual(Array.from({ length: 40 }, () => nextPiece(first)), Array.from({ length: 40 }, () => nextPiece(restored)));
  for (const seed of [-1, 1.5, 0x100000000, NaN, '123']) assert.throws(() => createGenerator(seed));
});

test('new rounds have independent 10 by 20 boards and centered legal spawns', () => {
  const game = createGame(42);
  assert.equal(game.board.length, 20);
  assert.ok(game.board.every((row) => row.length === 10 && row.every((cell) => cell === 0)));
  game.board[19][0] = 'J';
  assert.equal(game.board[18][0], 0);
  assert.equal(createGame(42).board[19][0], 0);
  assert.equal(game.active.x, Math.floor((10 - game.active.matrix.length) / 2));
  assert.equal(game.active.y, 0);
  assert.equal(canPlace(game.board, game.active.matrix, game.active.x, game.active.y), true);
  assert.ok(PIECE_TYPES.includes(game.next));
});

test('collision rejects occupied cells and all boundaries but ignores empty padding', () => {
  const board = emptyBoard();
  const square = pieceMatrix('O');
  for (const [x, y] of [[-1, 0], [9, 0], [0, -1], [0, 19]]) assert.equal(canPlace(board, square, x, y), false);
  assert.equal(canPlace(board, square, 8, 18), true);
  board[19][9] = 'Z';
  assert.equal(canPlace(board, square, 8, 18), false);
  assert.equal(canPlace(emptyBoard(), rotateMatrix(pieceMatrix('I')), -2, 0), true);
});

test('movement stops at a wall or a locked neighbor without changing the piece', () => {
  const game = createGame(1);
  setPiece(game, 'O', 0, 5);
  const before = structuredClone(game.active);
  assert.equal(applyAction(game, 'left'), false);
  assert.deepEqual(game.active, before);
  assert.equal(applyAction(game, 'right'), true);
  assert.equal(game.active.x, 1);
  game.board[5][3] = 'J';
  assert.equal(applyAction(game, 'right'), false);
  assert.equal(game.active.x, 1);
});

test('blocked rotations at walls, floor, or occupied cells leave state unchanged', () => {
  const game = createGame(1);
  setPiece(game, 'I', -2, 5, 1);
  let before = structuredClone(game.active);
  assert.equal(applyAction(game, 'rotate'), false);
  assert.deepEqual(game.active, before);
  setPiece(game, 'I', 3, 18);
  before = structuredClone(game.active);
  assert.equal(applyAction(game, 'rotate'), false);
  assert.deepEqual(game.active, before);
  setPiece(game, 'T', 3, 5);
  game.board[7][4] = 'O';
  before = structuredClone(game.active);
  assert.equal(applyAction(game, 'rotate'), false);
  assert.deepEqual(game.active, before);
});

test('legal rotation preserves position and O rotation is a no-op', () => {
  const game = createGame(1);
  setPiece(game, 'T', 3, 5);
  assert.equal(applyAction(game, 'rotate'), true);
  assert.deepEqual(game.active.matrix, [[0, 1, 0], [0, 1, 1], [0, 1, 0]]);
  assert.equal(game.active.x, 3);
  assert.equal(game.active.y, 5);
  setPiece(game, 'O', 4, 0);
  assert.equal(applyAction(game, 'rotate'), false);
});

test('gravity uses complete intervals without awarding drop points', () => {
  const game = createGame(1);
  assert.equal(advance(game, 999), false);
  assert.equal(game.active.y, 0);
  assert.equal(advance(game, 1), true);
  assert.equal(game.active.y, 1);
  advance(game, 2000);
  assert.equal(game.active.y, 3);
  assert.equal(game.score, 0);
  for (const elapsed of [-1, Infinity, NaN]) assert.throws(() => advance(game, elapsed));
});

test('gravity is deterministic across frame sizes and automatic locking', () => {
  const first = createGame(123);
  const second = createGame(123);
  advance(first, 25000);
  for (let index = 0; index < 250; index += 1) advance(second, 100);
  assert.deepEqual(first, second);
  assert.ok(first.pieces > 0);
});

test('soft drop earns one point per cell and resets gravity', () => {
  const game = createGame(1);
  setPiece(game, 'O', 4, 0);
  advance(game, 800);
  applyAction(game, 'soft-drop');
  assert.equal(game.active.y, 1);
  assert.equal(game.score, 1);
  assert.equal(game.gravityElapsed, 0);
});

test('hard drop lands, locks, advances the preview, and awards distance points', () => {
  const game = createGame(1);
  setPiece(game, 'O', 4, 0);
  const next = game.next;
  applyAction(game, 'hard-drop');
  assert.equal(game.score, 36);
  assert.equal(game.pieces, 1);
  assert.deepEqual(game.board[19].slice(4, 6), ['O', 'O']);
  assert.deepEqual(game.board[18].slice(4, 6), ['O', 'O']);
  assert.equal(game.active.type, next);
  assert.equal(game.active.y, 0);
});

test('hard drop stops above existing cells', () => {
  const game = createGame(1);
  setPiece(game, 'O', 4, 0);
  game.board[15][4] = 'J';
  applyAction(game, 'hard-drop');
  assert.equal(game.score, 26);
  assert.deepEqual(game.board[14].slice(4, 6), ['O', 'O']);
  assert.equal(game.board[15][4], 'J');
});

test('a blocked soft drop locks without rewarding a nonexistent movement', () => {
  const game = createGame(1);
  setPiece(game, 'O', 4, 18);
  applyAction(game, 'soft-drop');
  assert.equal(game.pieces, 1);
  assert.equal(game.score, 0);
});

test('clearing multiple rows preserves remaining row order and independent blank rows', () => {
  for (let count = 1; count <= 4; count += 1) {
    const board = emptyBoard();
    board[0][0] = 'T';
    board[19 - count][1] = 'L';
    for (let y = 20 - count; y < 20; y += 1) board[y].fill('J');
    const cleared = clearLines(board);
    assert.equal(cleared.count, count);
    assert.equal(cleared.board.length, 20);
    assert.equal(cleared.board[count][0], 'T');
    assert.equal(cleared.board[19][1], 'L');
    assert.ok(cleared.board.slice(0, count).every((row) => row.every((cell) => cell === 0)));
    if (count > 1) {
      cleared.board[0][0] = 'Z';
      assert.equal(cleared.board[1][0], 0);
    }
  }
});

test('line clears award the documented points and line counts', () => {
  for (const [count, expectedScore] of [[1, 100], [2, 300], [3, 500], [4, 800]]) {
    const game = createGame(1);
    for (let y = 20 - count; y < 20; y += 1) {
      game.board[y].fill('J');
      game.board[y][2] = 0;
    }
    setPiece(game, 'I', 0, 16, 1);
    applyAction(game, 'hard-drop');
    assert.equal(game.score, expectedScore);
    assert.equal(game.lines, count);
    assert.equal(game.pieces, 1);
    if (count === 4) assert.ok(game.board.flat().every((cell) => cell === 0));
  }
});

test('blocked spawn ends the round and all later inputs and time preserve its state', () => {
  const game = createGame(1);
  setPiece(game, 'O', 4, 18);
  game.next = 'O';
  game.board[0][4] = 'J';
  applyAction(game, 'hard-drop');
  assert.equal(game.status, 'over');
  assert.equal(game.active, null);
  const ended = structuredClone(game);
  for (const action of ['left', 'right', 'rotate', 'soft-drop', 'hard-drop']) assert.equal(applyAction(game, action), false);
  assert.equal(advance(game, 100000), false);
  assert.deepEqual(game, ended);
});

test('replaying the same actions produces identical state and a fresh round resets counters', () => {
  const first = createGame(123);
  const second = createGame(123);
  for (let piece = 0; piece < 30; piece += 1) {
    for (const game of [first, second]) {
      advance(game, 1200);
      applyAction(game, 'left');
      applyAction(game, 'rotate');
      applyAction(game, 'soft-drop');
      applyAction(game, 'hard-drop');
    }
  }
  assert.deepEqual(first, second);
  const fresh = createGame(456);
  assert.equal(fresh.score, 0);
  assert.equal(fresh.lines, 0);
  assert.equal(fresh.pieces, 0);
  assert.equal(fresh.status, 'playing');
});

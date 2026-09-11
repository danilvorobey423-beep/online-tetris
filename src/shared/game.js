import { BOARD_WIDTH, BOARD_HEIGHT, GRAVITY_INTERVAL_MS, LINE_POINTS } from './constants.js';
import { createGenerator, nextPiece, pieceMatrix, rotateMatrix } from './pieces.js';

export function emptyBoard() {
  return Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0));
}

export function canPlace(board, matrix, x, y) {
  for (let row = 0; row < matrix.length; row += 1) {
    for (let column = 0; column < matrix[row].length; column += 1) {
      if (!matrix[row][column]) continue;
      const boardX = x + column;
      const boardY = y + row;
      if (boardX < 0 || boardX >= BOARD_WIDTH || boardY < 0 || boardY >= BOARD_HEIGHT) return false;
      if (board[boardY][boardX] !== 0) return false;
    }
  }
  return true;
}

export function clearLines(board) {
  const remaining = board.filter((row) => row.some((cell) => cell === 0));
  const count = BOARD_HEIGHT - remaining.length;
  const blank = Array.from({ length: count }, () => Array(BOARD_WIDTH).fill(0));
  return { board: [...blank, ...remaining], count };
}

function spawnNext(game) {
  const type = game.next;
  const matrix = pieceMatrix(type);
  const x = Math.floor((BOARD_WIDTH - matrix.length) / 2);
  game.next = nextPiece(game.generator);
  if (!canPlace(game.board, matrix, x, 0)) {
    game.status = 'over';
    game.active = null;
    game.gravityElapsed = 0;
    return;
  }
  game.active = { type, matrix, x, y: 0 };
}

export function createGame(seed) {
  const generator = createGenerator(seed);
  const game = {
    board: emptyBoard(),
    generator,
    next: nextPiece(generator),
    active: null,
    status: 'playing',
    score: 0,
    lines: 0,
    pieces: 0,
    gravityElapsed: 0,
  };
  spawnNext(game);
  return game;
}

function lockPiece(game) {
  const { matrix, x, y, type } = game.active;
  matrix.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      if (cell) game.board[y + rowIndex][x + columnIndex] = type;
    });
  });
  const cleared = clearLines(game.board);
  game.board = cleared.board;
  game.lines += cleared.count;
  game.score += LINE_POINTS[cleared.count];
  game.pieces += 1;
  spawnNext(game);
}

function stepDown(game) {
  const piece = game.active;
  if (canPlace(game.board, piece.matrix, piece.x, piece.y + 1)) {
    piece.y += 1;
    return true;
  }
  lockPiece(game);
  return false;
}

export function applyAction(game, action) {
  if (game.status !== 'playing') return false;
  const piece = game.active;
  if (action === 'left' || action === 'right') {
    const x = piece.x + (action === 'left' ? -1 : 1);
    if (!canPlace(game.board, piece.matrix, x, piece.y)) return false;
    piece.x = x;
    return true;
  }
  if (action === 'rotate') {
    if (piece.type === 'O') return false;
    const matrix = rotateMatrix(piece.matrix);
    if (!canPlace(game.board, matrix, piece.x, piece.y)) return false;
    piece.matrix = matrix;
    return true;
  }
  if (action === 'soft-drop') {
    if (stepDown(game)) game.score += 1;
    game.gravityElapsed = 0;
    return true;
  }
  if (action === 'hard-drop') {
    while (canPlace(game.board, piece.matrix, piece.x, piece.y + 1)) {
      piece.y += 1;
      game.score += 2;
    }
    lockPiece(game);
    game.gravityElapsed = 0;
    return true;
  }
  return false;
}

export function advance(game, elapsedMs) {
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) throw new Error('Elapsed time must be finite and nonnegative.');
  if (game.status !== 'playing') return false;
  game.gravityElapsed += elapsedMs;
  let changed = false;
  while (game.gravityElapsed >= GRAVITY_INTERVAL_MS && game.status === 'playing') {
    game.gravityElapsed -= GRAVITY_INTERVAL_MS;
    stepDown(game);
    changed = true;
  }
  return changed;
}

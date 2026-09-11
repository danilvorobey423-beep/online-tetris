import { createGame, applyAction, advance } from '/shared/game.js';
import { MAX_FRAME_MS } from '/shared/constants.js';
import { bindKeyboardControls } from './input.js';
import { renderBoard, renderNext } from './renderer.js';
import { connectToServer } from './network.js';

const board = document.querySelector('#game-board');
const next = document.querySelector('#next-piece');
const score = document.querySelector('#score');
const lines = document.querySelector('#lines');
const title = document.querySelector('#match-title');
const description = document.querySelector('#match-description');
const restart = document.querySelector('#restart');
const connectionStatus = document.querySelector('#connection-status');
const retryConnection = document.querySelector('#retry-connection');
let game;
let previousFrame = null;

function render() {
  renderBoard(board, game.board, game.active);
  renderNext(next, game.next);
  next.setAttribute('aria-label', `Next piece: ${game.next}`);
  score.textContent = String(game.score);
  lines.textContent = String(game.lines);
  const over = game.status === 'over';
  title.textContent = over ? 'Round over.' : 'Your move.';
  description.textContent = over
    ? `You cleared ${game.lines} lines. Ready for another round?`
    : 'Try the controls. Online matches are coming next.';
  restart.hidden = !over;
  board.dataset.state = game.status;
}

function startRound() {
  game = createGame(crypto.getRandomValues(new Uint32Array(1))[0]);
  previousFrame = null;
  render();
  board.focus({ preventScroll: true });
}

bindKeyboardControls((action) => {
  if (applyAction(game, action)) render();
}, () => game?.status === 'playing');

restart.addEventListener('click', startRound);
board.addEventListener('pointerdown', () => board.focus({ preventScroll: true }));
document.addEventListener('visibilitychange', () => { previousFrame = null; });

function frame(timestamp) {
  if (!document.hidden && previousFrame !== null) {
    if (advance(game, Math.min(timestamp - previousFrame, MAX_FRAME_MS))) render();
  }
  previousFrame = document.hidden ? null : timestamp;
  requestAnimationFrame(frame);
}

connectToServer((state, message) => {
  connectionStatus.dataset.state = state;
  connectionStatus.textContent = message;
  retryConnection.hidden = state !== 'disconnected';
});
startRound();
requestAnimationFrame(frame);

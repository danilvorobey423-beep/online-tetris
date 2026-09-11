import { BOARD_WIDTH, BOARD_HEIGHT } from '/shared/constants.js';
import { pieceMatrix } from '/shared/pieces.js';

const colors = {
  I: '#59e4da', J: '#5f87ff', L: '#ffad62', O: '#f7d65b',
  S: '#79df99', T: '#b69aff', Z: '#ff738b',
};

function drawCell(context, x, y, size, type) {
  context.fillStyle = colors[type];
  context.fillRect(x + 1, y + 1, size - 2, size - 2);
  context.fillStyle = '#ffffff45';
  context.fillRect(x + 2, y + 2, size - 4, 2);
  context.fillStyle = '#00000025';
  context.fillRect(x + 2, y + size - 4, size - 4, 2);
}

export function renderBoard(canvas, board, active) {
  const context = canvas.getContext('2d');
  const size = canvas.width / BOARD_WIDTH;
  context.fillStyle = '#101724';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = '#223047';
  context.lineWidth = 1;
  context.beginPath();
  for (let x = 1; x < BOARD_WIDTH; x += 1) {
    context.moveTo(x * size + 0.5, 0);
    context.lineTo(x * size + 0.5, canvas.height);
  }
  for (let y = 1; y < BOARD_HEIGHT; y += 1) {
    context.moveTo(0, y * size + 0.5);
    context.lineTo(canvas.width, y * size + 0.5);
  }
  context.stroke();
  board.forEach((row, y) => row.forEach((type, x) => {
    if (type) drawCell(context, x * size, y * size, size, type);
  }));
  if (active) {
    active.matrix.forEach((row, y) => row.forEach((cell, x) => {
      if (cell) drawCell(context, (active.x + x) * size, (active.y + y) * size, size, active.type);
    }));
  }
}

export function renderNext(canvas, type) {
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  const cells = [];
  pieceMatrix(type).forEach((row, y) => row.forEach((cell, x) => {
    if (cell) cells.push({ x, y });
  }));
  const minX = Math.min(...cells.map((cell) => cell.x));
  const maxX = Math.max(...cells.map((cell) => cell.x));
  const minY = Math.min(...cells.map((cell) => cell.y));
  const maxY = Math.max(...cells.map((cell) => cell.y));
  const size = 18;
  const offsetX = (canvas.width - (maxX - minX + 1) * size) / 2;
  const offsetY = (canvas.height - (maxY - minY + 1) * size) / 2;
  cells.forEach(({ x, y }) => {
    drawCell(context, offsetX + (x - minX) * size, offsetY + (y - minY) * size, size, type);
  });
}

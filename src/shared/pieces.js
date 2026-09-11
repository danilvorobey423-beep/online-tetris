export const PIECE_TYPES = Object.freeze(['I', 'J', 'L', 'O', 'S', 'T', 'Z']);

const shapes = {
  I: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
  J: [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
  L: [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
  O: [[1, 1], [1, 1]],
  S: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
  T: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
  Z: [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
};

export function pieceMatrix(type) {
  if (!PIECE_TYPES.includes(type)) throw new Error('Unknown tetromino type.');
  return shapes[type].map((row) => [...row]);
}

export function rotateMatrix(matrix) {
  return matrix.map((row, y) => row.map((cell, x) => matrix[matrix.length - 1 - x][y]));
}

export function createGenerator(seed) {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) {
    throw new Error('The piece seed must be an unsigned 32-bit integer.');
  }
  return { randomState: seed, bag: [] };
}

function random(generator) {
  // Mulberry32 uses explicit 32-bit arithmetic for reproducible browser/server bags.
  generator.randomState = (generator.randomState + 0x6d2b79f5) >>> 0;
  let value = generator.randomState;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
}

export function nextPiece(generator) {
  if (generator.bag.length === 0) {
    generator.bag = [...PIECE_TYPES];
    for (let index = generator.bag.length - 1; index > 0; index -= 1) {
      const other = Math.floor(random(generator) * (index + 1));
      [generator.bag[index], generator.bag[other]] = [generator.bag[other], generator.bag[index]];
    }
  }
  return generator.bag.pop();
}

# Initial game rules

These are the baseline rules for M1. The local gameplay preview exercises the engine before M2 matchmaking; its score and board are not authoritative online match results.

## Board and pieces

- The board is 10 columns by 20 visible rows, with no hidden rows. Coordinates start at the top left: x increases rightward and y downward.
- Empty cells are `0`; locked cells contain their tetromino type (`I`, `J`, `L`, `O`, `S`, `T`, or `Z`). The active piece is separate from the locked board.
- Shapes use square matrices: I is 4 x 4, O is 2 x 2, and the other pieces are 3 x 3. Spawn orientations are defined once in `src/shared/pieces.js`.
- Spawn at `x = floor((10 - matrixSize) / 2)`, `y = 0`. Every occupied cell must fit inside the board and avoid locked cells. Empty matrix padding does not collide.
- Rotate clockwise within the piece's square matrix. O rotation is a no-op. Reject a blocked rotation without shifting the piece; there are no wall/floor kicks.

## Generation

Use a seeded 7-bag: shuffle one of each type with Fisher-Yates, consume all seven, then shuffle the next bag. The generator stores a 32-bit Mulberry32 state and the remaining bag, so identical seeds and actions reproduce identical rounds. Seeds are unsigned 32-bit integers, including zero.

The M1 preview chooses its seed with browser `crypto.getRandomValues`. M2 will supply the seed or sequence from the server. One next piece is visible; hold is not implemented.

## Movement, gravity, and locking

- Left/right moves one column when legal.
- Gravity attempts one downward step every 1000 ms of simulation time; speed is fixed for this baseline.
- Soft drop attempts one downward step immediately. A successful soft-drop cell earns 1 point.
- Hard drop moves to the lowest legal position and locks immediately, earning 2 points per descended cell.
- A blocked downward step (gravity or soft drop) locks the piece. There is no separate lock-delay mechanic. Sideways movement and rotation do not reset the gravity clock.
- Manual downward actions reset the gravity clock. Gravity preserves leftover simulation time across automatic locks. Browser frames contribute at most 250 ms; hidden-tab time is excluded in this local preview.
- Locking merges the piece into the board, clears all full rows simultaneously, updates score/lines, and spawns the next piece. Remaining rows keep their order; empty rows are inserted at the top.

## Score and end of round

| Lines cleared by one lock | Points |
| --- | --- |
| 0 | 0 |
| 1 | 100 |
| 2 | 300 |
| 3 | 500 |
| 4 | 800 |

Drop points are added separately. No levels, combo, back-to-back, T-spin, or perfect-clear bonuses are included. Line totals count rows actually removed.

If a new piece cannot spawn, the round ends immediately. The active piece becomes null; movement, drops, rotation, and gravity no longer change the round. The final board and score remain visible. `Play again` creates a new empty round with a fresh seed and zeroed counters.

## Controls and preview behavior

| Key | Action |
| --- | --- |
| Left / Right arrow | Move left / right |
| Up arrow | Rotate clockwise |
| Down arrow | Soft drop |
| Space | Hard drop |

Left/right/down use the operating system's keyboard repeat. Repeated keydown events for Up/Space are ignored, preventing repeated rotations or multiple hard drops from one held key. Game keys prevent page scrolling while playing, except when a form control, link, or button has focus. The board is keyboard-focusable; starting/restarting a round focuses it.

The current page automatically starts a local gameplay preview. The opponent field explicitly states that online matches are coming next. Socket connection status remains separate from the local round: network loss does not turn a preview into an online result, and the existing `Reconnect` action reloads the page. This temporary local flow will be replaced by the server-controlled match lifecycle in M2/M4.

Garbage attacks, online results, and rematch consent are not part of M1; their rules remain T20/T30/T42 work.

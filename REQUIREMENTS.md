# Requirements

## R1 - Browser entry

Visiting the game URL must load the game directly. The initial product must not require installation, registration, or a separate launcher.

## R2 - Two-player online match

The server must support a match consisting of two players.

Initial matchmaking behavior:
- first available player waits
- second available player joins
- server creates a match
- players are notified when the match is ready

## R3 - Core Tetris gameplay

The initial implementation should support standard tetromino gameplay:
- 10-column board
- visible playfield of 20 rows
- seven tetromino types: I, J, L, O, S, T, Z
- movement left/right
- soft drop
- hard drop
- rotation
- collision detection
- piece locking
- line clearing
- game-over/top-out detection
- next-piece display

Hold piece, ghost piece, wall-kick system, lock delay, combo system, T-spins, perfect clears, and advanced scoring should only be considered implemented when explicitly defined and tested.

## R4 - Piece generation

Use a deterministic and fair piece generator. Preferred behavior is a 7-bag generator.

For competitive synchronization, the server should provide or control the match seed or piece sequence.

## R5 - Competitive garbage

The game should support sending garbage lines to the opponent.

The exact attack table must be documented before advanced competitive logic is considered complete.

The server must not blindly trust client claims about attacks.

## R6 - Server authority

The server owns:
- matchmaking
- match identity
- player association
- match lifecycle
- disconnect handling
- competitive events that affect the opponent
- final win/loss state

The final architecture may keep moment-to-moment falling-piece simulation client-side for responsiveness, but competitive events must be validated sufficiently to prevent trivial cheating and desynchronization.

## R7 - Opponent information

Each player should be able to see enough opponent state to understand the match.

The first version may transmit a lightweight representation of the opponent board rather than full rendering state.

## R8 - Disconnect behavior

If one player disconnects during a match:
- the server must detect it
- the remaining player must receive a clear result/status
- the abandoned match must be cleaned up
- server memory must not leak stale match objects

Reconnection support is optional until explicitly requested.

## R9 - Server environment

The application must run under Ubuntu in WSL.

The preferred startup shape is simple, for example:

```bash
npm install
npm start
```

No CI or remote build system is required.

## R10 - Public networking

The application should be compatible with Cloudflare Tunnel.

The server should listen on a configurable host and port.

Suggested defaults:
- host: `0.0.0.0`
- port: `3000`

## R11 - Configuration

Configuration should come from environment variables where appropriate.

Examples:
- `PORT`
- `HOST`
- `NODE_ENV`

Secrets must not be committed.

## R12 - Logging

Server logs should cover:
- startup
- listening address
- player connection/disconnection
- matchmaking
- match creation/end
- unexpected server errors

Logs should not expose secrets or excessive personal information.

## R13 - Security baseline

The project must:
- validate incoming socket event payloads
- limit obviously abusive message rates where practical
- reject malformed or impossible competitive events
- avoid exposing filesystem paths or stack traces to clients
- avoid trusting client-supplied identity or match ownership
- avoid committing credentials

## R14 - User interface

Initial UI should prioritize function over decoration.

At minimum:
- own board
- opponent board/status
- next piece
- score or relevant game status
- match state: waiting / starting / playing / won / lost / disconnected

## R15 - Controls

Desktop keyboard controls must be documented in the UI or project docs.

Exact keys may be selected during implementation and should remain consistent once published.

## R16 - No repository automation

Do not add:
- GitHub Actions
- CI checks
- automated builds
- automated deployments
- automated releases

unless the user explicitly requests them later.

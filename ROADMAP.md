# Roadmap

## Goal and current state

Deliver the first playable browser-based 1v1 Tetris at `tetris.droradditive.com`, hosted on the owner's Windows laptop inside Ubuntu/WSL through Cloudflare Tunnel.

As of 2026-09-11, M0 and M1 are complete: the foundation server, socket connectivity, shared deterministic game core, and playable local preview are verified in Ubuntu/WSL with Chromium and Firefox browser checks. Multiplayer matches and public deployment remain pending. The next task is T20.

This roadmap sequences the existing requirements; it does not replace them. [TASKS.md](TASKS.md) is the source of truth for task status and acceptance criteria. Follow [AGENTS.md](AGENTS.md) for implementation and [TESTING.md](TESTING.md) for verification.

## Milestones

| Stage | Outcome | Tasks | Depends on |
| --- | --- | --- | --- |
| M0 - Foundation (complete) | A page and socket connection work locally in Ubuntu/WSL | T00-T03 | None |
| M1 - Game core (complete) | A complete local Tetris round works with deterministic rules | T10-T15 | M0 |
| M2 - Multiplayer | Two browsers automatically join the same match and see each other | T20-T25 | M1 |
| M3 - Competition | Validated attacks, top-out, and final results work end to end | T30-T34 | M2 |
| M4 - Match experience | The single-page interface supports the complete match and rematch flow | T40-T44 | M3 |
| M5 - Public play | Two remote players can play through the public hostname | T50-T53 | M4 |

The order is based on dependencies, not calendar estimates. Complete and verify one milestone before treating the next as ready. A milestone is complete only when its tasks and exit check pass; unavailable WSL, account access, or a remote test device must be recorded as a blocker rather than a successful check.

## M0 - Foundation

Build the smallest Node.js application using the preferred Express + Socket.IO baseline. Serve one game page, configure host/port through environment variables, and keep dependencies and secrets out of version control where appropriate.

**Exit check:** From Ubuntu/WSL, `npm install` and `npm start` work, the page loads, a browser establishes a socket connection, and an occupied port produces a clear startup failure. Record the actual runtime versions and commands.

## M1 - Game core

Define the initial rules before implementing them: spawn position, rotation, gravity, locking, scoring/status, and top-out. Implement the 10 x 20 visible board, seven tetrominoes, seeded 7-bag generator, movement, drops, collision, locking, line clearing, and next-piece display.

Keep rules separate from rendering, input, and networking so they can also support server validation. Use local play to verify the engine during development; this does not add a separate single-player product mode.

**Exit check:** A local round can be played through to top-out. Deterministic tests cover the generator, board boundaries, collision, rotation, drops, locking, and line clearing. Browser checks pass in Chromium and Firefox without unexplained console errors.

## M2 - Multiplayer

First document the protocol and choose how the server will validate competitive gameplay against legal state transitions. Payload shape checks alone cannot establish that a claimed attack or win is legitimate. Record the chosen approach in [ARCHITECTURE.md](ARCHITECTURE.md) and [DECISIONS.md](DECISIONS.md) before implementing the match protocol.

Add connection identity, the waiting queue, exactly two players per match, server-controlled piece generation, a shared countdown, opponent updates, and cleanup when a player leaves. Keep update payloads and frequency bounded.

**Exit check:** Two independent browser sessions wait, pair, start, and exchange opponent state correctly. Separate matches stay isolated. Disconnecting during waiting, countdown, or play releases stale state and informs the remaining player. This milestone verifies networking; validated competitive play is completed in M3.

## M3 - Competition

Document the basic attack table and garbage behavior before adding attacks: how many rows each line clear sends, how gaps are chosen, when incoming rows apply, and how overflow affects top-out. Define simultaneous-loss and late/duplicate-event behavior. Keep advanced attacks outside the initial version.

Implement the validation approach selected in M2. The server must determine attacks and final results from sufficiently validated gameplay, not arbitrary client-supplied totals. Test invalid messages, ownership, repeated events, and match completion races.

**Exit check:** Legal line clears produce exactly the documented attacks; garbage and losses are consistent on both browsers. Forged, impossible, duplicate, stale, or wrong-match events cannot create attacks or change a finished result. Each match ends once and is cleaned up.

## M4 - Match experience

Finish the layout described in [UI_DESIGN.md](UI_DESIGN.md): local board on the left, opponent board on the right, narrow match status in the center, dark background, clear grids, and bright figures. Keep controls, next piece, and incoming garbage readable.

Complete all visible states and the rematch handshake. Opening the URL must enter the game interface directly. Both players must agree before a rematch starts; neither should need to reload the page. Define the remaining player's route back to matchmaking after an opponent leaves.

**Exit check:** Two players can complete a match, request and accept a rematch, and play again without reloading or restarting the server. Waiting, countdown, win/loss, and connection loss are clear. Verify the full flow in Chromium and Firefox.

## M5 - Public play

Verify the completed application in its intended Ubuntu/WSL environment, then configure Cloudflare Tunnel and the expected hostname. Keep tunnel credentials outside the repository. Document manual application/tunnel startup, shutdown, and recovery after laptop or WSL restart.

**Exit check:** Two physical devices on separate networks load the HTTPS page, connect through the tunnel, play a match, exchange garbage, receive a consistent result, and rematch. Test disconnect/reload behavior and the documented restart procedure. Record actual results in [WORKLOG.md](WORKLOG.md).

## Decisions to resolve during implementation

| Decision | Resolve in | Must be settled before |
| --- | --- | --- |
| Initial rotation, spawn, gravity, locking, score/status, and top-out rules (resolved in `GAME_RULES.md`) | T10 | T11-T15 |
| Server validation approach and event ordering | T20 | T21-T25 and competitive implementation |
| Attack table, garbage gaps/application, and simultaneous-loss policy | T30 | T31-T34 |
| Rematch lifecycle and return to matchmaking after disconnect | T42 | T44 |
| Actual WSL runtime, tunnel routing, and restart commands | T03, T50-T51 | T52-T53 |

Prefer a conservative interpretation within the approved scope. Ask the owner only if a choice would materially change the product or architecture, as required by `AGENTS.md`.

## Scope boundaries

The first version has no accounts, database, rankings, persistent statistics, spectators, room browser, or separate lobby page. Hold, ghost piece, wall kicks, lock delay, advanced attacks, touch controls, and reconnection remain optional backlog items until explicitly scoped and tested.

Use plain browser JavaScript and the small server baseline. Do not add frontend frameworks, containers, GitHub Actions, CI/CD, automated deployment, or automatic startup as part of this roadmap. Commits, pushes, branches, and pull requests require an explicit user request under `AGENTS.md`.

## Tracking completion

- Work through the task dependencies in [TASKS.md](TASKS.md); the next pending task is T20.
- Check off a task only after its acceptance criteria pass; retain any failed or unavailable verification as pending.
- Update the worklog with the change and evidence, and record durable technical decisions when made.
- Update architecture, protocol, testing, deployment, and user instructions when the implementation makes those documents concrete.
- No application functionality is considered complete merely because it has been planned here.

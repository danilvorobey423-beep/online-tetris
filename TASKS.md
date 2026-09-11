# Tasks

Implementation backlog for [ROADMAP.md](ROADMAP.md). As of 2026-09-11, M0 and M1 are complete, including Ubuntu/WSL tests and Chromium/Firefox gameplay checks. M2 and all later milestones remain pending.

Task IDs are stable. Dependencies refer to task IDs. `[ ]` means pending and `[x]` means implemented and verified against the stated acceptance criteria. Record blockers and verification evidence in [WORKLOG.md](WORKLOG.md); do not check off blocked or partially verified tasks.

**Next task:** T20. Define the multiplayer protocol and authority model using the shared deterministic core. See `DEPLOYMENT.md` for verified WSL runtime and startup commands. Complete each milestone's verification task before moving to the next milestone. Follow [AGENTS.md](AGENTS.md) and keep related documentation current as part of each task.

## M0 - Foundation

- [x] **T00 - Initialize the Node.js project.** Add `package.json`, the start script, dependency lockfile, and `.gitignore`; select and document a supported Node.js version and a consistent module format. Include ignore rules for dependencies, `.env`, logs, temporary files, editor files, and OS metadata.
  - Depends on: none.
  - Done when: the minimal dependency installation succeeds, the intended entry point exists, and generated/private files are excluded from Git.

- [x] **T01 - Serve the game page.** Add Express, serve `public/index.html`, and read validated `HOST`/`PORT` configuration with the documented defaults. Log startup and handle startup failures clearly.
  - Depends on: T00.
  - Done when: the page loads on the configured address; invalid configuration and an occupied port fail clearly without exposing server internals to browsers.

- [x] **T02 - Add socket connectivity.** Attach Socket.IO to the HTTP server and a minimal browser client; document connection/status behavior and add connection/disconnection logs.
  - Depends on: T01.
  - Done when: opening and closing the page establishes and closes a socket connection, and connection loss is visible in the page.

- [x] **T03 - Verify the foundation under Ubuntu/WSL.** Run installation and startup in the target environment; record runtime versions and usable local commands in `README.md` and `DEPLOYMENT.md`.
  - Depends on: T00, T01, T02.
  - Done when: HTTP, socket connectivity, host/port overrides, and occupied-port handling pass in WSL with evidence recorded. M0 exit check passes.

## M1 - Game core

- [x] **T10 - Define the initial game rules.** Document board representation, seven shapes, spawn/rotation behavior, gravity, locking, line clearing, top-out, keyboard mapping, and basic score/status behavior. Keep constants and deterministic rules shareable by client and server.
  - Depends on: T03.
  - Done when: the rules are explicit enough to implement and test, and optional mechanics are clearly excluded from the baseline rather than implicitly assumed.

- [x] **T11 - Implement the board and piece generator.** Add board state, tetromino definitions, spawn, and a seedable 7-bag generator.
  - Depends on: T10.
  - Done when: tests prove each bag contains all seven pieces exactly once, the same seed produces the same sequence, spawn matches the rules, and board dimensions are correct.

- [x] **T12 - Implement movement and rotation.** Add left/right movement, gravity, soft/hard drop, rotation, and collision against boundaries and locked cells.
  - Depends on: T11.
  - Done when: legal moves work and illegal moves preserve valid state; tests cover walls, floor, occupied cells, blocked rotations, and hard-drop landing.

- [x] **T13 - Complete the round lifecycle.** Add locking, line clearing, next-piece advancement, basic score/status updates, and top-out.
  - Depends on: T12.
  - Done when: tests cover single and multiple line clears, correct board compaction, locking, piece advancement, and game-over behavior; gameplay stops after top-out.

- [x] **T14 - Add rendering and keyboard input.** Render the board, active/next pieces, and status; wire documented controls and prevent game keys from scrolling the page while playing.
  - Depends on: T13.
  - Done when: a local round is playable through top-out in the browser, rendering reflects game state, and input/rendering remain separate from rules and networking.

- [x] **T15 - Verify the complete game core.** Run deterministic tests and the gameplay checklist in `TESTING.md`; document actual test commands and controls.
  - Depends on: T11, T12, T13, T14.
  - Done when: core tests pass and browser playthroughs in Chromium and Firefox (interactive or driven by keyboard automation, with rendered output reviewed) confirm movement, rotation, drops, line clearing, next piece, and top-out without unexplained console errors. Record the actual verification method. M1 exit check passes.

## M2 - Multiplayer

- [ ] **T20 - Define the protocol and authority model.** Document event names, direction, payloads, validation, ownership, ordering, lifecycle states, and update limits. Select how legal gameplay will be checked before accepting attacks/results; record the decision and its limitations in `ARCHITECTURE.md` and `DECISIONS.md`.
  - Depends on: T15.
  - Done when: the protocol supports start, gameplay/opponent state, attacks, results, rematch, and disconnect; the planned validation goes beyond trusting client totals or checking payload shape.

- [ ] **T21 - Implement queue and match ownership.** Assign server-owned player identities, queue available players, pair exactly two, and create isolated match state in memory.
  - Depends on: T20.
  - Done when: tests cover one waiting player, two paired players, multiple isolated pairs, duplicate queue requests, and prevention of membership in two active matches.

- [ ] **T22 - Start synchronized matches.** Issue the server-controlled seed/sequence, initial state, and countdown; activate both clients from the agreed match start.
  - Depends on: T21.
  - Done when: both browsers enter the same match with consistent piece generation, no gameplay is accepted before start, and duplicate start events do not restart a running match.

- [ ] **T23 - Exchange opponent state.** Send validated, bounded board/status updates and render the opponent representation; avoid unnecessary full-board updates at render frequency.
  - Depends on: T22.
  - Done when: two browsers see relevant opponent changes, stale or wrong-match updates are rejected, and message size/frequency limits are documented and exercised.

- [ ] **T24 - Handle disconnects and cleanup.** Handle departure while waiting, during countdown, and during play; notify the remaining player and release queue entries, match state, and timers. Document reload behavior; automatic reconnection remains out of scope.
  - Depends on: T21, T22, T23.
  - Done when: automated lifecycle checks and browser checks show no abandoned active match/queue entry after disconnect, and the remaining player gets a clear status.

- [ ] **T25 - Verify multiplayer foundations.** Test the protocol, ownership checks, queue transitions, synchronized start, opponent updates, and disconnect behavior using independent browser sessions.
  - Depends on: T20, T21, T22, T23, T24.
  - Done when: malformed messages do not crash the server, matches stay isolated, and the waiting-to-play-to-disconnect flow passes with evidence recorded. M2 exit check passes.

## M3 - Competition

- [ ] **T30 - Define attack and result rules.** Document the basic line-clear attack table, garbage gap generation, application timing, pending-garbage behavior, overflow/top-out, simultaneous losses, and handling of late/duplicate events.
  - Depends on: T25.
  - Done when: each rule has concrete examples suitable for tests; combo, T-spin, back-to-back, and perfect-clear attacks remain outside the baseline.

- [ ] **T31 - Implement authoritative competitive validation.** Implement the approach selected in T20 using shared rules where useful; validate ownership, event order, and legal state transitions before deriving line clears, attacks, and loss state. Enforce payload size and message-rate limits.
  - Depends on: T30.
  - Done when: tests reject forged line-clear/attack totals, impossible gameplay transitions, duplicate/stale events, malformed payloads, and wrong-player/match actions without crashing or granting an advantage.

- [ ] **T32 - Implement garbage exchange.** Generate and apply garbage from validated events using the documented attack table, gap rules, and timing; expose pending garbage to the client.
  - Depends on: T31.
  - Done when: tests and two-browser checks confirm correct attack counts, gaps, bottom insertion, pending state, and overflow handling; each accepted attack applies once.

- [ ] **T33 - Resolve and clean up finished matches.** Make the server resolve top-out and disconnect outcomes, notify both clients when connected, stop gameplay, and release active match resources. Define the minimal bounded state needed for a rematch invitation.
  - Depends on: T32, T24.
  - Done when: both clients receive consistent results, a match ends once even if loss/disconnect events race, and late events cannot affect a finished or subsequent match.

- [ ] **T34 - Verify competitive play.** Run game-rule, protocol-abuse, and lifecycle tests plus a full two-browser match with attacks and top-out.
  - Depends on: T30, T31, T32, T33.
  - Done when: attack-table examples, garbage overflow, duplicate attacks, simultaneous losses, and disconnect/end races behave as documented. M3 exit check passes.

## M4 - Match experience

- [ ] **T40 - Finish the single-page layout.** Follow `UI_DESIGN.md`: primary local board on the left, readable opponent board on the right, narrow center status, next piece, score/status, controls, and incoming garbage indicator.
  - Depends on: T34.
  - Done when: the dark arcade layout keeps both boards and essential information readable at documented desktop viewport sizes, with no separate lobby or registration flow.

- [ ] **T41 - Complete visible match states.** Show waiting, opponent connected, countdown, playing, won/lost, and disconnected states; enable gameplay input only while the local player is actively playing.
  - Depends on: T40.
  - Done when: opening the URL automatically enters matchmaking and every server lifecycle state has a clear UI representation, including local connection loss.

- [ ] **T42 - Implement rematch and re-entry.** Define and implement mutual rematch consent, fresh match state/seed, and the remaining player's route back to matchmaking when an opponent leaves. Document invitation cleanup and one-sided request behavior.
  - Depends on: T41, T33.
  - Done when: one request alone cannot start a rematch, both requests start a fresh match without reload, duplicate requests are safe, and opponent departure leaves no stale invitation or duplicate queue entry.

- [ ] **T43 - Update player and operator instructions.** Document exact keyboard controls, entry flow, attacks, end states, rematch, and disconnect/reload behavior; update `README.md`, `UI_DESIGN.md`, and the manual test checklist to match the implementation.
  - Depends on: T42.
  - Done when: a player can understand how to play from the page and the documentation contains no claims for unimplemented optional features.

- [ ] **T44 - Verify the complete local experience.** Test repeated matches and rematches in independent Chromium/Firefox sessions, including disconnect during countdown, play, and a rematch request.
  - Depends on: T40, T41, T42, T43.
  - Done when: all game/network tests pass, the full user flow works without reload between agreed rematches, and no unexplained client/server errors or stale active matches appear. M4 exit check passes.

## M5 - Public play

- [ ] **T50 - Verify the completed app in Ubuntu/WSL.** Follow the documented installation/start instructions from a stopped application, verify configuration and binding, and run the application tests in WSL.
  - Depends on: T44.
  - Done when: the finished game works locally in WSL and the commands, runtime versions, and actual verification results are recorded in `DEPLOYMENT.md` and `WORKLOG.md`.

- [ ] **T51 - Configure public routing.** Configure Cloudflare Tunnel and `tetris.droradditive.com` for the local WSL service, using the owner's authorized account access. Keep credentials outside Git and document actual routing and tunnel commands without secrets.
  - Depends on: T50.
  - Done when: the hostname serves the game over HTTPS and Socket.IO connects through the tunnel; only the intended game service is routed. Missing account access is recorded as blocked, not complete.

- [ ] **T52 - Verify two remote players.** Use two physical devices on separate networks to test page load, automatic pairing, countdown, opponent updates, attacks, results, rematch, and disconnect/reload behavior through the public hostname.
  - Depends on: T51.
  - Done when: the full remote match flow passes and the date, tested setup, and results are recorded; two local tabs alone do not satisfy this task.

- [ ] **T53 - Document and verify manual operations.** Document application/tunnel start and stop, log locations, and recovery after laptop/WSL restart; follow the procedure and repeat the public connection check.
  - Depends on: T52.
  - Done when: the owner has reproducible manual commands, restart recovery is verified, all milestone checks pass, and remaining limitations are recorded. M5 exit check passes; the first public playable version is complete.

## Later / optional - outside the first playable release

These preserve the existing backlog. They have no milestone commitment or dependency on the initial release; scope and test criteria must be defined before implementation.

- [ ] **L01** - Ghost piece.
- [ ] **L02** - Hold piece.
- [ ] **L03** - SRS wall kicks.
- [ ] **L04** - Lock delay.
- [ ] **L05** - DAS/ARR tuning.
- [ ] **L06** - T-spin detection.
- [ ] **L07** - Combo attacks.
- [ ] **L08** - Back-to-back attacks.
- [ ] **L09** - Perfect clears.
- [ ] **L10** - Sound.
- [ ] **L11** - Touch controls.
- [ ] **L12** - Reconnection.
- [ ] **L13** - Room codes.
- [ ] **L14** - Private rooms.
- [ ] **L15** - Spectator mode.
- [ ] **L16** - Persistent statistics.

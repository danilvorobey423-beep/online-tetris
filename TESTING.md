# Testing

## Purpose

Testing should provide confidence without turning the project into an infrastructure project. There is no CI requirement. Tests and checks are run locally.

## Implemented automated checks

With Node.js 24.x and dependencies installed:

```bash
npm run check
npm test
```

`npm run check` recursively checks application/test JavaScript syntax. `npm test` uses the built-in Node test runner. The eleven foundation tests use isolated loopback servers and real Socket.IO clients and cover:

- Default/overridden binding configuration and invalid values.
- Public page/assets, repository file isolation, and safe malformed-path responses.
- Two independent clients over polling and over WebSocket; disconnect cleanup.
- Oversized socket payload rejection and continued HTTP availability.
- Client notification when the server closes.
- Actual CLI failure for occupied ports and invalid environment variables.
- CLI startup from another working directory, real socket connectivity, and clean SIGTERM shutdown (Unix only; explicitly skipped on Windows).

The nineteen deterministic game tests in `test/game.test.js` cover:

- All seven shapes, four rotations, and independent shape templates/board rows.
- One of each piece per bag across 100 bags and three seeds, reproducible sequences, saved generator state, and rejected invalid seeds.
- Centered spawn, boundaries, occupied cells, padding, legal movement, and blocked wall/floor/stack rotations.
- Gravity timing and equivalent elapsed time split across frames, including automatic locking.
- Soft/hard drop distance points, obstacle landing, locking, and next-piece advancement.
- One through four line clears, board compaction, and the documented line points.
- Blocked spawn, frozen game-over state, deterministic action replay, and fresh-round counters.

The HTTP tests also load the shared game modules and verify that server source remains inaccessible.

### Foundation browser checklist

1. Run `npm start` and open `http://localhost:3000`.
2. Confirm the local playable board, opponent placeholder, and `Connected`.
3. Open another tab and confirm it connects independently.
4. Confirm normal page load leaves no unexplained browser console errors.
5. Stop the server; both pages should show `Disconnected` with a `Reconnect` link.
6. Restart the server and click `Reconnect`; the page should return to `Connected`.

The M0 foundation passed all 11 tests in Ubuntu 26.04 / WSL 2 using Node.js 24.21.0 and npm 11.19.0 on 2026-09-11. On Windows, 10 passed and the Unix signal test was explicitly skipped. Windows Chromium browser checks passed against the WSL server on ports 3000 and 3100, including disconnect/restart/reconnect without console errors.

## M1 gameplay browser checklist

Run `npm start`, then exercise the page in current Chromium and Firefox. Interactive play or keyboard-driven browser automation may be used; record which was used and review the rendered result. Automation must exercise actual keyboard input and visible output, without adding test controls to the shipped page.

1. Confirm a four-cell piece spawns, NEXT shows a piece, counters start at zero, and connection status is independent of gameplay.
2. Leave the board visible for a second: gravity moves the piece without awarding drop points.
3. Use Left/Right to move to each wall. Use Up to rotate in clear space; blocked rotations must not cross the wall, floor, or stack.
4. Use Down for a one-cell soft drop and Space for an immediate landing/lock. Check score changes and NEXT advancement. Holding Space or Up must not repeatedly lock or rotate.
5. Fill rows and confirm they disappear, higher cells shift down, and LINES/score update. Deterministic tests cover all four clear counts and exact scoring.
6. Repeatedly hard-drop in the center until spawn is blocked. Confirm `Round over.`, a final frozen board/score, and `Play again`.
7. Click `Play again`: the board/counters reset, the button hides, and keyboard focus returns to the board.
8. In a short viewport, game keys must not scroll while playing. Inspect NEXT, counters, and controls for overlap and horizontal overflow. Check that form controls/buttons retain normal keyboard behavior when focused.
9. Switch away and return: the local preview excludes hidden-tab gravity time. This is not the future online timing policy.
10. Check the console for unexplained errors and warnings.

### Recorded M1 verification (2026-09-11)

- WSL: `npm run check` passed for 13 JavaScript files; `npm test` passed all 30 tests with no skips or failures.
- Codex Chromium, connected to the WSL server: exercised movement, rotation, soft/hard drop, NEXT, top-out, and `Play again` through the visible page. Inspected the rendered board and later observed a cleared-line count of 1 during active play. No console warnings/errors.
- Firefox 153.0 on Windows: used a separate headless browser with keyboard automation and reviewed a screenshot. The unmodified page passed real gravity/connection checks. A test-only seed of 42 and paused animation then made input/render assertions reproducible; every board cell, score, line counter, and NEXT label was checked after each key against a deterministic replay. Cleared 2 lines in 11 pieces (score 557), then verified top-out, ignored post-game input, restart/focus, held-Space repeat suppression, and scroll prevention. No console errors. Inspected the 1366 x 900 rendering and checked 800 x 700 for horizontal overflow.
- The Firefox browser, bundled Playwright runtime, and temporary QA harness are external development tools, not project dependencies or shipped files. These were automated Firefox checks, not a claimed human Firefox play session. T15's verification wording permits either browser interaction method with the same gameplay coverage.

Network matchmaking and competitive behavior remain unimplemented; the following multiplayer/remote checklists have not passed for M1.

## Minimum verification after server changes

Run at least:

```bash
npm start
```

Confirm:
- process starts successfully
- expected listening address is logged
- page can be loaded
- no immediate unhandled exception occurs

If automated tests exist, run them as well.

## Minimum verification after client gameplay changes

Check manually in a browser:
- page loads without console errors
- piece spawns
- movement works
- rotation works
- collision works
- hard/soft drop works if affected
- lines clear correctly if affected
- top-out works if affected

## Multiplayer verification

For networking changes, open two independent browser sessions. Prefer:
- two browser profiles, or
- normal + private window

Check:
1. first player waits
2. second player joins
3. both enter the same match
4. both receive start state
5. opponent status updates
6. garbage/attack behavior if affected
7. win/loss state if affected
8. disconnect one player
9. remaining player receives correct status
10. server cleans up the match

## Remote verification

Before considering deployment complete, test from a second physical network/device through the Cloudflare hostname.

Verify:
- HTTPS page loads
- Socket.IO/WebSocket connects
- match can start
- gameplay messages cross the tunnel
- disconnect/reload behavior is sane

## Automated tests

Automated tests are encouraged for deterministic logic such as:
- tetromino collision
- rotation rules
- line clearing
- 7-bag generation
- garbage generation
- payload validation
- matchmaking state transitions

Do not introduce a heavy testing framework unless needed.

## Regression rule

When fixing a reproducible bug in deterministic logic, add a regression test when reasonably practical.

## Browser console

A task is not considered cleanly verified if it leaves new unexplained browser console errors.

## Server console

A task is not considered cleanly verified if normal gameplay produces repeated warnings, uncaught errors, or unhandled promise rejections.

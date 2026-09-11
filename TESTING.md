# Testing

## Purpose

Testing should provide confidence without turning the project into an infrastructure project. There is no CI requirement. Tests and checks are run locally.

## Implemented foundation checks

With Node.js 24.x and dependencies installed:

```bash
npm run check
npm test
```

`npm run check` checks application JavaScript syntax. `npm test` uses the built-in Node test runner with isolated loopback servers and real Socket.IO clients. The eleven tests cover:

- Default/overridden binding configuration and invalid values.
- Public page/assets, repository file isolation, and safe malformed-path responses.
- Two independent clients over polling and over WebSocket; disconnect cleanup.
- Oversized socket payload rejection and continued HTTP availability.
- Client notification when the server closes.
- Actual CLI failure for occupied ports and invalid environment variables.
- CLI startup from another working directory, real socket connectivity, and clean SIGTERM shutdown (Unix only; explicitly skipped on Windows).

### Foundation browser checklist

1. Run `npm start` and open `http://localhost:3000`.
2. Confirm two empty board placeholders and `Connected`; gameplay is not available yet.
3. Open another tab and confirm it connects independently.
4. Confirm normal page load leaves no unexplained browser console errors.
5. Stop the server; both pages should show `Disconnected` with a `Reconnect` link.
6. Restart the server and click `Reconnect`; the page should return to `Connected`.

All 11 tests passed in Ubuntu 26.04 / WSL 2 using Node.js 24.21.0 and npm 11.19.0 on 2026-09-11. On Windows, 10 pass and the Unix signal test is explicitly skipped. Windows Chromium browser checks passed against the WSL server on the default port 3000 and overridden loopback port 3100, including disconnect/restart/reconnect without console errors. Firefox verification remains pending. The gameplay and matchmaking checklists below apply as those features are implemented; they have not passed for this foundation.

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

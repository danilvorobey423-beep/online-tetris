# Testing

## Purpose

Testing should provide confidence without turning the project into an infrastructure project. There is no CI requirement. Tests and checks are run locally.

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

# Architecture

## Overview

The project is a lightweight client/server browser game.

## Implemented foundation (2026-09-11)

The diagram and responsibilities below describe the target architecture. Currently implemented files are:

```text
server.js                    # Entry point, listening errors, signal shutdown
src/server/config.js         # HOST/PORT defaults and validation
src/server/app.js            # Express static files and Socket.IO lifecycle
public/index.html            # Empty two-board arena preview
public/css/main.css          # Arena layout and connection-state styles
public/js/main.js            # Connection status and explicit reload recovery
public/favicon.svg           # Local icon
test/foundation.test.js       # Configuration, HTTP, socket, and startup tests
```

Application modules use ES modules. The browser entry is a deferred script using the Socket.IO bundle served by the same HTTP server. Only `public/` is exposed as static content. Static paths are resolved relative to the module location, not the shell's working directory.

Express and Socket.IO share one Node HTTP server. HTTP polling and WebSocket are supported with the library's default upgrade behavior. Socket message payloads are limited to 16 KiB. There are no custom client-to-server gameplay handlers, player queue, match state, or persistence yet. Application rate limits and competitive validation remain work for M2/M3.

## Current connection protocol

| Event | Direction | Payload / validation | Behavior |
| --- | --- | --- | --- |
| `connection` | Socket.IO lifecycle on server | Socket.IO establishes the socket identity | Log connection; send `server:status` |
| `server:status` | Server to client | `{ status: 'connected' }`; client checks object and status | Show `Connected`; this does not imply matchmaking |
| `disconnect` | Socket.IO lifecycle on client/server | Socket.IO-provided reason | Server logs departure; client shows `Disconnected` and `Reconnect` |
| `connect_error` | Socket.IO lifecycle on client | Error details are not rendered | Show `Unable to connect` and `Reconnect` |

The page begins at `Connecting…`. A missing client bundle shows `Connection unavailable`. Automatic retries/reconnection are disabled; `Reconnect` reloads the page and creates a fresh socket. No match restoration is implied. Unknown custom client events have no application handler and no game-state effect.

The CLI logs startup, actual bound address, and errors. Invalid configuration or a listen failure exits with a nonzero status. SIGINT/SIGTERM close Socket.IO and HTTP connections, with a five-second shutdown deadline. HTTP error responses contain generic text; diagnostic details remain in server logs.

```text
Player 1 browser
        \
         \ HTTPS + WebSocket
          \
       Cloudflare
           |
    Cloudflare Tunnel
           |
    Ubuntu / WSL
           |
     Node.js server
       /        \
 HTTP static   Socket.IO
   files       multiplayer
       \        /
        Browser game
          logic/UI
```

## Server responsibilities

The Node.js server should be responsible for:
- serving static frontend files
- accepting Socket.IO/WebSocket connections
- assigning player connection state
- matchmaking
- creating matches
- maintaining match lifecycle
- validating network messages
- relaying or applying opponent-affecting events
- disconnect cleanup
- win/loss resolution
- basic logging

## Client responsibilities

The browser client should be responsible for:
- keyboard input
- local rendering
- local piece movement
- local board display
- sound/visual effects if later added
- sending defined gameplay events to the server
- displaying opponent state
- displaying match state

## Suggested source structure

```text
online-tetris/
├── AGENTS.md
├── PROJECT.md
├── REQUIREMENTS.md
├── ARCHITECTURE.md
├── TASKS.md
├── WORKLOG.md
├── DECISIONS.md
├── TESTING.md
├── DEPLOYMENT.md
├── CODE_STYLE.md
├── SECURITY.md
├── package.json
├── server.js
├── src/
│   ├── server/
│   │   ├── matchmaking.js
│   │   ├── matches.js
│   │   ├── protocol.js
│   │   └── validation.js
│   └── shared/
│       ├── constants.js
│       └── game-rules.js
└── public/
    ├── index.html
    ├── css/
    │   └── main.css
    └── js/
        ├── main.js
        ├── game.js
        ├── board.js
        ├── pieces.js
        ├── input.js
        ├── renderer.js
        └── network.js
```

This is a target structure, not a requirement to create every file immediately. Codex should only split files when the implementation benefits from it.

## Networking protocol

All socket events should have:
- documented event name
- defined sender
- defined payload shape
- validation
- expected server/client response

A future protocol table can live in this file once event names stabilize.

Example categories:
- connection/status
- matchmaking
- match start
- board snapshot
- attack/garbage
- game over
- rematch
- disconnect

## State ownership

Avoid ambiguous ownership.

Server-owned:
- queue
- match membership
- player connection identity
- match status
- authoritative competitive outcomes

Client-owned:
- rendering
- input
- short-term animation state

Shared/deterministic:
- tetromino definitions
- board dimensions
- rule constants
- piece generation rules

## Persistence

No database is required for the initial version.

All match state may be in memory.

The server must assume all in-memory state disappears on restart.

## Scalability target

The initial target is small private usage, not large public scale. Design should still avoid obvious leaks and pathological behavior.

Do not introduce distributed infrastructure prematurely.

## Failure behavior

Server:
- fail startup clearly if the port cannot be opened
- log unexpected errors
- avoid crashing because of malformed client payloads

Client:
- show disconnected state if socket connection is lost
- avoid freezing on malformed or missing opponent updates
- allow page reload to recover

## Future architecture changes

Any major change such as a database, authentication, persistent accounts, authoritative server simulation, containerization, or external hosting must be recorded in `DECISIONS.md`.

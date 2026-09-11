# Architecture

## Overview

The project is a lightweight client/server browser game.

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

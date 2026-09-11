# Project

## Name

Online Tetris

## Goal

Create a browser-based two-player online Tetris game that opens directly when the user visits the game page.

The game should be simple to access:
- no installation for players
- no account required for the initial version
- page opens directly into the game experience
- two players can be matched online
- the server runs on the owner's own laptop

## Hosting environment

Server machine:
- Windows laptop
- Ubuntu running under WSL
- Node.js application runs inside Ubuntu/WSL

Public access:
- domain: `droradditive.com`
- DNS/CDN provider: Cloudflare
- expected game hostname: `tetris.droradditive.com`
- public exposure through Cloudflare Tunnel
- router port forwarding should not be required

## Technology direction

Preferred baseline:
- Node.js
- Express
- Socket.IO or native WebSocket if there is a strong reason
- browser HTML/CSS/JavaScript
- no database for the initial version
- no frontend framework unless it becomes clearly necessary

## Product principles

- Fast page load
- Low complexity
- Reliable two-player synchronization
- Clear competitive behavior
- Minimal server administration
- Easy restart after laptop or WSL reboot
- Easy local development
- No unnecessary infrastructure

## Out of scope unless explicitly requested

- user accounts
- ranked ladder
- persistent statistics
- payments
- spectators
- tournaments
- AI opponents
- mobile app
- native desktop application
- database-backed profiles
- GitHub Actions
- CI/CD pipelines
- automated cloud builds
- Docker/Kubernetes
- microservices

## Definition of a useful first playable version

A first playable version should allow:
1. Player 1 opens the page.
2. Player 2 opens the same page.
3. The server pairs them into one match.
4. Both players play Tetris simultaneously.
5. Each player can see their own board and relevant opponent state.
6. Line clears can generate competitive garbage according to defined rules.
7. A player loses when their board tops out.
8. Both clients receive the match result.
9. A disconnected opponent is handled cleanly.
10. A new match can be started without restarting the server.

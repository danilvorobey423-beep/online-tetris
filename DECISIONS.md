# Technical Decisions

Use this file for durable technical choices that future work should respect. Do not record trivial implementation details.

## D001 - Server environment

**Decision:** Run the application inside Ubuntu on WSL on the owner's Windows laptop.

**Reason:** This is the intended hosting environment and keeps the server stack Linux-based while using the existing laptop.

**Status:** Accepted

---

## D002 - Public access

**Decision:** Use Cloudflare Tunnel for public access rather than requiring router port forwarding.

**Expected hostname:** `tetris.droradditive.com`

**Reason:** The owner already uses Cloudflare for `droradditive.com`, and Tunnel avoids exposing a router port directly.

**Status:** Accepted

---

## D003 - Initial backend stack

**Decision:** Prefer Node.js + Express + Socket.IO.

**Reason:** Small codebase, direct browser support, straightforward WebSocket-style multiplayer, and simple operation under Ubuntu/WSL.

**Status:** Accepted and implemented for the foundation: Express 5.2.1 and Socket.IO 4.8.3. Express provides static file serving and HTTP error handling; Socket.IO provides the same-origin client bundle, transport negotiation, and connection lifecycle. These implement the already preferred baseline rather than a custom transport protocol.

---

## D004 - Initial persistence

**Decision:** No database for the first version. Match state is stored in memory.

**Reason:** Accounts, persistent rankings, and historical statistics are outside the initial scope.

**Status:** Accepted

---

## D005 - Repository automation

**Decision:** Do not use GitHub Actions, CI/CD pipelines, automated builds, or automated deployment.

**Reason:** Development and execution are intended to be controlled manually through Codex and the local WSL environment.

**Status:** Accepted

---

## D006 - Development philosophy

**Decision:** Prefer simple browser JavaScript and a small Node.js server over large frameworks until requirements demonstrate a need for more.

**Reason:** The product is small, latency-sensitive, and locally hosted.

**Status:** Accepted

---

## D007 - Runtime and local verification

**Decision:** Target Node.js 24.x, use ES modules, and manage dependencies with npm and a committed lockfile. Use Node's built-in test runner; `socket.io-client` is a development-only dependency for real polling/WebSocket integration tests.

**Reason:** A single runtime line and module format keep local development predictable. The test client verifies actual network behavior without a separate test framework or handwritten Socket.IO protocol client.

**Status:** Accepted. The foundation was verified on Windows with Node.js 24.19.0 / npm 11.11.1 and in Ubuntu 26.04 / WSL 2 with Node.js 24.21.0 / npm 11.19.0.

**References:** [Node.js release policy](https://nodejs.org/en/about/previous-releases), [Express installation](https://expressjs.com/en/5x/starter/installing/), [Socket.IO with an HTTP server](https://socket.io/docs/v4/server-initialization/).

---

## D008 - Unprivileged WSL execution

**Decision:** Run npm and the game server as the Linux user `tetris`, without sudo membership or a password login. Install the official Node.js runtime separately under `/opt`, with commands exposed through `/usr/local/bin`.

**Reason:** Application execution does not require root. An explicit `wsl -d Ubuntu -u tetris` command provides a predictable development context without changing the distribution's default user or configuring automatic startup.

**Status:** Accepted and verified for M0. Runtime binaries and account configuration remain outside the repository.

---

## D009 - Shared deterministic game core and M1 baseline

**Decision:** Keep tetrominoes, seeded 7-bag generation, board transitions, scoring, and top-out in plain ES modules under `src/shared/`, independent of the DOM and sockets. Serve this directory explicitly at `/shared/` so the browser and future server validation use the same implementation. Use a serializable unsigned 32-bit Mulberry32 generator with Fisher-Yates bags.

**Reason:** A single deterministic rules implementation avoids divergent browser/server behavior without adding a build system or dependencies. The conservative baseline uses a 10 x 20 visible board, clockwise matrix rotation without kicks, fixed one-second gravity, and locking on a blocked downward step or hard drop. Exact rules are in `GAME_RULES.md`; optional mechanics remain in the backlog.

**Status:** Implemented and verified for M1. The local preview selects a browser-generated seed and is not authoritative for online results. M2 will define the network authority model and server-issued seed; no client score or attack claims are accepted by this implementation.

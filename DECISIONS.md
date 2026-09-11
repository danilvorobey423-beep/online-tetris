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

**Status:** Preferred baseline. May change only for a clear technical reason.

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

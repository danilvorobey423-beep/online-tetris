# Worklog

Record meaningful completed work here. Do not use this file as a verbose transcript. Add one concise entry per completed implementation session or coherent change set.

## Entry format

### YYYY-MM-DD - Short title

**Goal:** What was requested.

**Changes:**
- important change
- important change

**Verification:**
- command or manual check performed
- result

**Notes:**
- known limitation, follow-up, or `None`

---

## Log

### 2026-09-11 - Roadmap and implementation backlog

**Goal:** Turn the approved project documentation into a roadmap and actionable tasks.

**Changes:**
- Added `ROADMAP.md` with six milestones from the local foundation to verified public play through Cloudflare Tunnel.
- Replaced the initial checklist in `TASKS.md` with stable task IDs, dependencies, and acceptance criteria; preserved the optional backlog.
- Linked the roadmap, task backlog, and existing UI design from `README.md`.
- Kept every application task pending; no game code or deployment has been implemented.

**Verification:**
- Reviewed milestone/task coverage against the project requirements, UI design, security rules, and deployment/testing guidance.
- Checked task ID uniqueness, dependency references/order, local Markdown link targets, and Git diff whitespace.

**Notes:** Planning documentation only. Exact game rules, competitive validation design, and deployment details remain explicit implementation tasks.

---

### 2026-09-11 - Foundation server and connection preview

**Goal:** Begin implementation with roadmap milestone M0.

**Changes:**
- Created the Node.js 24 project using ES modules, npm scripts/lockfile, and repository ignore rules.
- Added Express static serving, validated host/port settings, startup errors, and signal shutdown.
- Added Socket.IO connectivity with a 16 KiB message limit and connection/disconnection logs.
- Added the empty two-board arena preview, real connection status, and explicit reload recovery.
- Added ten local tests using Node's test runner and a development-only Socket.IO client.
- Updated runtime decisions, architecture/protocol, startup/testing instructions, UI status, roadmap, and backlog. Marked T00-T02 complete; T03 remains pending.

**Verification:**
- Windows runtime: Node.js 24.19.0, npm 11.11.1; dependency installation succeeded with no reported vulnerabilities.
- `npm run check` passed; `npm test` passed all 10 tests, including two independent polling/WebSocket clients, oversized messages, occupied ports, and invalid configuration.
- `npm start` served the preview on `127.0.0.1:3000`.
- Browser checks in Codex Chromium: two tabs connected; forcibly stopping the preview process changed both to `Disconnected`; restarting and clicking `Reconnect` restored `Connected`. Normal page load and recovery had no console warnings/errors. Reviewed the rendered page visually.
- Checked Git diff whitespace and ignore rules for dependencies, secrets, logs, temporary/editor/OS files.

**Notes:** WSL is not operational: `wsl --status` exited with code 50 and no registered Ubuntu distribution was found. T03's Ubuntu installation/start checks, Unix signal shutdown, and Firefox checks remain unverified. No gameplay, matchmaking, public deployment, or automatic startup exists. The local preview was left running for review.

---

### 2026-09-11 - Diagnose the T03 environment prerequisite

**Goal:** Continue with Ubuntu/WSL verification.

**Changes:** Documented the one-time elevated WSL/Ubuntu installation and subsequent manual restart/first-run steps in `DEPLOYMENT.md`.

**Verification:** Windows 10 build 19045; current development process is not elevated. Both required optional components report InstallState 2 (disabled). An elevated setup helper was prepared outside the repository and launched, but exited without a completion record; no installation success is claimed.

**Notes:** T03 remains pending. The owner needs to run the documented installation command in an administrator PowerShell and report its outcome. No application code changed and no application tests were repeated.

---

### 2026-09-11 - Complete Ubuntu/WSL foundation verification

**Goal:** Finish T03 after the owner enabled the Windows components, and prepare the verified work for GitHub.

**Changes:**
- Installed Ubuntu 26.04 successfully under WSL 2 and a checksum-verified official Node.js 24.21.0 runtime with npm 11.19.0 outside the repository.
- Created an unprivileged `tetris` Linux account with no password login or sudo membership; ran project installation and verification as that user against the existing mounted checkout.
- Added a Unix CLI integration test for startup outside the project directory, real socket connectivity, and clean SIGTERM shutdown.
- Updated runtime/startup documentation and marked T03 and milestone M0 complete. T10 is next.

**Verification:**
- Ubuntu: `npm install`, `npm run check`, and all 11 tests passed. Windows: 10 tests passed; the Unix-only test was explicitly skipped.
- WSL `npm start` bound to `0.0.0.0:3000`; the Windows browser showed `Connected` with no console warnings/errors.
- `HOST=127.0.0.1 PORT=3100 npm start` served a second verified browser preview; a duplicate start failed clearly with exit code 1.
- SIGTERM stopped the WSL server; the browser showed `Disconnected`. Restarting and clicking `Reconnect` restored `Connected`.
- Git diff whitespace and staged contents were reviewed before the requested commit.

**Notes:** The owner explicitly authorized commits and pushes after verification, including future work in this task. No public deployment, automatic startup, or repository automation was added. The WSL preview remains running on port 3000. Firefox verification and all game/match features remain pending.

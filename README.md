# Online Tetris

Two-player browser Tetris intended to run from Ubuntu on WSL and be exposed through Cloudflare Tunnel.

## Current state

The page now starts a playable local Tetris preview: seven pieces, movement and rotation, gravity, soft/hard drop, line clearing, score, next piece, top-out, and a fresh round with `Play again`. The opponent field remains a placeholder. Socket connection status is real; matchmaking, attacks, and online rematches are not implemented yet.

M0 and M1 (T00-T15) are complete. All 30 tests pass in Ubuntu 26.04 on WSL 2 with Node.js 24.21.0 and npm 11.19.0, running as the unprivileged Linux user `tetris`. Gameplay checks passed in Chromium and Firefox; see [TESTING.md](TESTING.md) for the methods and coverage. Public hosting is not configured; the next task is T20 (multiplayer protocol and authority model).

## Local startup

Install Node.js 24.x with npm, then run from the project directory:

```bash
npm install
npm start
```

Open `http://localhost:3000`. The status should change from `Connecting…` to `Connected`. Stop the server with Ctrl+C. After a disconnection, restart the server and use `Reconnect` on the page to establish a fresh connection.

There is no frontend build step. JavaScript and CSS are served directly from `public/`; browser/server game rules in `src/shared/` are served at `/shared/`.

For the configured WSL environment, open a terminal with `wsl -d Ubuntu -u tetris`, change to the project directory, and run the commands above. See [DEPLOYMENT.md](DEPLOYMENT.md) for the verified path and runtime setup. Routine project work does not require an administrator terminal.

## Controls

| Key | Action |
| --- | --- |
| Left / Right arrow | Move |
| Up arrow | Rotate clockwise |
| Down arrow | Soft drop |
| Space | Hard drop and lock |

The local round starts immediately. Click the board to focus it if needed. After top-out, use `Play again` to reset the board and score. This is the M1 development preview; online match entry will replace it in later milestones. See [GAME_RULES.md](GAME_RULES.md) for exact rules and scoring.

## Configuration

| Variable | Default | Accepted values |
| --- | --- | --- |
| `HOST` | `0.0.0.0` | IPv4/IPv6 address or `localhost`; no URLs or pipe paths |
| `PORT` | `3000` | Integer from 1 to 65535 |

For a loopback-only preview in Ubuntu/WSL:

```bash
HOST=127.0.0.1 PORT=3100 npm start
```

In PowerShell:

```powershell
$env:HOST = '127.0.0.1'
$env:PORT = '3100'
npm start
```

Variables are read from the process environment; `.env` files are not loaded automatically. Do not commit credentials. `NODE_ENV=production` may be set for production operation using Express's standard behavior.

## Local checks

```bash
npm run check
npm test
```

Tests use Node's built-in test runner and start isolated servers on ephemeral loopback ports. See [TESTING.md](TESTING.md) for coverage and pending manual verification.

## Project documentation

Start here:
- `AGENTS.md` - operating rules for Codex
- `PROJECT.md` - project goal and scope
- `REQUIREMENTS.md` - product requirements
- `ARCHITECTURE.md` - technical structure
- [ROADMAP.md](ROADMAP.md) - delivery milestones and exit checks
- [TASKS.md](TASKS.md) - implementation tasks, dependencies, and acceptance criteria
- [UI_DESIGN.md](UI_DESIGN.md) - single-page multiplayer layout and interaction flow
- [GAME_RULES.md](GAME_RULES.md) - implemented game rules and keyboard controls
- `WORKLOG.md` - completed work
- `DECISIONS.md` - durable technical decisions
- `TESTING.md` - verification procedure
- `DEPLOYMENT.md` - WSL/Cloudflare deployment
- `CODE_STYLE.md` - coding conventions
- `SECURITY.md` - security rules

## Important project constraint

The repository is intentionally not configured for GitHub Actions, CI/CD, automatic builds, or automatic deployment.

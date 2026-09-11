# Deployment

## Current verification status

T03 is complete. The foundation runs in Ubuntu 26.04 LTS on WSL 2 with Node.js 24.21.0 and npm 11.19.0. Installation, syntax checks, all 11 tests, browser connectivity from Windows, host/port overrides, occupied-port failure, SIGTERM shutdown, and explicit browser reconnect passed on 2026-09-11.

No Cloudflare Tunnel, DNS change, public deployment, or automatic application startup has been configured. Public networking sections below remain the target setup.

## WSL setup

The development machine uses Windows 10 build 19045. The owner enabled WSL and Virtual Machine Platform; both now report enabled. Ubuntu was subsequently installed successfully. To reproduce the initial installation on another machine:

Open Windows PowerShell **as Administrator** and run:

```powershell
wsl --install -d Ubuntu --no-launch
```

If Windows requests a restart, save your work and restart manually. Complete any personal first-run username/password setup locally; do not share credentials in chat or the repository.

Only the WSL installation requires the elevated terminal. Normal project development can remain in the existing non-elevated session. See [Microsoft's WSL installation instructions](https://learn.microsoft.com/en-us/windows/wsl/install).

## Verified Linux runtime

- The official Node.js `node-v24.21.0-linux-x64.tar.xz` archive was verified against its published SHA-256 checksum and extracted to `/opt/node-v24.21.0-linux-x64`.
- `/usr/local/bin/node`, `npm`, and `npx` link to that runtime. These runtime files live outside the repository.
- The Linux account `tetris` (UID 1000) has its own home directory, a locked password, and no sudo membership. The server and npm commands run under that user, not root. No credentials were created or stored.
- Use `wsl -d Ubuntu -u tetris` from PowerShell to open that user's shell. The explicit user selection does not depend on the distribution's default user.
- The existing Windows project is mounted into WSL; no second checkout was created.

## Target environment

- Windows laptop
- WSL
- Ubuntu
- Node.js installed inside Ubuntu
- Cloudflare account controlling `droradditive.com`
- Cloudflare Tunnel
- expected hostname: `tetris.droradditive.com`

## Application startup

From PowerShell, open the configured Linux shell:

```powershell
wsl -d Ubuntu -u tetris
```

Then inside Ubuntu:

Use Node.js 24.x with npm installed inside Ubuntu. Run commands from the actual project directory; `.nvmrc` records the major version for users of nvm.

```bash
cd '/mnt/c/Users/Мастер/Documents/projects/tetris'
npm install
npm start
```

The path above is the verified development directory. Adjust it when using another checkout. Run dependency installation in the environment in which the server will run; do not assume future native dependencies can be shared between Windows and Linux.

Suggested defaults:

```text
HOST=0.0.0.0
PORT=3000
```

Both values are configurable through environment variables. `HOST` accepts a literal IP address or `localhost`; `PORT` must be an integer from 1 to 65535. Invalid values fail before listening. Environment files are not loaded automatically.

For a local loopback preview:

```bash
HOST=127.0.0.1 PORT=3000 npm start
```

The server logs the actual listening address. Use Ctrl+C to stop it, then run the same command to restart. Restarting disconnects browsers; use the page's `Reconnect` link to make a fresh connection. The current preview does not contain matches to restore.

## Foundation verification in Ubuntu/WSL

This checklist passed for T03 and can be reused after environment changes:

1. Confirm `node --version` reports v24.x and record `npm --version`.
2. Run `npm install`, `npm run check`, and `npm test` inside Ubuntu.
3. Run `npm start`, open the page from Windows, and confirm `Connected`.
4. Check explicit `HOST=127.0.0.1 PORT=3100` and open that address.
5. Start a second server on the same address/port and confirm a clear nonzero startup failure.
6. Stop the first server and confirm the browser reports `Disconnected`; restart and use `Reconnect`.
7. Record results in `WORKLOG.md`; do not treat a local check as verification of public Cloudflare routing.

## Cloudflare Tunnel concept

Cloudflare Tunnel should forward the public hostname to the local HTTP service running in WSL.

Expected routing concept:

```text
https://tetris.droradditive.com
        |
   Cloudflare
        |
 Cloudflare Tunnel
        |
http://localhost:3000
```

The exact tunnel configuration must be documented once created.

## Important

Do not store:
- tunnel tokens
- API tokens
- account credentials
- private keys

inside the repository.

## Deployment verification

After server start and tunnel start:
1. Open `https://tetris.droradditive.com`.
2. Confirm the page loads over HTTPS.
3. Confirm Socket.IO/WebSocket connects.
4. Open the same URL from another device/network.
5. Start a two-player match.
6. Confirm messages flow in both directions.
7. Confirm a disconnect is handled correctly.

## Restart behavior

The first version may be started manually.

Automatic startup through systemd, Windows Task Scheduler, WSL boot integration, or another mechanism should only be added when explicitly requested.

## No automated deployment

This project intentionally does not require:
- GitHub Actions
- automated deployment from GitHub
- cloud build services
- container registries
- Docker deployment

Source control is for versioning and collaboration, not for automatic production execution.

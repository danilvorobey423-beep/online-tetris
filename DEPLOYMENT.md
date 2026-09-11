# Deployment

## Target environment

- Windows laptop
- WSL
- Ubuntu
- Node.js installed inside Ubuntu
- Cloudflare account controlling `droradditive.com`
- Cloudflare Tunnel
- expected hostname: `tetris.droradditive.com`

## Application startup

From Ubuntu/WSL:

```bash
cd ~/online-tetris
npm install
npm start
```

The exact project directory may differ.

Suggested defaults:

```text
HOST=0.0.0.0
PORT=3000
```

These values should be configurable through environment variables.

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

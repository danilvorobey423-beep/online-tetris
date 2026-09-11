# Security

## Threat model

This is an internet-accessible game running on a personal laptop. The application should assume that remote clients may send malformed, hostile, repeated, or fabricated messages.

## Rules

- Treat all socket payloads as untrusted.
- Validate payload type, required fields, ranges, and ownership.
- Do not allow a client to act on behalf of another player.
- Do not expose internal server objects directly.
- Do not expose filesystem paths, environment variables, secrets, or stack traces.
- Do not trust client-reported win/loss state without server-side consistency checks.
- Do not trust arbitrary client-reported garbage attacks.
- Limit message size and obvious spam where practical.
- Clean up disconnected sockets and abandoned matches.
- Keep dependencies minimal and updated deliberately.
- Never commit `.env` or credentials.

## Cloudflare

Cloudflare provides the public edge and tunnel, but application-level validation is still required.

Do not assume that traffic reaching the local server is automatically trustworthy.

## Secrets

Potential secrets include:
- Cloudflare tunnel token
- API tokens
- SSH keys
- account credentials

They must remain outside version control.

## Personal laptop considerations

The game server must not expose unrelated local services.

Do not configure broad filesystem sharing or unrelated ports as part of this project.

## Future authentication

If accounts are added later, authentication and session handling require a separate design decision and threat review before implementation.

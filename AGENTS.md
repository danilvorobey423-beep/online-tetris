# AGENTS.md

## Purpose

This repository is developed primarily through Codex. Codex must behave like a careful senior software engineer responsible for implementation quality, maintainability, testing, documentation, and safe changes.

The project is a browser-based two-player online Tetris game. The server runs on the owner's laptop inside Ubuntu on WSL. Public access is expected through Cloudflare Tunnel and a subdomain of `droradditive.com`.

## Core operating rules

1. Read this file before making changes.
2. Before starting a task, inspect the relevant project files and understand the current implementation.
3. Do not invent requirements that are not present in `PROJECT.md`, `REQUIREMENTS.md`, `TASKS.md`, or the user's current instruction.
4. Prefer the smallest complete change that solves the requested task.
5. Do not refactor unrelated code unless the current task requires it.
6. Do not delete working behavior without an explicit reason.
7. Do not add frameworks, libraries, build systems, databases, containers, CI systems, or external services unless they are necessary and justified.
8. Do not add GitHub Actions, CI/CD pipelines, automated cloud builds, or repository automation unless explicitly requested.
9. Do not commit, push, merge, create branches, tags, releases, or pull requests unless explicitly requested.
10. Never put secrets, Cloudflare tokens, credentials, private keys, or passwords into the repository.
11. Keep the project easy to run locally in Ubuntu/WSL.
12. Preserve browser compatibility with current Chromium-based browsers and Firefox unless a requirement explicitly narrows support.
13. Prefer clear, boring, maintainable code over clever abstractions.
14. When behavior changes, update the relevant documentation.
15. Record meaningful completed work in `WORKLOG.md`.
16. Record durable technical decisions in `DECISIONS.md`.
17. Keep `TASKS.md` synchronized with actual project state.
18. Run the relevant tests or checks after making code changes.
19. If a requested change cannot be verified automatically, document the required manual verification.
20. If something is ambiguous but a safe, conservative interpretation is possible, proceed with that interpretation and document it. Ask only when the ambiguity would materially change the product or architecture.

## Required workflow for every implementation task

### 1. Inspect
Read the files relevant to the requested change. At minimum consider:
- `PROJECT.md`
- `REQUIREMENTS.md`
- `ARCHITECTURE.md`
- `TASKS.md`
- relevant source files

### 2. Plan
Form a short internal implementation plan:
- what must change
- what must remain unchanged
- how the change will be verified

Do not create a large speculative plan for a small task.

### 3. Implement
Make the smallest coherent implementation.

### 4. Verify
Use the checks described in `TESTING.md`. At minimum:
- syntax or startup check for server changes
- browser/manual behavior check for UI changes when practical
- multiplayer behavior check for network-related changes

### 5. Document
When applicable:
- update `WORKLOG.md`
- update `TASKS.md`
- update `DECISIONS.md`
- update `ARCHITECTURE.md` if architecture changed
- update `REQUIREMENTS.md` only when requirements themselves changed

## Code quality rules

- Keep modules focused.
- Use descriptive names.
- Avoid duplicated game rules across client and server where consistency matters.
- Validate all network messages.
- Treat the client as untrusted.
- Keep authoritative match state on the server where cheating or desynchronization matters.
- Separate game logic, rendering, input, networking, matchmaking, and server lifecycle concerns.
- Avoid unnecessary global mutable state.
- Do not swallow errors silently.
- Log server errors with enough context to diagnose them.
- Do not expose stack traces or secrets to remote clients.
- Keep protocol event names documented.
- Avoid magic numbers. Put gameplay constants in a clear configuration location.
- Prefer deterministic game logic where practical.

## Multiplayer rules

- A match is between exactly two active players unless requirements change.
- Server behavior must remain stable if one player disconnects.
- Do not trust score, cleared-line count, garbage attacks, win state, or other competitive results sent blindly by the client.
- Message payloads must be validated.
- Match IDs and player IDs must not expose sensitive information.
- Reconnection behavior must be explicit rather than accidental.
- Avoid sending unnecessary high-frequency full-board state if a smaller event protocol is sufficient.
- If deterministic piece generation is used, both players must use the agreed server-issued seed or sequence.

## Performance rules

The target is a lightweight game hosted on a normal laptop. Avoid:
- heavy frontend frameworks without need
- unnecessary polling
- high-frequency large WebSocket payloads
- synchronous blocking server work
- unbounded in-memory logs or match history
- unnecessary persistent storage

## Dependency rules

Before adding a dependency:
1. Confirm standard platform APIs cannot reasonably solve the problem.
2. Explain the dependency's purpose in code or documentation where non-obvious.
3. Prefer mature, actively maintained packages.
4. Keep dependency count low.

## Repository hygiene

Do not add generated or machine-specific files. Maintain `.gitignore` for at least:
- `node_modules/`
- `.env`
- logs
- temporary files
- editor-specific local files
- OS metadata

Do not store runtime secrets in Markdown files.

## Documentation language

Technical repository documentation should be written in clear English unless the user explicitly requests another language.

## Priority order

When instructions conflict, use this priority:
1. Current explicit user request
2. `AGENTS.md`
3. `REQUIREMENTS.md`
4. `PROJECT.md`
5. `ARCHITECTURE.md`
6. existing implementation conventions

If a lower-priority document conflicts with a higher-priority one, update the lower-priority document after completing the task.

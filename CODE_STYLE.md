# Code Style

## General

- Optimize for readability.
- Keep functions small enough to understand without excessive navigation.
- Use descriptive names.
- Avoid deep nesting.
- Avoid unnecessary classes.
- Prefer explicit state transitions.
- Do not create abstractions before there are at least two real use cases for them.

## JavaScript

Preferred baseline:
- modern JavaScript supported by current Node.js and modern browsers
- `const` by default
- `let` when reassignment is required
- avoid `var`
- strict equality
- early returns for invalid states
- explicit error handling around network boundaries

Use either ESM or CommonJS consistently. Do not mix styles without a reason.

## Files and modules

Separate major concerns:
- game rules
- renderer
- input
- networking
- matchmaking
- protocol validation

Do not split tiny code into many files merely to match a theoretical architecture diagram.

## Comments

Comments should explain:
- why a non-obvious rule exists
- protocol assumptions
- unusual browser/network behavior
- important invariants

Do not comment obvious syntax.

## Naming

Use stable terminology:
- `player`
- `match`
- `board`
- `piece`
- `garbage`
- `queue`
- `socket`
- `matchId`
- `playerId`

Avoid using multiple names for the same concept.

## Constants

Gameplay constants should be centralized or clearly grouped.

Examples:
- board width
- board height
- gravity timing
- garbage rules
- network update interval

## Network payloads

Network payloads must be small, explicit objects.

Avoid passing arbitrary objects from internal server state directly to the client.

## Error handling

Server:
- log diagnostic context
- send safe client-facing error/status messages
- do not leak stack traces remotely

Client:
- fail gracefully
- show connection/match status where relevant
- avoid silent broken states

## Formatting

Use a consistent formatter if one is adopted later. Do not add formatting tooling solely for its own sake unless requested.

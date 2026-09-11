# Multiplayer UI Design

## Current implementation

The M1 preview implements a playable local canvas board, NEXT piece, line/score counters, documented keyboard controls, and actual connection status. The center shows `Your move.` during local play, then `Round over.` and `Play again` after top-out. The opponent field explicitly says online matches are coming next. On disconnect, a `Reconnect` link reloads the page to create a fresh connection and local round.

The local board receives keyboard focus on start/restart and when clicked. Game controls do not scroll the page while playing. At narrow widths, the center message moves below the two fields. The current layout was inspected in Chromium and Firefox, including 1366-pixel and 800-pixel Firefox viewports; final desktop layout refinement belongs to T40.

The remaining sections describe the target multiplayer experience. Matchmaking, countdown, attacks, online results, and mutual rematch controls are not implemented yet. `Play again` only resets the local development preview.

## Core concept

The entire multiplayer experience should live on a single page. A player opens the game URL and immediately enters the game interface. There should be no separate lobby page, launcher, registration flow, room browser, or multi-step navigation in the initial version.

## Page layout

The main screen should be compact and focused on the 1v1 match.

- Left side: the local player's Tetris board.
- Right side: the opponent's Tetris board.
- Center: a narrow match-status column.
- The local player's board is visually primary and may be slightly larger.
- The opponent board should remain large enough to understand their current situation in real time.

Suggested structure:

```text
┌───────────────────────────────────────────────────────────────┐
│                        ONLINE TETRIS                          │
│                                                               │
│   PLAYER 1                 MATCH                 PLAYER 2      │
│   Score 12400                                    Score 9800    │
│                                                               │
│   NEXT                    01:24                  NEXT          │
│  ┌──────┐                                       ┌──────┐       │
│  │  T   │       incoming: ▓▓▓                  │  L   │       │
│  └──────┘                                       └──────┘       │
│                                                               │
│  ┌──────────────┐                         ┌──────────────┐      │
│  │              │                         │              │      │
│  │              │                         │              │      │
│  │              │        VS               │              │      │
│  │              │                         │              │      │
│  │              │                         │              │      │
│  │              │                         │              │      │
│  │              │                         │              │      │
│  │              │                         │              │      │
│  │              │                         │              │      │
│  │████    ██    │                         │      ██      │      │
│  │██████████    │                         │  ████████    │      │
│  └──────────────┘                         └──────────────┘      │
│                                                               │
│      ← → move   ↑ rotate   ↓ drop   SPACE hard drop           │
└───────────────────────────────────────────────────────────────┘
```

## Local player area

The local player area should include:
- main Tetris board
- player label/name
- score or relevant match statistics
- `NEXT` piece preview
- incoming garbage indicator
- controls reference

A `HOLD` panel may be added later if hold is implemented.

## Opponent area

The opponent area should include:
- opponent board or compact live board representation
- opponent label/name
- score or relevant status
- next piece if the protocol supports it and it remains useful
- clear visible top-out/disconnected state when applicable

The purpose of the opponent board is tactical awareness, not decorative animation.

## Center match column

The center area should communicate the global state of the match.

Possible states:
- `WAITING FOR OPPONENT`
- `OPPONENT CONNECTED`
- countdown: `3`, `2`, `1`
- `VS`
- match timer if one is later required
- incoming garbage status
- `YOU WIN`
- `YOU LOSE`
- `OPPONENT DISCONNECTED`
- `REMATCH`

The central column should remain narrow and should not compete visually with the boards.

## Match entry flow

The first player opens the page:
- the interface is already visible
- their board is inactive or visually subdued
- status shows `Waiting for opponent...`

The second player opens the same URL:
- the server pairs both players
- both clients receive `Opponent connected`
- a short countdown begins
- the match starts automatically

No extra lobby or confirmation page is required for the initial version.

## Competitive interaction

Both players play simultaneously.

When a player clears enough lines to generate an attack:
- garbage is sent to the opponent according to the defined attack rules
- incoming garbage is visually indicated before or as it is applied
- garbage lines appear from the bottom
- garbage lines contain a gap according to the game rules

The player should be able to understand at a glance how much garbage is pending.

## End-of-match flow

A player loses when their board tops out or when the server resolves the match as lost.

After the match:
- both clients remain on the same page
- the center area displays `YOU WIN` or `YOU LOSE`
- a `REMATCH` action is available
- if both players agree to rematch, a new match starts without reloading the page

If the opponent disconnects, the remaining player should see a clear `OPPONENT DISCONNECTED` state.

## Visual direction

The visual style should resemble a clean modern arcade game rather than a website dashboard.

Preferred characteristics:
- dark background
- clear high-contrast board grids
- bright conventional tetromino colors
- minimal decoration
- compact layout
- readable match states
- immediate visual hierarchy

The priorities are:
1. local board readability
2. opponent board readability
3. incoming garbage visibility
4. match state visibility
5. low visual clutter

## Initial UX rule

Opening the public game URL should be enough to enter the multiplayer experience. The page itself is the game.

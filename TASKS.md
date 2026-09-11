# Tasks

This file represents the active project backlog. Keep it concise and current.

## Phase 0 - Project foundation

- [ ] Create minimal Node.js project
- [ ] Add Express server
- [ ] Add Socket.IO
- [ ] Serve `public/index.html`
- [ ] Add `.gitignore`
- [ ] Add environment-based host/port configuration
- [ ] Verify server starts under Ubuntu/WSL

## Phase 1 - Single-player game core

- [ ] Define board representation
- [ ] Define tetromino shapes
- [ ] Implement 7-bag generator
- [ ] Implement spawn
- [ ] Implement left/right movement
- [ ] Implement soft drop
- [ ] Implement hard drop
- [ ] Implement rotation
- [ ] Implement collision detection
- [ ] Implement locking
- [ ] Implement line clearing
- [ ] Implement top-out/game over
- [ ] Render board
- [ ] Render active piece
- [ ] Render next piece
- [ ] Add keyboard controls
- [ ] Add basic score/status display

## Phase 2 - Multiplayer foundation

- [ ] Define socket protocol
- [ ] Implement connection lifecycle
- [ ] Implement waiting queue
- [ ] Pair exactly two players
- [ ] Create match object
- [ ] Notify both players of match start
- [ ] Assign deterministic match seed
- [ ] Send opponent board/status updates
- [ ] Handle player disconnect
- [ ] Clean up completed matches

## Phase 3 - Competitive behavior

- [ ] Define garbage attack table
- [ ] Implement garbage generation
- [ ] Implement garbage receiving
- [ ] Validate opponent-affecting events
- [ ] Resolve win/loss server-side
- [ ] Prevent duplicate match-end events

## Phase 4 - Match UX

- [ ] Waiting-for-opponent screen/state
- [ ] Match countdown
- [ ] Won/lost state
- [ ] Opponent-disconnected state
- [ ] Restart/rematch behavior
- [ ] Clear controls/help text

## Phase 5 - Deployment

- [ ] Verify application on Ubuntu/WSL
- [ ] Confirm server binds correctly
- [ ] Configure Cloudflare Tunnel
- [ ] Configure `tetris.droradditive.com`
- [ ] Verify HTTPS page load
- [ ] Verify WebSocket/Socket.IO through Cloudflare
- [ ] Test two remote players
- [ ] Document restart procedure

## Later / optional

- [ ] Ghost piece
- [ ] Hold piece
- [ ] SRS wall kicks
- [ ] Lock delay
- [ ] DAS/ARR tuning
- [ ] T-spin detection
- [ ] combo attacks
- [ ] back-to-back
- [ ] perfect clears
- [ ] sound
- [ ] touch controls
- [ ] reconnection
- [ ] room codes
- [ ] private rooms
- [ ] spectator mode
- [ ] persistent statistics

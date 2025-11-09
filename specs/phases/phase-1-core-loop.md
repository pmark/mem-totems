---
type: phase-spec
project: mem-totems
phase: 1
title: Core Loop MVP
status: 95% Complete
updated: 2025-11-09
---

# Phase 1: Core Loop MVP

## Objective
Build the fundamental game loop: movement, totem matching, combat, and procedural room progression. This phase establishes the technical foundation and proves the core gameplay concept is fun and functional.

## Scope
- ✅ Player movement with arrow keys (8-directional, collision detection)
- ✅ Tilemap system with walkable/unwalkable tiles
- ✅ Totem matching mechanic (activate pairs, match/mismatch resolution)
- ✅ Essence tracking (4 elements: fire, water, earth, air)
- ✅ Basic combat system (player attack, companion auto-attack, enemy AI)
- ✅ Companion entity (follows player, assists in combat)
- ✅ Procedural room generation (6–8 rooms per run, rest room, boss room)
- ✅ Room transitions via exit portals
- ✅ Victory/defeat conditions
- ✅ Run regeneration (R key to restart without reload)
- ✅ React-based HUD overlay (essence, health, room info, instructions)
- ✅ Debug overlay for error tracking (especially for mobile/iPad)
- ✅ Depth/z-index management (player/companion visible above tiles)

## Current Implementation Status

### ✅ Completed
1. **Scaffold & Runtime** - Phaser 3 game initializes, canvas renders
2. **Tilemap System** - 10×10 grid with floor/wall rendering and collision
3. **Player Movement** - Smooth arrow key movement with wall collision
4. **Totem System** - Activate, match detection, async resolution with callbacks
5. **Essence System** - Accumulation with 99 cap per element, event-driven UI updates
6. **Combat System** - Player melee attack (A key), companion auto-attack, enemy chase AI, damage/death flows
7. **Companion Entity** - Follows player, attacks enemies, visual marker
8. **Room System** - Procedural generation (6–8 rooms), guaranteed totem pairs, rest/boss rooms, exit portals
9. **Room Transitions** - Portal proximity detection, SPACE to advance, flash effect
10. **Victory Flow** - Run completion detection, victory message
11. **Run Regeneration** - R key resets all systems and generates new run
12. **React HUD** - All UI elements (essence, health, room, status, instructions) in React overlay
13. **Debug Overlay** - Console capture, error logging, stack traces for iPad debugging
14. **Visual Polish** - Depth sorting, player/companion always visible above tiles

### 🔄 In Progress / Needs Polish
1. **Auto Room Clear** - When all totems matched, room should auto-mark as cleared
   - Currently requires manual check or enemy defeat
   - Need to trigger `roomSystem.markRoomCleared()` when totem count hits 0
2. **Enemy Spawning** - Mismatch spawns enemies, but no pre-placed enemies in normal rooms yet
   - Boss room has pre-spawned enemy
   - Consider adding 1-2 enemies to normal rooms for variety
3. **Visual Feedback** - Room clear could use more celebration
   - Flash effect on portal spawn
   - Particle burst when totems match
4. **Mobile Controls** - Currently keyboard only
   - Need virtual joystick for movement
   - Touch targets for attack/interact
5. **Audio** - No sound effects or music yet
   - Match/mismatch sounds
   - Combat hits
   - Portal entry chime

### ❌ Not Started (Phase 1 Scope)
1. **Mobile Touch Controls** - Virtual joystick, touch buttons
2. **Audio System** - SFX and music integration
3. **Save/Load** - Persist essence and progress between sessions
4. **Tutorial** - First-run instructions overlay
5. **Performance Optimization** - Mobile device testing and optimization

## Remaining Phase 1 Tasks

### Critical (Required for Phase 1 Complete)
1. ✅ Auto-clear room when last totem pair matched
2. ✅ Improve instructions in HUD (always show what to do next)
3. 🔲 Add mobile touch controls (virtual joystick + buttons)
4. 🔲 Add basic audio (match/mismatch/attack/portal sounds)
5. 🔲 Test on mobile device (iPad/iPhone)

### Nice-to-Have (Can defer to Phase 2)
- Visual effects for totem matching (particles, glow)
- Room clear celebration animation
- Enemy variety (different speeds, attack patterns)
- Essence crafting UI (currently just accumulates)
- Companion ability activation (currently auto-attacks only)

## Technical Debt
- Duplicate keyboard setup code in MainScene.create() needs cleanup
- RoomSystem.getTotalRooms() returns undefined in some contexts (needs fallback)
- Logger formatArg could handle more edge cases
- Some Phaser text depth values hardcoded to 1000+

## Definition of "Phase 1 Complete"
- Player can complete a full run on mobile (touch controls working)
- Core loop is satisfying: explore → match totems → fight enemies → advance → victory
- Basic audio feedback makes actions feel responsive
- No critical bugs; stable on iOS Safari and desktop Chrome
- Debug tools available for troubleshooting on any device

## Success Metrics
- Player can complete a run in 3–5 minutes
- Totem matching feels intuitive (no confusion about activation)
- Combat feels fair (not too easy, not impossible)
- Run variety keeps 2–3 playthroughs interesting
- Mobile performance: 60 fps on iPhone 12+

## Next Phase Preview
Phase 2 will add:
- Essence crafting/spending mechanics
- Companion selection and abilities
- Biome variety (visual themes beyond basic tiles)
- Persistent progression (unlocks, meta-upgrades)
- Polish: animations, particle effects, juice

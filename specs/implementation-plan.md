---
type: implementation-plan
project: mem-totems
---

# Implementation Plan & Runbook

This file is the single source-of-truth for step-by-step plans, task status, and the short-term runbook for development work performed by the assistant. The assistant will update this file every time a multi-step change is planned or applied.

## Policy
- The assistant must update this file at the start of any multi-step task and after completing substantive changes.
- Keep entries concise and timestamped (UTC).
- Use the `Changelog` section below for short entries describing what changed and why.

## Current Top-Level Plan (short-term, prioritized)
1. ✅ Scaffold & runtime wiring
   - Goal: Ensure `GameCanvas` renders and `mainScene` initializes.
   - Acceptance: A visible canvas renders and logs "mainScene ready" in dev console.
   - Status: COMPLETE
2. ✅ Tilemap & Basic Movement
   - Goal: Player can move with arrow keys on a simple tilemap.
   - Acceptance: A small tilemap (10×10) renders with distinct tiles; arrow keys move player smoothly; player cannot walk through walls.
   - Status: COMPLETE
3. ✅ Totem matching core
   - Goal: Player can tap/activate totems, record symbol activation, and detect matches/mismatches.
   - Acceptance: Matching pair yields essence + UI update; mismatch spawns placeholder enemy.
   - Status: COMPLETE
4. ✅ Essence bookkeeping + HUD
   - Goal: Track essence per element with cap and show HUD.
   - Acceptance: Essence increments on matches; UI shows counts.
   - Status: COMPLETE
5. ✅ Combat & companion stubs
   - Goal: Simple enemy that moves and deals/takes damage; companion follows player.
   - Acceptance: Player and companion can damage enemy; enemy death drops essence.
   - Status: COMPLETE
6. ✅ Procedural room assembly
   - Goal: Compose rooms into a run, guarantee totem pairs and special rooms.
   - Acceptance: Run contains 6–8 rooms, 1 rest, 1 boss, at least two matching totem pairs.
   - Status: COMPLETE

## Short checklist for the assistant
- Always update this file before making multi-file edits.
- Add a `Changelog` entry for each commit or patch applied.
- Keep the todo list in sync with repository edits using the repo-wide TODO tool.

## Changelog
- 2025-11-09T00:00:00Z — Created file. Added initial top-level plan and policy for updates.
- 2025-11-09T00:30:00Z — Started task: "Scaffold & runtime wiring". Will add a small runtime log and on-screen debug text in `src/game/mainScene.ts` to confirm scene initialization. Marked todo `Start implementation` as in-progress.
- 2025-11-09T01:00:00Z — Completed tasks 1-3: Scaffold complete, tilemap system with collision detection implemented, totem matching core with essence tracking fully operational. Created entities/Totem.ts, systems/TotemSystem.ts, systems/EssenceSystem.ts, and integrated into MainScene with UI elements and interaction system.
- 2025-11-09T02:00:00Z — Completed tasks 4-5: Essence HUD fully functional with health display. Combat system complete with Enemy.ts, Companion.ts, and CombatSystem.ts. Player can attack (A key), companion auto-attacks and follows player, enemies chase and damage player, enemy death drops essence. All systems integrated elegantly into MainScene.

- 2025-11-09T03:00:00Z — Completed task 6: Procedural room assembly. Added RoomTemplates (open arena, pillars, maze, rest, boss) and RoomSystem for run generation (6–8 rooms, 1 rest, 1 boss, guaranteed matching totem pairs), exit portal transitions, room clear conditions, and victory flow. Integrated with MainScene UI and loop.

- 2025-11-09T03:30:00Z — Added run regeneration feature: RoomSystem.regenerateRun(), R key binding in MainScene to reset enemies, totems, essence, player health/state, and start a fresh run without reload. Added CombatSystem.resetPlayer() helper.


*Next steps*: Wait for confirmation to begin implementing the top-priority task (scaffold & runtime wiring) or proceed immediately if approved.

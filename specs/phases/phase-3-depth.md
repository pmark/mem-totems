---
type: phase-spec
project: mem-totems
phase: 3
title: Depth & Replayability
status: Not Started
updated: 2025-11-09
---

# Phase 3: Depth & Replayability

## Objective
Transform the game from a fun prototype into a deep, replayable roguelite with strategic build variety, challenging content, and social/competitive features. This phase focuses on endgame systems that keep players engaged long-term.

## Core Features

### 1. Advanced Procedural Generation
**Goal:** Make each run feel unique with branching paths and meaningful choices.

**Implementation:**
- **Map Graph System** - Rooms connected in a branching tree (not linear)
  - Player chooses path at forks (safe vs. risky route)
  - Each path offers different rewards (more totems vs. more enemies)
  - Mini-map UI shows visited/available rooms
- **Room Modifiers** - Special conditions change gameplay
  - "Cursed Room": All totems are dark element, higher essence rewards
  - "Speed Trial": Timer-based bonus for quick clears
  - "Totem Chaos": Extra totems spawn mid-room
- **Elite Rooms** - High-risk, high-reward encounters
  - Multiple elite enemies with unique abilities
  - Guaranteed rare crystal drop
- **Event Rooms** - Non-combat rooms with choices
  - Spirit Shrines: Trade essence for temporary buff
  - Merchant: Spend essence on single-run items
  - Mystery Totems: Risk essence for big reward or penalty

**Dependencies:**
- Graph-based RoomSystem (replace linear progression)
- RoomModifier data model and application system
- Event/Choice UI components
- Mini-map rendering

### 2. Boss Variety & Mechanics
**Goal:** Make boss encounters memorable with unique mechanics.

**Implementation:**
- **Multiple Bosses** - 3–5 unique boss types per biome
  - Forest: Giant Tree Sentinel (summons minions)
  - Desert: Sand Wurm (burrows, pops up at random spots)
  - Cave: Crystal Golem (shatters into fragments when damaged)
- **Phase Transitions** - Bosses change behavior at 50% / 25% HP
- **Telegraph System** - Visual warnings before big attacks
- **Environmental Mechanics** - Bosses interact with room elements
  - Tree Sentinel spawns root walls that block movement
  - Sand Wurm creates quicksand zones
- **Boss Essence Rewards** - Rare crystals + bonus essence on defeat

**Dependencies:**
- Boss entity base class with phase system
- Telegraph/warning visual system
- Environmental hazard tiles

### 3. Relic System
**Goal:** Create build variety through passive upgrades and synergies.

**Implementation:**
- **Relic Drops** - Found in chests or purchased in event rooms
- **Passive Effects** - Stacking buffs that change playstyle
  - "Blazing Aura": Deal fire damage to nearby enemies
  - "Essence Magnet": Auto-collect essence from farther away
  - "Lucky Charm": 10% chance to avoid damage
  - "Bond Booster": Companion deals 20% more damage
- **Rarity Tiers** - Common (stat buffs), Rare (unique mechanics), Legendary (game-changing)
- **Synergies** - Certain relics combo together
  - Fire Aura + Fire Companion = AOE burn effect
- **Relic UI** - Bottom row icons show active relics in HUD

**Dependencies:**
- Relic data model and effect application system
- Chest entity (spawnable in rooms)
- RelicManager to track and apply effects

### 4. Daily Challenges & Leaderboards
**Goal:** Add competitive/social layer for retention.

**Implementation:**
- **Daily Run** - Fixed seed for all players, one attempt per day
  - Leaderboard: Speed, score (essence collected + enemies defeated)
  - Special modifiers (e.g., "Totem Frenzy: 2x totems, half health")
- **Weekly Challenges** - Themed runs with constraints
  - "Fire Only": Only fire element totems/companions allowed
  - "Pacifist": Complete run without killing enemies (stealth/dodge)
- **Leaderboard Integration** - Supabase or Firebase backend
  - Track: Best time, highest essence, furthest room reached
  - Friends list (optional social features)
- **Rewards** - Top players unlock exclusive cosmetics

**Dependencies:**
- Seeded random generation (deterministic runs)
- Backend API for leaderboard storage/retrieval
- Challenge definition system (constraints + modifiers)

### 5. Companion Evolution & Mastery
**Goal:** Deepen companion progression with visual upgrades and mastery bonuses.

**Implementation:**
- **Evolution Tiers** - 3 stages per companion
  - Tier 1: Base form (unlocked via crafting)
  - Tier 2: Enhanced form (50 bond XP + rare crystal)
  - Tier 3: Mastery form (150 bond XP + 2 rare crystals)
- **Visual Changes** - Each tier has unique sprite/colors
  - Fire Cub → Fire Wolf → Phoenix
- **Stat Scaling** - Each tier increases damage, ability power, cooldown reduction
- **Mastery Bonus** - Tier 3 unlocks permanent passive
  - Phoenix: Player regenerates 1 HP every 30 seconds when Phoenix is selected
- **Companion Codex** - Lore entries unlock with bond milestones

**Dependencies:**
- Extend Companion entity with tier system
- Asset creation (tier 2/3 sprites)
- Bond XP tracking and save integration

### 6. Meta-Progression & Unlocks
**Goal:** Give players long-term goals beyond individual runs.

**Implementation:**
- **Account Level** - Accumulates across all runs
  - XP gained from essence collected, rooms cleared, enemies defeated
  - Level up unlocks: New companions, relics, biomes
- **Achievements** - 30–50 achievements with rewards
  - "Totem Master": Match 100 totem pairs → unlock rare recipe
  - "Speed Demon": Complete run in under 5 minutes → unlock speed relic
- **Biome Unlocks** - Progress gates (not time gates)
  - Desert unlocks after 3 forest runs
  - Cave unlocks after defeating desert boss
- **Prestige System (Optional)** - Reset progress for permanent bonuses
  - "Ascension": Reset all unlocks, gain 5% essence multiplier

**Dependencies:**
- Account XP tracking and save integration
- Achievement system with trigger conditions
- Unlock gating logic in run generation

## Phase 3 Milestones

### Milestone 1: Map Graph & Choices (Weeks 1-2)
- [ ] Graph-based room generation (branching paths)
- [ ] Choice nodes (pick left/right path)
- [ ] Mini-map UI component
- [ ] Room modifiers (cursed, speed trial, chaos)
- [ ] Event rooms (shrine, merchant)
- [ ] Test: Run with branching paths feels strategic

### Milestone 2: Boss Variety (Week 3)
- [ ] Second boss design + implementation
- [ ] Phase transition system
- [ ] Telegraph visual system (warnings)
- [ ] Environmental hazards (root walls, quicksand)
- [ ] Test: Boss fights feel unique and fair

### Milestone 3: Relic System (Week 4)
- [ ] Relic data model + JSON definitions
- [ ] Chest entity (spawns in rooms)
- [ ] Relic effect application (passive buffs)
- [ ] Relic UI (icon display in HUD)
- [ ] Synergy detection (fire + fire combo)
- [ ] Test: Relics create build variety

### Milestone 4: Social Features (Weeks 5-6)
- [ ] Seeded RNG for deterministic runs
- [ ] Daily challenge system
- [ ] Backend API for leaderboards
- [ ] Leaderboard UI component
- [ ] Weekly challenge definitions
- [ ] Test: Daily run works across devices

### Milestone 5: Companion Evolution (Week 7)
- [ ] Evolution tier system (3 tiers per companion)
- [ ] Tier 2/3 sprite assets
- [ ] Evolution UI (upgrade screen)
- [ ] Mastery bonuses (permanent passives)
- [ ] Companion codex (lore entries)
- [ ] Test: Evolution feels rewarding

### Milestone 6: Meta-Progression (Week 8)
- [ ] Account level system
- [ ] Achievement definitions + triggers
- [ ] Unlock gates (biome progression)
- [ ] Achievement UI (checklist screen)
- [ ] Prestige system (optional)
- [ ] Test: Long-term goals feel achievable

## Success Metrics
- Players complete 10+ runs (retention)
- Daily challenges have 20%+ participation rate
- Relics create distinct builds (not just stat buffs)
- Boss fights are challenging but fair (60% win rate)
- Companion evolution feels like meaningful progression

## Risks & Mitigation
- **Risk:** Graph generation creates impossible layouts
  - **Mitigation:** Validation pass ensures reachable end room
- **Risk:** Leaderboards encourage cheating/exploits
  - **Mitigation:** Server-side validation, replay system
- **Risk:** Too many systems overwhelm new players
  - **Mitigation:** Gradual unlock curve, tutorial for each system
- **Risk:** Boss difficulty spikes frustrate players
  - **Mitigation:** Playtest extensively, add difficulty settings

## Technical Considerations
- Graph pathfinding (A* or Dijkstra for mini-map)
- Deterministic RNG (seed-based for daily runs)
- Backend scaling (leaderboards with 1000+ entries)
- Asset pipeline for companion evolution sprites

## Dependencies on Phase 2
- Phase 2 must be complete (crafting, persistence, polish)
- Companion system must be stable before evolution
- Save system must handle new data (account level, achievements)

## Next Phase Preview
Phase 4 (Future):
- Multiplayer co-op (2 players, shared run)
- User-generated content (custom rooms, shared seeds)
- Seasonal events (limited-time companions, relics)
- Advanced analytics (heatmaps, drop-off points)
- Platform expansion (Steam, mobile stores)

---
type: phase-spec
project: mem-totems
phase: 2
title: Progression & Crafting
status: Not Started
updated: 2025-11-09
---

# Phase 2: Progression & Crafting

## Objective
Transform collected essence from a score counter into a meaningful progression system. Introduce crafting recipes, companion selection, persistent unlocks, and meta-progression that rewards repeated runs.

## Core Features

### 1. Essence Crafting System
**Goal:** Give players agency over how they spend accumulated essence.

**Implementation:**
- **Spirit Forge UI** - Accessible from camp/hub between runs
- **Crafting Recipes** - JSON-defined recipes for creatures, relics, upgrades
  ```json
  {
    "id": "fire-hawk",
    "cost": { "fire": 5, "air": 2 },
    "unlocks": "fire-hawk-companion",
    "description": "A swift aerial attacker"
  }
  ```
- **Recipe Discovery** - Some recipes unlocked by finding rare items in runs
- **Visual Preview** - Show creature/relic before crafting
- **Confirmation Flow** - Clear cost display, "Craft" button with animation

**Dependencies:**
- Extend EssenceSystem with `spendEssence()` (already implemented)
- Add Recipe data model and RecipeManager
- Create CraftingUI component (React)

### 2. Companion Selection & Abilities
**Goal:** Let players choose their companion before each run and use active abilities.

**Implementation:**
- **Companion Roster** - Display all unlocked companions with stats
- **Selection Screen** - Choose one companion before starting a run
- **Active Abilities** - Each companion has a cooldown-based ability
  - Fire Cub: Flame Dash (AOE damage)
  - Water Sprite: Splash Heal (restore 1 heart)
  - Earth Beetle: Barrier Shell (temp invincibility)
  - Air Fox: Gale Burst (knockback enemies)
- **Ability UI** - Button in React HUD shows cooldown progress
- **Bond XP System** - Track usage/success per companion, unlock evolution tiers

**Dependencies:**
- Extend Companion entity with ability system
- Add AbilitySystem to manage cooldowns and effects
- Create CompanionSelectionUI component
- Bond XP persistence (requires save system)

### 3. Persistent Progression
**Goal:** Ensure player progress persists between sessions.

**Implementation:**
- **Save System** - LocalStorage or Supabase backend
  - Save: Essence totals, unlocked companions, unlocked recipes, bond XP
  - Load: Restore state on game start
  - Auto-save: After each run completion
- **Unlock Milestones** - Achievements unlock new companions/recipes
  - "Defeat 10 enemies" → unlocks Earth Beetle
  - "Complete 3 runs" → unlocks rare recipe
- **Meta Currency** - Rare Crystals from boss defeats for evolution unlocks

**Dependencies:**
- SaveManager utility (JSON serialization)
- Achievement/Milestone tracking system
- Backend integration (optional, start with LocalStorage)

### 4. Biome Visual Variety
**Goal:** Make the world feel more alive and varied.

**Implementation:**
- **Forest Biome Polish** - Improve tile art, add animated grass/trees
- **Second Biome** - Desert or Cave theme with unique tiles
- **Biome-Specific Enemies** - Fire enemies in desert, bats in caves
- **Environmental Hazards** - Lava tiles (damage over time), ice (slippery)
- **Ambient Particles** - Leaves falling in forest, dust in desert

**Dependencies:**
- New tileset assets (32×32 tiles)
- TilemapSystem: support multiple tilesets
- Enemy variants per biome

### 5. Visual & Audio Polish
**Goal:** Add juice to make every action feel satisfying.

**Implementation:**
- **Particle Effects**
  - Totem match: elemental burst (fire sparks, water droplets)
  - Enemy death: dissolve effect with essence fragments
  - Portal entry: swirling vortex
- **Screen Shake** - On player damage, boss attacks
- **SFX Library**
  - Match/mismatch chimes
  - Attack swoosh + hit impact
  - Footsteps, portal whoosh
  - Companion ability activation
- **Music System**
  - Ambient exploration track
  - Combat intensity layer
  - Victory fanfare

**Dependencies:**
- Howler.js or Phaser Audio API
- Particle system (Phaser built-in)
- Asset creation (sounds, sprites for particles)

## Phase 2 Milestones

### Milestone 1: Crafting Foundation (Week 1)
- [ ] Recipe data model + JSON recipes
- [ ] Extend EssenceSystem with recipe validation
- [ ] Basic CraftingUI in React (recipe list, cost display)
- [ ] Craft button creates placeholder companion
- [ ] Test: Spend essence, unlock a companion

### Milestone 2: Companion Selection (Week 2)
- [ ] Companion roster screen (React component)
- [ ] Pre-run selection flow
- [ ] Ability system (cooldown + effect triggers)
- [ ] UI button for companion ability
- [ ] Test: Select companion, use ability in run

### Milestone 3: Persistence (Week 3)
- [ ] SaveManager utility (save/load JSON)
- [ ] LocalStorage integration
- [ ] Save essence, unlocks, bond XP after each run
- [ ] Load state on game launch
- [ ] Test: Complete run, reload page, verify progress

### Milestone 4: Polish Pass (Week 4)
- [ ] Add particle effects (match, death, portal)
- [ ] Implement screen shake on damage
- [ ] Add SFX for all major actions
- [ ] Background music with combat layer
- [ ] Second biome tileset + enemies
- [ ] Test: Full playthrough feels polished

## Success Metrics
- Crafting flow is intuitive (no confusion about costs)
- Companion abilities feel impactful (change combat tactics)
- Players return after closing the game (save system works)
- Visual/audio feedback makes actions satisfying
- Second biome adds variety (not just reskin)

## Risks & Mitigation
- **Risk:** Crafting UI becomes cluttered with many recipes
  - **Mitigation:** Tab/category system (Companions, Relics, Upgrades)
- **Risk:** Save system bugs cause progress loss
  - **Mitigation:** Version save files, add export/import backup
- **Risk:** Ability balance (too weak or overpowered)
  - **Mitigation:** Playtest with timers, adjust cooldowns iteratively

## Technical Considerations
- Recipe JSON schema should support future extensions (new essence types)
- Ability system should be data-driven (JSON ability definitions)
- Save format should include version number for migration
- Particle effects should pool objects for performance

## Dependencies on Phase 1
- Phase 1 must be complete (mobile controls, audio system)
- Core loop must feel stable before adding complexity
- Debug tools must work on mobile for testing

## Next Phase Preview
Phase 3 will add:
- Procedural map graph (connected rooms, branching paths)
- Boss variety (unique mechanics, phases)
- Relic system (passive buffs, build variety)
- Daily challenges / leaderboards
- Advanced companion evolution (visual upgrades, new forms)

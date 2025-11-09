---

### `/specs/modules/companion-system.md`
```markdown
---
type: module-spec
project: mem-totems
module: companion-system
version: 0.1
updated: 2025-11-08
---

# 🐾 Companion System Module

## Concept
The player journeys with one bonded creature per run.  
The companion provides passive bonuses, combat assistance, and emotional continuity between runs.

## Lifecycle
1. **Selection:** Choose one unlocked creature at camp before a run.  
2. **Run Participation:** Assists in combat and reacts to essence collection.  
3. **Bond Leveling:** Surviving runs or frequent use increases bond XP.  
4. **Evolution:** At milestones, form upgrades (color change, stat boost, new skill).  
5. **Legacy:** Fully bonded companions unlock cosmetic variants and relics.

## Abilities Example
| Companion | Passive | Active | Cooldown |
|------------|----------|---------|-----------|
| Fire Cub | +5% damage | Flame Dash | 10 s |
| Water Sprite | +10% heal from pickups | Splash Heal | 15 s |
| Rock Beetle | +10% defense | Barrier Shell | 20 s |

## Bond Mechanics
- XP gained through combat wins, run completions, or matching its element.  
- On defeat: loses temporary bond energy but revives next run.  
- Visual indicator: aura brightness and idle behavior.

## Technical Notes
- AI uses steering behavior toward player target.
- Data stored per companion ID; serialized at run end.
- Hooks: `onBondChange()`, `onAbilityTrigger()`, `onRunEnd()`.
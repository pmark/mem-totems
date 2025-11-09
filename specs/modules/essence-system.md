---
type: module-spec
project: mem-totems
module: essence-system
version: 0.1
updated: 2025-11-08
---

# 💠 Essence System Module

## Purpose
Core progression mechanic replacing direct creature capture.  
Players collect, combine, and refine **elemental essences** to craft creatures and upgrades.

## Essence Types
| Element | Color | Example Output Creature |
|----------|-------|-------------------------|
| Fire | Orange | Fire Cub / Phoenix |
| Water | Blue | Water Sprite |
| Earth | Brown | Stone Golem |
| Air | White | Gale Fox |
| Light | Gold | Seraph |
| Dark | Purple | Shadow Wolf |

## Flow
1. **Match totems →** gain elemental essence fragments.  
2. **Defeat enemies →** gain unstable essence.  
3. **Return to camp →** fuse essences in Spirit Forge.  
4. **Create new creatures or relics** via recipes.  

## Crafting Example
```json
{
  "recipeId": "fire-hawk",
  "requires": {
    "fire": 5,
    "air": 2,
    "rareCrystal": 1
  },
  "produces": "fire-hawk-creature"
}
```

## Economy
-	Common essence caps at 99 per type.
-	Rare crystals drop from bosses (used to unlock evolutions).
-	Excess essence can be traded for relic upgrades.

## UX
-	Crafting interface: radial menu or card-based layout.
-	Progress bars show accumulation toward next unlock.
-	Companion reacts to matching essence type with animation.

## Dependencies
-	Inputs from totem-system and combat-system.
-	Outputs to companion-system, relic-system.

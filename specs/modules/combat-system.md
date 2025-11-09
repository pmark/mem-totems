---

### `/specs/modules/combat-system.md`
```markdown
---
type: module-spec
project: mem-totems
module: combat-system
version: 0.1
updated: 2025-11-08
---

# ⚔️ Combat System Module

## Overview
Fast, intuitive mobile-friendly combat inspired by *The Legend of Zelda (NES)* with modern feedback design.  
Supports one active **player avatar** and one **companion creature** per run.

## Controls (Mobile)
| Action | Gesture | Description |
|--------|----------|-------------|
| Move | Left thumb virtual stick | 8-direction movement |
| Attack | Tap right side | Short melee strike |
| Dodge | Swipe right side | Quick roll or blink |
| Companion Ability | Hold + release | Trigger companion’s power |
| Interact | Auto near objects | Activate totems or pick up items |

## Player Mechanics
- **Attack Arc:** 90°–120° forward slash, 8–12 frame animation.
- **Damage Feedback:** 50 ms freeze-frame + flash.
- **Hitbox:** Small rectangle aligned to facing direction.
- **Health:** 3–5 hearts; scales slightly with relics.

## Companion AI
- Follows player within 2 m radius.
- Auto-targets nearest enemy.
- Ability cooldown: 10 s average.
- Bond Level affects damage and cooldown time.

## Enemy Types
| Element | Behavior | Example |
|----------|-----------|----------|
| Fire | Charges in straight line | Flame Lizard |
| Water | Shoots orbs | Aqua Sprite |
| Earth | Shields, slow melee | Rock Beetle |
| Air | Dashes & retreats | Gale Moth |

## Combat Flow
1. Player enters room → enemy spawns trigger.  
2. Combat locks camera until cleared.  
3. Player/companion attack or dodge.  
4. Upon victory: essence drops + visual reward.  
5. If player HP = 0 → run ends (return to camp).

## Visual & Audio Feedback
- Elemental particle bursts per hit.
- Ambient music layers intensify with enemy count.
- Essence pickups emit chime & color-coded glow.

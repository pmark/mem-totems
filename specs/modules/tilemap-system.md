---
type: module-spec
project: mem-totems
module: tilemap-system
version: 0.1
updated: 2025-11-08
---

# 🧱 Tilemap System Module

## Purpose
Defines the structure, layers, and data model for the game's 2D tile-based world generation.  
Enables procedural room assembly and object placement using JSON-based maps.

## Structure
- **Base Tileset:** 32×32 pixel tiles for terrain and decoration.
- **Layers:**
  1. `terrain` — grass, dirt, water, cliffs  
  2. `decoration` — plants, rocks, props (no collision)  
  3. `collision` — walls, trees, impassable elements  
  4. `objects` — totems, shrines, enemy spawns  

## Workflow
1. Author rooms in **Tiled** and export `.json`.  
2. Import tilemaps into the game engine (Phaser or Godot).  
3. Procedurally assemble rooms via a graph generator.  
4. Spawn interactive entities from the `objects` layer.  

## Data Schema Example
```json
{
  "id": "forest_room_01",
  "tileset": "forest_base",
  "exits": ["north", "east"],
  "totems": [
    {"x": 64, "y": 96, "symbol": "fire"},
    {"x": 160, "y": 192, "symbol": "air"}
  ],
  "enemies": [
    {"type": "slime", "x": 100, "y": 120}
  ]
}
```

## Procedural Generation Notes
-	Generate 6–8 connected rooms per run.
- Guarantee at least two matching totem pairs.
- Place 1 safe “rest room” and 1 boss room per seed.

## Rendering
- Camera: top-down orthographic, slight parallax on background layer.
- Lighting: optional bloom around active totems.

## Dependencies
- Requires: combat-system, totem-system.
- Outputs: Room layout, collision map, and spawn tables.

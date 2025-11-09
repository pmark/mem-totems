import type { ElementType } from '../entities/Totem';

export type RoomType = 'normal' | 'rest' | 'boss';

export interface TotemSpawn {
  x: number;
  y: number;
  element: ElementType;
}

export interface EnemySpawn {
  x: number;
  y: number;
  element: ElementType;
  health?: number;
}

export interface ExitPortal {
  x: number;
  y: number;
}

/**
 * Room template defining layout, spawns, and special properties
 */
export interface RoomTemplate {
  type: RoomType;
  mapData: number[][];
  totemSpawns: TotemSpawn[];
  enemySpawns?: EnemySpawn[];
  exitPortal: ExitPortal;
  playerStart: { x: number; y: number };
}

/**
 * Predefined room templates for procedural generation
 */
export class RoomTemplates {
  /**
   * Normal combat room - open arena
   */
  static openArena(): RoomTemplate {
    return {
      type: 'normal',
      mapData: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      ],
      totemSpawns: [
        { x: 96, y: 96, element: 'fire' },
        { x: 224, y: 96, element: 'fire' },
        { x: 96, y: 224, element: 'water' },
        { x: 224, y: 224, element: 'water' },
      ],
      exitPortal: { x: 160, y: 270 },
      playerStart: { x: 160, y: 50 },
    };
  }

  /**
   * Normal combat room - with pillars
   */
  static pillarRoom(): RoomTemplate {
    return {
      type: 'normal',
      mapData: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
        [1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
        [1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      ],
      totemSpawns: [
        { x: 64, y: 160, element: 'earth' },
        { x: 256, y: 160, element: 'earth' },
        { x: 160, y: 80, element: 'air' },
        { x: 160, y: 240, element: 'air' },
      ],
      exitPortal: { x: 160, y: 270 },
      playerStart: { x: 160, y: 50 },
    };
  }

  /**
   * Normal combat room - maze-like
   */
  static mazeRoom(): RoomTemplate {
    return {
      type: 'normal',
      mapData: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      ],
      totemSpawns: [
        { x: 64, y: 64, element: 'fire' },
        { x: 256, y: 64, element: 'fire' },
        { x: 64, y: 240, element: 'water' },
        { x: 256, y: 240, element: 'water' },
      ],
      exitPortal: { x: 160, y: 270 },
      playerStart: { x: 64, y: 50 },
    };
  }

  /**
   * Rest room - safe zone for healing
   */
  static restRoom(): RoomTemplate {
    return {
      type: 'rest',
      mapData: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 1, 1, 1, 1, 0, 0, 1],
        [1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
        [1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
        [1, 0, 0, 1, 1, 1, 1, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      ],
      totemSpawns: [], // No totems in rest room
      exitPortal: { x: 160, y: 270 },
      playerStart: { x: 160, y: 50 },
    };
  }

  /**
   * Boss room - large arena
   */
  static bossRoom(): RoomTemplate {
    return {
      type: 'boss',
      mapData: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      ],
      totemSpawns: [
        { x: 80, y: 80, element: 'fire' },
        { x: 240, y: 80, element: 'fire' },
        { x: 80, y: 240, element: 'water' },
        { x: 240, y: 240, element: 'water' },
        { x: 160, y: 100, element: 'earth' },
        { x: 160, y: 220, element: 'earth' },
      ],
      enemySpawns: [
        { x: 160, y: 160, element: 'fire', health: 60 }, // Boss enemy
      ],
      exitPortal: { x: 160, y: 270 },
      playerStart: { x: 160, y: 50 },
    };
  }

  /**
   * Get all normal room templates
   */
  static getNormalRooms(): RoomTemplate[] {
    return [
      this.openArena(),
      this.pillarRoom(),
      this.mazeRoom(),
    ];
  }

  /**
   * Get a random normal room template
   */
  static getRandomNormalRoom(): RoomTemplate {
    const rooms = this.getNormalRooms();
    return rooms[Math.floor(Math.random() * rooms.length)];
  }
}

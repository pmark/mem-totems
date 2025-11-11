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
  theme?: string;
}

/**
 * Room theme definitions for visual styling and enemy types
 */
export interface RoomTheme {
  name: string;
  floorColor: number;
  wallColor: number;
  pitColor: number;
  obstacleColor: number;
  ambientTint?: number;
  dominantElement: ElementType;
}

export const ROOM_THEMES: Record<string, RoomTheme> = {
  fire: {
    name: 'Volcanic Chamber',
    floorColor: 0x8b4513,
    wallColor: 0x3a1f0f,
    pitColor: 0xff4400,
    obstacleColor: 0x654321,
    ambientTint: 0xff6622,
    dominantElement: 'fire',
  },
  water: {
    name: 'Aquatic Depths',
    floorColor: 0x4a7c8f,
    wallColor: 0x1f3a4f,
    pitColor: 0x0a1f3a,
    obstacleColor: 0x5a8ca0,
    ambientTint: 0x4488cc,
    dominantElement: 'water',
  },
  earth: {
    name: 'Stone Cavern',
    floorColor: 0x7a8566,
    wallColor: 0x3f4735,
    pitColor: 0x2a2f20,
    obstacleColor: 0x6b7558,
    ambientTint: 0x88aa77,
    dominantElement: 'earth',
  },
  air: {
    name: 'Sky Sanctum',
    floorColor: 0xc0d9e8,
    wallColor: 0x6b8394,
    pitColor: 0x87ceeb,
    obstacleColor: 0xa0b5c5,
    ambientTint: 0xaaddff,
    dominantElement: 'air',
  },
  neutral: {
    name: 'Ancient Ruins',
    floorColor: 0x88aa88,
    wallColor: 0x444444,
    pitColor: 0x0b213a,
    obstacleColor: 0xb58c4a,
    dominantElement: 'fire', // default fallback
  },
};

/**
 * Predefined room templates for procedural generation
 */
export class RoomTemplates {
  /**
   * Normal combat room - open arena
   */
  static openArena(theme?: string): RoomTemplate {
    const themeKey = theme || this.randomTheme();
    return {
      type: 'normal',
      mapData: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 3, 3, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 2, 2, 2, 2, 0, 0, 1],
        [1, 0, 0, 2, 2, 2, 2, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 3, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      ],
      totemSpawns: [
        { x: 96, y: 96, element: ROOM_THEMES[themeKey].dominantElement },
        { x: 224, y: 96, element: ROOM_THEMES[themeKey].dominantElement },
        { x: 96, y: 224, element: this.contrastElement(ROOM_THEMES[themeKey].dominantElement) },
        { x: 224, y: 224, element: this.contrastElement(ROOM_THEMES[themeKey].dominantElement) },
      ],
      enemySpawns: [
        { x: 80, y: 120, element: ROOM_THEMES[themeKey].dominantElement, health: 30 },
        { x: 240, y: 120, element: ROOM_THEMES[themeKey].dominantElement, health: 30 },
        { x: 160, y: 200, element: ROOM_THEMES[themeKey].dominantElement, health: 35 },
      ],
      exitPortal: { x: 160, y: 270 },
      playerStart: { x: 160, y: 50 },
      theme: themeKey,
    };
  }

  /**
   * Normal combat room - with pillars
   */
  static pillarRoom(theme?: string): RoomTemplate {
    const themeKey = theme || this.randomTheme();
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
        { x: 64, y: 160, element: ROOM_THEMES[themeKey].dominantElement },
        { x: 256, y: 160, element: ROOM_THEMES[themeKey].dominantElement },
        { x: 160, y: 80, element: this.contrastElement(ROOM_THEMES[themeKey].dominantElement) },
        { x: 160, y: 240, element: this.contrastElement(ROOM_THEMES[themeKey].dominantElement) },
      ],
      enemySpawns: [
        { x: 112, y: 80, element: ROOM_THEMES[themeKey].dominantElement, health: 30 },
        { x: 208, y: 80, element: ROOM_THEMES[themeKey].dominantElement, health: 30 },
        { x: 64, y: 240, element: ROOM_THEMES[themeKey].dominantElement, health: 32 },
        { x: 256, y: 240, element: ROOM_THEMES[themeKey].dominantElement, health: 32 },
      ],
      exitPortal: { x: 160, y: 270 },
      playerStart: { x: 160, y: 50 },
      theme: themeKey,
    };
  }

  /**
   * Normal combat room - maze-like
   */
  static mazeRoom(theme?: string): RoomTemplate {
    const themeKey = theme || this.randomTheme();
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
        { x: 64, y: 64, element: ROOM_THEMES[themeKey].dominantElement },
        { x: 256, y: 64, element: ROOM_THEMES[themeKey].dominantElement },
        { x: 64, y: 240, element: this.contrastElement(ROOM_THEMES[themeKey].dominantElement) },
        { x: 256, y: 240, element: this.contrastElement(ROOM_THEMES[themeKey].dominantElement) },
      ],
      enemySpawns: [
        { x: 96, y: 96, element: ROOM_THEMES[themeKey].dominantElement, health: 28 },
        { x: 224, y: 160, element: ROOM_THEMES[themeKey].dominantElement, health: 30 },
      ],
      exitPortal: { x: 160, y: 270 },
      playerStart: { x: 64, y: 50 },
      theme: themeKey,
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
      theme: 'neutral',
    };
  }

  /**
   * Boss room - large arena
   */
  static bossRoom(theme?: string): RoomTemplate {
    const themeKey = theme || this.randomTheme();
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
        { x: 80, y: 80, element: ROOM_THEMES[themeKey].dominantElement },
        { x: 240, y: 80, element: ROOM_THEMES[themeKey].dominantElement },
        { x: 80, y: 240, element: this.contrastElement(ROOM_THEMES[themeKey].dominantElement) },
        { x: 240, y: 240, element: this.contrastElement(ROOM_THEMES[themeKey].dominantElement) },
        { x: 160, y: 100, element: ROOM_THEMES[themeKey].dominantElement },
        { x: 160, y: 220, element: this.contrastElement(ROOM_THEMES[themeKey].dominantElement) },
      ],
      enemySpawns: [
        { x: 160, y: 160, element: ROOM_THEMES[themeKey].dominantElement, health: 80 }, // Boss enemy
        { x: 100, y: 140, element: ROOM_THEMES[themeKey].dominantElement, health: 40 },
        { x: 220, y: 140, element: ROOM_THEMES[themeKey].dominantElement, health: 40 },
      ],
      exitPortal: { x: 160, y: 270 },
      playerStart: { x: 160, y: 50 },
      theme: themeKey,
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

  /**
   * Get random theme
   */
  private static randomTheme(): string {
    const themes = ['fire', 'water', 'earth', 'air'];
    return themes[Math.floor(Math.random() * themes.length)];
  }

  /**
   * Get contrasting element for variety
   */
  private static contrastElement(element: ElementType): ElementType {
    const contrasts: Record<ElementType, ElementType> = {
      fire: 'water',
      water: 'fire',
      earth: 'air',
      air: 'earth',
    };
    return contrasts[element];
  }
}

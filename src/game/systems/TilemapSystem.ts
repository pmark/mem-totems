import Phaser from 'phaser';
import { ROOM_THEMES, type RoomTheme } from '../data/RoomTemplates';

export interface TileData {
  x: number;
  y: number;
  type: 'floor' | 'wall';
}

export class TilemapSystem {
  private scene: Phaser.Scene;
  private tileSize: number;
  private mapData: number[][];
  private tiles: Phaser.GameObjects.Rectangle[] = [];
  private currentTheme: RoomTheme = ROOM_THEMES.neutral;

  constructor(scene: Phaser.Scene, tileSize: number = 32) {
    this.scene = scene;
    this.tileSize = tileSize;
    this.mapData = [];
  }

  /**
   * Initialize the tilemap with a 2D array
   * 0 = floor (walkable)
   * 1 = wall (not walkable)
   * 2 = pit (deep hazard)
   * 3 = low obstacle (jumpable)
   */
  loadMap(mapData: number[][], themeKey?: string): void {
    this.mapData = mapData;
    if (themeKey && ROOM_THEMES[themeKey]) {
      this.currentTheme = ROOM_THEMES[themeKey];
    } else {
      this.currentTheme = ROOM_THEMES.neutral;
    }
    this.renderMap();
  }

  private renderMap(): void {
    // Clear existing tiles
    this.tiles.forEach(tile => tile.destroy());
    this.tiles = [];

    // Render each tile with theme colors
    for (let y = 0; y < this.mapData.length; y++) {
      for (let x = 0; x < this.mapData[y].length; x++) {
        const tileType = this.mapData[y][x];
        const worldX = x * this.tileSize + this.tileSize / 2;
        const worldY = y * this.tileSize + this.tileSize / 2;

        let color: number;
        if (tileType === 1) {
          color = this.currentTheme.wallColor;
        } else if (tileType === 2) {
          color = this.currentTheme.pitColor;
        } else if (tileType === 3) {
          color = this.currentTheme.obstacleColor;
        } else {
          color = this.currentTheme.floorColor;
        }

        const tile = this.scene.add.rectangle(
          worldX,
          worldY,
          this.tileSize - 2,
          this.tileSize - 2,
          color
        );

        // Floor tiles lower depth than entities; walls slightly above floor but below player
        if (tileType === 0 || tileType === 2) {
          tile.setDepth(5); // floor
        } else if (tileType === 1) {
          tile.setDepth(6); // wall
        } else {
          tile.setDepth(6); // low obstacle slightly above floor
        }

        this.tiles.push(tile);
      }
    }
  }

  /**
   * Check if a position is walkable
   */
  isWalkable(x: number, y: number): boolean {
    const tileX = Math.floor(x / this.tileSize);
    const tileY = Math.floor(y / this.tileSize);

    // Out of bounds
    if (tileY < 0 || tileY >= this.mapData.length || 
        tileX < 0 || tileX >= this.mapData[0].length) {
      return false;
    }

    return this.mapData[tileY][tileX] === 0; // only floor walkable
  }

  /**
   * Get the tile size
   */
  getTileSize(): number {
    return this.tileSize;
  }

  /**
   * Get map dimensions
   */
  getMapDimensions(): { width: number; height: number } {
    return {
      height: this.mapData.length,
      width: this.mapData.length > 0 ? this.mapData[0].length : 0
    };
  }

  /** Get the tile type (0 floor, 1 wall, 2 pit, 3 low obstacle) at world coords */
  getTileAtWorld(x: number, y: number): number | null {
    const tileX = Math.floor(x / this.tileSize);
    const tileY = Math.floor(y / this.tileSize);
    if (tileY < 0 || tileY >= this.mapData.length || tileX < 0 || tileX >= (this.mapData[0]?.length ?? 0)) return null;
    return this.mapData[tileY][tileX];
  }

  isPit(x: number, y: number): boolean {
    const t = this.getTileAtWorld(x, y);
    return t === 2;
  }
  isWall(x: number, y: number): boolean {
    const t = this.getTileAtWorld(x, y);
    return t === 1;
  }
  /** Jumpable low obstacle: can traverse only while jumping */
  isJumpable(x: number, y: number): boolean {
    const t = this.getTileAtWorld(x, y);
    return t === 3;
  }
}

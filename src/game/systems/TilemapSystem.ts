import Phaser from 'phaser';

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

  constructor(scene: Phaser.Scene, tileSize: number = 32) {
    this.scene = scene;
    this.tileSize = tileSize;
    this.mapData = [];
  }

  /**
   * Initialize the tilemap with a 2D array
   * 0 = floor (walkable)
   * 1 = wall (not walkable)
   */
  loadMap(mapData: number[][]): void {
    this.mapData = mapData;
    this.renderMap();
  }

  private renderMap(): void {
    // Clear existing tiles
    this.tiles.forEach(tile => tile.destroy());
    this.tiles = [];

    // Render each tile
    for (let y = 0; y < this.mapData.length; y++) {
      for (let x = 0; x < this.mapData[y].length; x++) {
        const tileType = this.mapData[y][x];
        const worldX = x * this.tileSize + this.tileSize / 2;
        const worldY = y * this.tileSize + this.tileSize / 2;

        let color: number;
        if (tileType === 1) {
          color = 0x444444; // Wall - dark gray
        } else {
          color = 0x88aa88; // Floor - light green
        }

        const tile = this.scene.add.rectangle(
          worldX,
          worldY,
          this.tileSize - 2,
          this.tileSize - 2,
          color
        );

        // Floor tiles lower depth than entities; walls slightly above floor but below player
        if (tileType === 0) {
          tile.setDepth(5); // floor
        } else {
          tile.setDepth(6); // wall
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

    return this.mapData[tileY][tileX] === 0;
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
}

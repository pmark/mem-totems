import Phaser from 'phaser';

export type ElementType = 'fire' | 'water' | 'earth' | 'air';

export interface TotemConfig {
  x: number;
  y: number;
  element: ElementType;
}

/**
 * Totem entity representing memory-matching symbols in the game world.
 * Each totem has an element type and can be activated by the player.
 */
export class Totem {
  public readonly element: ElementType;
  public readonly sprite: Phaser.GameObjects.Container;
  public isActivated: boolean = false;
  
  private scene: Phaser.Scene;
  private body: Phaser.GameObjects.Arc;
  private elementText: Phaser.GameObjects.Text;
  private glowEffect?: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, config: TotemConfig) {
    this.scene = scene;
    this.element = config.element;
    
  // Create container for totem visuals
  this.sprite = scene.add.container(config.x, config.y);
  this.sprite.setDepth(9);
    
    // Create totem body with element-based color
    const color = this.getElementColor(config.element);
    this.body = scene.add.arc(0, 0, 16, 0, 360, false, color, 0.8);
    
    // Create element symbol text
    const symbol = this.getElementSymbol(config.element);
    this.elementText = scene.add.text(0, 0, symbol, {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Add components to container
    this.sprite.add([this.body, this.elementText]);
  }

  /**
   * Activate this totem, showing visual feedback
   */
  activate(): void {
    if (this.isActivated) return;
    
    this.isActivated = true;
    
    // Add glow effect
    this.glowEffect = this.scene.add.arc(
      0, 0, 24, 0, 360, false, this.getElementColor(this.element), 0.3
    );
    this.sprite.addAt(this.glowEffect, 0); // Add behind other elements
    
    // Pulse animation
    this.scene.tweens.add({
      targets: this.body,
      scale: { from: 1, to: 1.2 },
      duration: 200,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Deactivate this totem (for mismatch resolution)
   */
  deactivate(): void {
    this.isActivated = false;
    
    if (this.glowEffect) {
      this.glowEffect.destroy();
      this.glowEffect = undefined;
    }
    
    this.body.setScale(1);
  }

  /**
   * Destroy this totem (for successful match resolution)
   */
  destroy(): void {
    // Fade out animation
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: { from: 1, to: 0 },
      scale: { from: 1, to: 1.5 },
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        this.sprite.destroy();
      }
    });
  }

  /**
   * Get world position of this totem
   */
  getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  /**
   * Check if a point is near this totem (for interaction)
   */
  isNear(x: number, y: number, distance: number = 40): boolean {
    const dx = this.sprite.x - x;
    const dy = this.sprite.y - y;
    return Math.sqrt(dx * dx + dy * dy) <= distance;
  }

  /**
   * Get the color associated with an element type
   */
  private getElementColor(element: ElementType): number {
    const colors: Record<ElementType, number> = {
      fire: 0xff4444,    // Red
      water: 0x4444ff,   // Blue
      earth: 0x88aa44,   // Green-brown
      air: 0xcccccc,     // Light gray
    };
    return colors[element];
  }

  /**
   * Get the symbol/icon for an element type
   */
  private getElementSymbol(element: ElementType): string {
    const symbols: Record<ElementType, string> = {
      fire: '🔥',
      water: '💧',
      earth: '🌍',
      air: '💨',
    };
    return symbols[element];
  }
}

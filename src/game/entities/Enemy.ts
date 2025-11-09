import Phaser from 'phaser';
import type { ElementType } from './Totem';

export interface EnemyConfig {
  x: number;
  y: number;
  element: ElementType;
  health?: number;
  speed?: number;
}

/**
 * Enemy entity that spawns from totem mismatches.
 * Pursues the player and deals damage on contact.
 */
export class Enemy {
  public readonly element: ElementType;
  public readonly sprite: Phaser.GameObjects.Container;
  public health: number;
  public maxHealth: number;
  public isDead: boolean = false;

  private scene: Phaser.Scene;
  private body: Phaser.GameObjects.Arc;
  private healthBar: Phaser.GameObjects.Graphics;
  private speed: number;

  // Event callbacks
  public onDeath?: (enemy: Enemy) => void;
  public onDamage?: (enemy: Enemy, damage: number) => void;

  constructor(scene: Phaser.Scene, config: EnemyConfig) {
    this.scene = scene;
    this.element = config.element;
    this.maxHealth = config.health || 30;
    this.health = this.maxHealth;
    this.speed = config.speed || 1;

  // Create container
  this.sprite = scene.add.container(config.x, config.y);
  this.sprite.setDepth(10); // above totems/tiles, below player/companion

    // Create enemy body with element color (darker shade)
    const color = this.getElementColor(config.element);
    this.body = scene.add.arc(0, 0, 12, 0, 360, false, color, 0.9);

    // Create health bar
    this.healthBar = scene.add.graphics();
    this.updateHealthBar();

    // Add components to container
    this.sprite.add([this.body, this.healthBar]);

    // Spawn animation
    this.sprite.setScale(0);
    scene.tweens.add({
      targets: this.sprite,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
  }

  /**
   * Update enemy behavior (movement towards target)
   */
  update(targetX: number, targetY: number): void {
    if (this.isDead) return;

    // Simple chase AI - move towards target
    const dx = targetX - this.sprite.x;
    const dy = targetY - this.sprite.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5) {
      const normalizedX = dx / distance;
      const normalizedY = dy / distance;

      this.sprite.x += normalizedX * this.speed;
      this.sprite.y += normalizedY * this.speed;
    }
  }

  /**
   * Take damage
   */
  takeDamage(amount: number): void {
    if (this.isDead) return;

    this.health = Math.max(0, this.health - amount);
    this.updateHealthBar();

    // Damage flash effect
    this.scene.tweens.add({
      targets: this.body,
      alpha: { from: 1, to: 0.3 },
      duration: 100,
      yoyo: true,
      ease: 'Linear'
    });

    if (this.onDamage) {
      this.onDamage(this, amount);
    }

    if (this.health <= 0) {
      this.die();
    }
  }

  /**
   * Handle death
   */
  private die(): void {
    if (this.isDead) return;
    
    this.isDead = true;

    if (this.onDeath) {
      this.onDeath(this);
    }

    // Death animation
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      scale: 0.5,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        this.sprite.destroy();
      }
    });
  }

  /**
   * Get position
   */
  getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  /**
   * Check if overlapping with a point (for collision detection)
   */
  isOverlapping(x: number, y: number, radius: number = 12): boolean {
    if (this.isDead) return false;
    
    const dx = this.sprite.x - x;
    const dy = this.sprite.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= radius + 12; // 12 is enemy radius
  }

  /**
   * Destroy this enemy
   */
  destroy(): void {
    this.sprite.destroy();
  }

  /**
   * Update health bar visual
   */
  private updateHealthBar(): void {
    this.healthBar.clear();

    const barWidth = 24;
    const barHeight = 3;
    const yOffset = -18;

    // Background (red)
    this.healthBar.fillStyle(0x000000, 0.5);
    this.healthBar.fillRect(-barWidth / 2, yOffset, barWidth, barHeight);

    // Health (element colored)
    const healthPercent = this.health / this.maxHealth;
    const healthColor = this.getElementColor(this.element);
    this.healthBar.fillStyle(healthColor, 1);
    this.healthBar.fillRect(-barWidth / 2, yOffset, barWidth * healthPercent, barHeight);
  }

  /**
   * Get element color (darker version for enemies)
   */
  private getElementColor(element: ElementType): number {
    const colors: Record<ElementType, number> = {
      fire: 0xcc0000,    // Dark red
      water: 0x0000cc,   // Dark blue
      earth: 0x665522,   // Dark brown
      air: 0x888888,     // Dark gray
    };
    return colors[element];
  }
}

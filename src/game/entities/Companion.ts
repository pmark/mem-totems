import Phaser from 'phaser';

export interface CompanionConfig {
  x: number;
  y: number;
  damage?: number;
  attackCooldown?: number;
}

/**
 * Companion entity that follows the player and attacks nearby enemies.
 * Provides combat support and additional damage output.
 */
export class Companion {
  public readonly sprite: Phaser.GameObjects.Container;
  public damage: number;

  private scene: Phaser.Scene;
  private body: Phaser.GameObjects.Arc;
  private followDistance: number = 30;
  private speed: number = 1.5;
  private attackCooldown: number;
  private lastAttackTime: number = 0;

  constructor(scene: Phaser.Scene, config: CompanionConfig) {
    this.scene = scene;
    this.damage = config.damage || 10;
    this.attackCooldown = config.attackCooldown || 1000; // ms

    // Create container
  this.sprite = scene.add.container(config.x, config.y);
  this.sprite.setDepth(12); // just above player for visibility marker

    // Create companion body (cyan/teal color)
    this.body = scene.add.arc(0, 0, 8, 0, 360, false, 0x00cccc, 0.9);

    // Add a small marker to show it's friendly
    const marker = scene.add.arc(0, -6, 3, 0, 360, false, 0xffff00, 1);

    // Add components to container
    this.sprite.add([this.body, marker]);

    // Idle floating animation
    scene.tweens.add({
      targets: this.body,
      y: { from: 0, to: -2 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Update companion behavior
   */
  update(playerX: number, playerY: number): void {
    this.followPlayer(playerX, playerY);
  }

  /**
   * Follow the player at a set distance
   */
  private followPlayer(playerX: number, playerY: number): void {
    const dx = playerX - this.sprite.x;
    const dy = playerY - this.sprite.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Only move if further than follow distance
    if (distance > this.followDistance) {
      const normalizedX = dx / distance;
      const normalizedY = dy / distance;

      // Move towards player but maintain follow distance
      const targetDistance = distance - this.followDistance;
      const moveSpeed = Math.min(this.speed, targetDistance);

      this.sprite.x += normalizedX * moveSpeed;
      this.sprite.y += normalizedY * moveSpeed;
    }
  }

  /**
   * Attack an enemy if off cooldown
   */
  canAttack(): boolean {
    const now = this.scene.time.now;
    return now - this.lastAttackTime >= this.attackCooldown;
  }

  /**
   * Perform attack (call this when enemy is in range)
   */
  attack(): void {
    this.lastAttackTime = this.scene.time.now;

    // Attack animation
    this.scene.tweens.add({
      targets: this.body,
      scale: { from: 1, to: 1.3 },
      duration: 150,
      yoyo: true,
      ease: 'Back.easeOut'
    });
  }

  /**
   * Get position
   */
  getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  /**
   * Check if enemy is in attack range
   */
  isInRange(x: number, y: number, range: number = 25): boolean {
    const dx = this.sprite.x - x;
    const dy = this.sprite.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= range;
  }

  /**
   * Destroy this companion
   */
  destroy(): void {
    this.sprite.destroy();
  }
}

import Phaser from 'phaser';
import { Enemy } from '../entities/Enemy';
import { Companion } from '../entities/Companion';

/**
 * Manages combat interactions between player, companions, and enemies.
 * Handles damage dealing, collision detection, and death events.
 */
export class CombatSystem {
  private scene: Phaser.Scene;
  private enemies: Enemy[] = [];
  private companion: Companion | null = null;

  // Player stats
  private playerHealth: number = 100;
  private maxPlayerHealth: number = 100;
  private playerDamage: number = 15;
  private playerAttackRange: number = 20;
  private playerAttackCooldown: number = 500; // ms
  private lastPlayerAttackTime: number = 0;

  // Player damage cooldown (to prevent instant death)
  private playerDamageCooldown: number = 1000; // ms
  private lastPlayerDamageTime: number = 0;

  // Event callbacks
  public onPlayerDamaged?: (health: number, maxHealth: number) => void;
  public onPlayerDeath?: () => void;
  public onEnemyDeath?: (enemy: Enemy) => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Set the companion
   */
  setCompanion(companion: Companion): void {
    this.companion = companion;
  }

  /**
   * Add an enemy to the combat system
   */
  addEnemy(enemy: Enemy): void {
    enemy.onDeath = (e) => this.handleEnemyDeath(e);
    this.enemies.push(enemy);
  }

  /**
   * Get all active enemies
   */
  getEnemies(): readonly Enemy[] {
    return this.enemies;
  }

  /**
   * Update combat system - handle all combat interactions
   */
  update(playerX: number, playerY: number): void {
    // Update all enemies
    for (const enemy of this.enemies) {
      enemy.update(playerX, playerY);
    }

    // Update companion
    if (this.companion) {
      this.companion.update(playerX, playerY);
      this.handleCompanionCombat();
    }

    // Handle enemy damage to player
    this.handleEnemyDamageToPlayer(playerX, playerY);
  }

  /**
   * Player attempts to attack nearby enemies
   */
  playerAttack(playerX: number, playerY: number): boolean {
    const now = this.scene.time.now;
    if (now - this.lastPlayerAttackTime < this.playerAttackCooldown) {
      return false; // On cooldown
    }

    // Find nearest enemy in range
    let nearestEnemy: Enemy | null = null;
    let minDistance = this.playerAttackRange;

    for (const enemy of this.enemies) {
      if (enemy.isDead) continue;

      const pos = enemy.getPosition();
      const dx = pos.x - playerX;
      const dy = pos.y - playerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < minDistance) {
        minDistance = distance;
        nearestEnemy = enemy;
      }
    }

    if (nearestEnemy) {
      this.lastPlayerAttackTime = now;
      nearestEnemy.takeDamage(this.playerDamage);
      return true;
    }

    return false;
  }

  /**
   * Handle companion attacking enemies
   */
  private handleCompanionCombat(): void {
    if (!this.companion || !this.companion.canAttack()) return;

    // Find nearest enemy in range
    for (const enemy of this.enemies) {
      if (enemy.isDead) continue;

      const enemyPos = enemy.getPosition();
      if (this.companion.isInRange(enemyPos.x, enemyPos.y)) {
        this.companion.attack();
        enemy.takeDamage(this.companion.damage);
        break; // Only attack one enemy at a time
      }
    }
  }

  /**
   * Handle enemies damaging the player
   */
  private handleEnemyDamageToPlayer(playerX: number, playerY: number): void {
    const now = this.scene.time.now;
    if (now - this.lastPlayerDamageTime < this.playerDamageCooldown) {
      return; // On cooldown
    }

    for (const enemy of this.enemies) {
      if (enemy.isDead) continue;

      if (enemy.isOverlapping(playerX, playerY, 10)) {
        this.lastPlayerDamageTime = now;
        this.playerTakeDamage(10);
        break; // Only one enemy damages at a time
      }
    }
  }

  /**
   * Player takes damage
   */
  private playerTakeDamage(amount: number): void {
    this.playerHealth = Math.max(0, this.playerHealth - amount);

    if (this.onPlayerDamaged) {
      this.onPlayerDamaged(this.playerHealth, this.maxPlayerHealth);
    }

    if (this.playerHealth <= 0) {
      if (this.onPlayerDeath) {
        this.onPlayerDeath();
      }
    }
  }

  /**
   * Handle enemy death
   */
  private handleEnemyDeath(enemy: Enemy): void {
    this.enemies = this.enemies.filter(e => e !== enemy);

    if (this.onEnemyDeath) {
      this.onEnemyDeath(enemy);
    }
  }

  /**
   * Get player health info
   */
  getPlayerHealth(): { current: number; max: number } {
    return { current: this.playerHealth, max: this.maxPlayerHealth };
  }

  /**
   * Get count of active enemies
   */
  getEnemyCount(): number {
    return this.enemies.filter(e => !e.isDead).length;
  }

  /**
   * Clear all enemies
   */
  clearEnemies(): void {
    for (const enemy of this.enemies) {
      enemy.destroy();
    }
    this.enemies = [];
  }

  /**
   * Reset player combat state (health and cooldowns)
   */
  resetPlayer(): void {
    this.playerHealth = this.maxPlayerHealth;
    this.lastPlayerAttackTime = 0;
    this.lastPlayerDamageTime = 0;
    if (this.onPlayerDamaged) {
      this.onPlayerDamaged(this.playerHealth, this.maxPlayerHealth);
    }
  }
}

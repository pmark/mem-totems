import Phaser from 'phaser';
import { TilemapSystem } from './systems/TilemapSystem';
import { TotemSystem } from './systems/TotemSystem';
import { EssenceSystem } from './systems/EssenceSystem';
import { CombatSystem } from './systems/CombatSystem';
import { RoomSystem } from './systems/RoomSystem';
import { Totem } from './entities/Totem';
import { Companion } from './entities/Companion';
import { Enemy } from './entities/Enemy';
import type { ElementType } from './entities/Totem';
import { GameHUDStore } from '../debug/GameHUDStore';
import { TouchController } from '../input/TouchController';

export class MainScene extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private attackKey!: Phaser.Input.Keyboard.Key;
  private regenerateKey!: Phaser.Input.Keyboard.Key;
  private player!: Phaser.GameObjects.Arc;
  private tilemapSystem!: TilemapSystem;
  private totemSystem!: TotemSystem;
  private essenceSystem!: EssenceSystem;
  private combatSystem!: CombatSystem;
  private roomSystem!: RoomSystem;
  private companion!: Companion;
  private playerSpeed: number = 2;
  private autoAttackCooldown: number = 650; // ms, Archero-like cadence
  private lastAutoAttackTime: number = 0;
  
  // Removed Phaser UI elements (now provided by React HUD)

  constructor() {
    super('MainScene');
  }

  create() {
    console.log('MainScene ready');

    // Production: no temporary banners or diagnostics

    // Initialize systems
    this.tilemapSystem = new TilemapSystem(this, 32);
    this.totemSystem = new TotemSystem(this);
    this.essenceSystem = new EssenceSystem(99);
    this.combatSystem = new CombatSystem(this);
    this.roomSystem = new RoomSystem(this);
    
    // Set up system event handlers
  this.totemSystem.onMatch = (element: ElementType) => this.handleTotemMatch(element);
  this.totemSystem.onMismatch = () => this.handleTotemMismatch();
  this.essenceSystem.onEssenceChanged = (essence) => GameHUDStore.setEssence(essence);
  this.combatSystem.onPlayerDamaged = (health, maxHealth) => GameHUDStore.setHealth({ current: health, max: maxHealth });
    this.combatSystem.onPlayerDeath = () => this.handlePlayerDeath();
    this.combatSystem.onEnemyDeath = (enemy) => this.handleEnemyDeath(enemy);
    this.roomSystem.onRoomCleared = () => this.handleRoomCleared();
    this.roomSystem.onRoomTransition = (index) => this.handleRoomTransition(index);
    this.roomSystem.onRunComplete = () => this.handleRunComplete();
    

      // Set up keyboard controls
      this.cursors = this.input.keyboard!.createCursorKeys();
      this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.attackKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.regenerateKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    // Load first room (React HUD will reflect state via store)
    this.loadCurrentRoom();
  }

  update() {
    this.handlePlayerMovement();
    this.handleTotemInteraction();
    this.handleCombat();
    this.handleRoomTransitionCheck();
    this.handleRunRegeneration();
  }

  /**
   * Load the current room from RoomSystem
   */
  private loadCurrentRoom(): void {
    const roomIndex = this.roomSystem.getCurrentRoomIndex();
    const room = this.roomSystem.getCurrentRoom();
    console.info('Loading room', { index: roomIndex, type: room.type });
    
    // Load tilemap
    this.tilemapSystem.loadMap(room.mapData);
    
    // Create/reset player
    if (!this.player) {
      this.player = this.add.circle(room.playerStart.x, room.playerStart.y, 10, 0xffcc00);
      this.player.setDepth(12);
    } else {
      this.player.setPosition(room.playerStart.x, room.playerStart.y);
      this.player.setDepth(12);
  }
    
    // Create/reset companion
    if (!this.companion) {
      this.companion = new Companion(this, { 
        x: room.playerStart.x + 20, 
        y: room.playerStart.y 
      });
      this.combatSystem.setCompanion(this.companion);
    } else {
      this.companion.sprite.setPosition(room.playerStart.x + 20, room.playerStart.y);
    }
    
    // Spawn totems
    this.totemSystem = new TotemSystem(this);
    this.totemSystem.onMatch = (element: ElementType) => this.handleTotemMatch(element);
    this.totemSystem.onMismatch = () => this.handleTotemMismatch();
    
    for (const spawn of room.totemSpawns) {
      const totem = new Totem(this, {
        x: spawn.x,
        y: spawn.y,
        element: spawn.element
      });
      this.totemSystem.addTotem(totem);
    }
    
    // Spawn enemies (for boss room or pre-spawned enemies)
    if (room.enemySpawns) {
      for (const spawn of room.enemySpawns) {
        const enemy = new Enemy(this, {
          x: spawn.x,
          y: spawn.y,
          element: spawn.element,
          health: spawn.health
        });
        this.combatSystem.addEnemy(enemy);
      }
    }
    
    GameHUDStore.setRoom({
      index: this.roomSystem.getCurrentRoomIndex(),
      total: this.roomSystem.getTotalRooms?.() ?? this.roomSystem.getCurrentRoomIndex() + 1,
      type: room.type,
      description: this.roomSystem.getRoomTypeDescription()
    });
    
    // Special handling for rest room
    if (this.roomSystem.isRestRoom()) {
      GameHUDStore.setStatus('Rest Room - Move to portal when ready');
      this.roomSystem.markRoomCleared(); // Auto-clear rest room
    } else {
      // Provide initial guidance if this is the first room
      if (roomIndex === 0) {
        GameHUDStore.setStatus('🌟 Welcome, Spirit Tamer! Your goal: Match all totem pairs in each room to progress.');
        this.time.delayedCall(3500, () => {
          this.updateRoomStatus();
        });
      } else {
        this.updateRoomStatus();
      }
    }

    console.info('Room loaded', { index: roomIndex, type: room.type, totems: this.totemSystem.getRemainingCount(), enemies: this.combatSystem.getEnemyCount() });
  }

  /**
   * Check for room transition
   */
  private handleRoomTransitionCheck(): void {
    if (this.roomSystem.canTransition(this.player.x, this.player.y)) {
      GameHUDStore.setPrompt('SPACE to enter portal');
      const interact = Phaser.Input.Keyboard.JustDown(this.spaceKey) || TouchController.consumeInteract();
      if (interact) {
        this.roomSystem.transitionToNextRoom();
      }
    } else if (!this.totemSystem.findNearestTotem(this.player.x, this.player.y, 40)) {
      GameHUDStore.setPrompt(null);
    }
  }

  /**
   * Handle room cleared event
   */
  private handleRoomCleared(): void {
    GameHUDStore.setStatus('🎊 Room Cleared! You matched all totems and defeated all enemies!');
    GameHUDStore.setPrompt('🌀 A cyan portal has appeared - Move close and press SPACE to continue');
    
    // Visual feedback - flash effect
    const flash = this.add.rectangle(160, 160, 320, 320, 0x00ffff, 0.3);
    flash.setDepth(100);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 600,
      onComplete: () => flash.destroy()
    });
    
    this.time.delayedCall(2000, () => {
      GameHUDStore.setStatus('The portal shimmers with energy, waiting for you to step through...');
    });
  }

  /**
   * Handle room transition
   */
  private handleRoomTransition(index: number): void {
    const totalRooms = this.roomSystem.getTotalRooms();
    console.log(`Transitioning to room ${index + 1} of ${totalRooms}`);
    
    GameHUDStore.setStatus(`🚪 Entering Room ${index + 1} of ${totalRooms}...`);
    
    // Clear all enemies
    this.combatSystem.clearEnemies();
    
    // Load new room
    this.loadCurrentRoom();
    
    // Flash transition effect
    const flash = this.add.rectangle(160, 160, 320, 320, 0xffffff, 1);
    flash.setDepth(10000);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        flash.destroy();
        // Give player a moment to orient in new room
        this.time.delayedCall(500, () => {
          this.updateRoomStatus();
        });
      }
    });
  }

  /**
   * Handle run complete
   */
  private handleRunComplete(): void {
    GameHUDStore.setVictory();
    GameHUDStore.setStatus('🏆 Victory! You conquered all rooms and proved your worth as a Spirit Tamer!');
    GameHUDStore.setPrompt('🎮 Press R to start a new run with fresh challenges');
    this.playerSpeed = 0;
  }

  /**
   * Update room status text
   */
  private updateRoomStatus(): void {
    const totems = this.totemSystem.getRemainingCount();
    const enemies = this.combatSystem.getEnemyCount();
    
    if (totems > 0) {
      GameHUDStore.setStatus(`${totems} totems remaining - Press SPACE to activate`);
    } else if (enemies > 0) {
      GameHUDStore.setStatus(`${enemies} enemies remaining - Press A to attack`);
    } else {
      GameHUDStore.setStatus('Press SPACE near totems to activate');
    }
  }

  /**
   * Set up UI elements
   */
  // Removed setupUI (React HUD handles display)

  /**
   * Handle combat updates
   */
  private handleCombat(): void {
    // Update combat system
    this.combatSystem.update(this.player.x, this.player.y);

    // Update companion
    this.companion.update(this.player.x, this.player.y);

    // Auto-attack when idle: if no virtual or keyboard movement, trigger attack on cooldown
    const moving = this.isPlayerMoving();
    const now = this.time.now;
    if (!moving && now - this.lastAutoAttackTime >= this.autoAttackCooldown) {
      const didAttack = this.combatSystem.playerAttack(this.player.x, this.player.y);
      if (didAttack) {
        this.lastAutoAttackTime = now;
        this.tweens.add({ targets: this.player, scale: { from: 1, to: 1.2 }, duration: 100, yoyo: true });
      }
    }

    // Keep manual attack available on keyboard for desktop
    if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
      const didAttack = this.combatSystem.playerAttack(this.player.x, this.player.y);
      if (didAttack) {
        this.tweens.add({ targets: this.player, scale: { from: 1, to: 1.2 }, duration: 100, yoyo: true });
      }
    }
  }

  /**
   * Update health UI
   */
  // Health UI handled by React HUD

  /**
   * Handle player death
   */
  private handlePlayerDeath(): void {
  GameHUDStore.setDead();
    GameHUDStore.setStatus('💀 Defeated! The spirits overwhelmed you, but your journey isn\'t over.');
    GameHUDStore.setPrompt('🔄 Press R to rise again and try a new run');
    
    // Stop player movement
    this.playerSpeed = 0;
    
    // Fade out player
    this.tweens.add({
      targets: this.player,
      alpha: 0,
      duration: 500
    });
  }

  /**
   * Handle enemy death
   */
  private handleEnemyDeath(enemy: Enemy): void {
    // Drop essence based on enemy element
    this.essenceSystem.addEssence(enemy.element, 1);
    
    GameHUDStore.setStatus(`Enemy defeated! +1 ${enemy.element} essence`);
    
    this.time.delayedCall(1500, () => {
      const enemyCount = this.combatSystem.getEnemyCount();
      if (enemyCount > 0) {
        GameHUDStore.setStatus(`${enemyCount} enemies remaining - Press A to attack`);
      } else {
        // All enemies defeated, check if room can be cleared
        this.checkRoomClearConditions();
      }
    });
  }

  /**
   * Check if room clear conditions are met (all totems + all enemies cleared)
   */
  private checkRoomClearConditions(): void {
    const totems = this.totemSystem.getRemainingCount();
    const enemies = this.combatSystem.getEnemyCount();
    
    if (totems === 0 && enemies === 0) {
      // Room is clear!
      GameHUDStore.setStatus('🌟 Outstanding! All totems matched and all enemies defeated!');
      GameHUDStore.setPrompt('✨ Portal opened! Press SPACE to advance');
      this.roomSystem.markRoomCleared();
    } else if (totems > 0) {
      GameHUDStore.setStatus(`✨ Enemies cleared! Now match the ${totems} remaining ${totems === 1 ? 'totem' : 'totems'} to complete this room.`);
    } else if (enemies > 0) {
      GameHUDStore.setStatus(`🎯 Totems cleared! Finish off the ${enemies} remaining ${enemies === 1 ? 'enemy' : 'enemies'}.`);
    }
  }

  // Essence UI handled by React HUD

  /**
   * Handle totem match event
   */
  private handleTotemMatch(element: ElementType): void {
    this.essenceSystem.addEssence(element, 1);
    
    const remaining = this.totemSystem.getRemainingCount();
    
    if (remaining === 0) {
      // All totems matched - celebrate and clear room!
      GameHUDStore.setStatus(`🎉 Perfect Match! All ${element} totems paired! You've cleared the room!`);
      GameHUDStore.setPrompt('🌟 Room Complete! Move to the cyan portal to continue');
      
      // Mark room as cleared (spawns exit portal)
      this.roomSystem.markRoomCleared();
      
      this.time.delayedCall(3000, () => {
        GameHUDStore.setStatus('Excellent work! The portal awaits...');
      });
    } else {
      // More totems remain
      GameHUDStore.setStatus(`✨ Great match! +1 ${element} essence collected. ${remaining} totems remaining in this room.`);
      
      this.time.delayedCall(2500, () => {
        const enemies = this.combatSystem.getEnemyCount();
        if (enemies > 0) {
          GameHUDStore.setStatus(`Clear ${enemies} enemies, then continue matching totems`);
        } else {
          GameHUDStore.setStatus(`Find and match the remaining ${remaining} totems`);
        }
      });
    }
  }

  /**
   * Handle totem mismatch event
   */
  private handleTotemMismatch(): void {
      GameHUDStore.setStatus('❌ Totem Mismatch! The totems rejected each other and summoned a hostile spirit!');
      GameHUDStore.setPrompt('⚔️ Defeat the enemy to continue');
    
    // Spawn enemy near the player
    const spawnDistance = 80;
    const angle = Math.random() * Math.PI * 2;
    const spawnX = this.player.x + Math.cos(angle) * spawnDistance;
    const spawnY = this.player.y + Math.sin(angle) * spawnDistance;
    
    // Random element for enemy
    const elements: ElementType[] = ['fire', 'water', 'earth', 'air'];
    const randomElement = elements[Math.floor(Math.random() * elements.length)];
    
    const enemy = new Enemy(this, {
      x: spawnX,
      y: spawnY,
      element: randomElement,
      health: 30,
      speed: 1
    });
    
    this.combatSystem.addEnemy(enemy);
    
      // Give detailed feedback about enemy spawn
      this.time.delayedCall(2500, () => {
        GameHUDStore.setStatus(`⚠️ A wild ${randomElement} spirit appeared! Press A to attack or dodge using arrow keys.`);
      });
    
      this.time.delayedCall(5000, () => {
        const enemies = this.combatSystem.getEnemyCount();
        if (enemies > 0) {
          GameHUDStore.setStatus(`${enemies} ${enemies === 1 ? 'enemy' : 'enemies'} remaining - Attack with A key`);
        }
      });
  }

  /**
   * Handle totem interaction
   */
  private handleTotemInteraction(): void {
    // Find nearest totem
    const nearestTotem = this.totemSystem.findNearestTotem(this.player.x, this.player.y, 40);
    
    if (nearestTotem) {
      GameHUDStore.setPrompt('SPACE to activate');
      
      // Check for space key press
      const interact = Phaser.Input.Keyboard.JustDown(this.spaceKey) || TouchController.consumeInteract();
      if (interact && !this.totemSystem.isProcessing()) {
        this.totemSystem.activateTotem(nearestTotem);
      }
    } else {
      if (!this.roomSystem.canTransition(this.player.x, this.player.y)) {
        GameHUDStore.setPrompt(null);
      }
    }
  }

  private handlePlayerMovement(): void {
    let velocityX = 0;
    let velocityY = 0;

    // Virtual joystick (touch)
    const tv = TouchController.get();
    if (tv.active && tv.mag > 0.05) {
      velocityX = tv.x * this.playerSpeed;
      velocityY = tv.y * this.playerSpeed;
    } else {
      // Keyboard fallback
      if (this.cursors.left.isDown) {
        velocityX = -this.playerSpeed;
      } else if (this.cursors.right.isDown) {
        velocityX = this.playerSpeed;
      }

      if (this.cursors.up.isDown) {
        velocityY = -this.playerSpeed;
      } else if (this.cursors.down.isDown) {
        velocityY = this.playerSpeed;
      }
    }

    // Calculate new position
    const newX = this.player.x + velocityX;
    const newY = this.player.y + velocityY;

    // Check if new position is walkable (check all corners of player circle)
    const radius = 10;
    const corners = [
      { x: newX - radius, y: newY - radius }, // top-left
      { x: newX + radius, y: newY - radius }, // top-right
      { x: newX - radius, y: newY + radius }, // bottom-left
      { x: newX + radius, y: newY + radius }, // bottom-right
    ];

    const canMove = corners.every(corner => 
      this.tilemapSystem.isWalkable(corner.x, corner.y)
    );

    // Only move if all corners are on walkable tiles
    if (canMove) {
      this.player.x = newX;
      this.player.y = newY;
    }
  }

  private isPlayerMoving(): boolean {
    const tv = TouchController.get();
    const touching = tv.active && tv.mag > 0.05;
    const keyboard = this.cursors.left.isDown || this.cursors.right.isDown || this.cursors.up.isDown || this.cursors.down.isDown;
    return touching || keyboard;
  }

  /**
   * Handle run regeneration (R key) for quick restarts.
   */
  private handleRunRegeneration(): void {
    if (Phaser.Input.Keyboard.JustDown(this.regenerateKey)) {
      // Clear current enemies & totems
      this.combatSystem.clearEnemies();
      this.totemSystem.reset();

      // Reset essence & player state
      this.essenceSystem.reset();
      this.combatSystem.resetPlayer();
      this.playerSpeed = 2;
      this.player.setAlpha(1);

      // Regenerate run & load first room
      this.roomSystem.regenerateRun();
      this.loadCurrentRoom();

      // Feedback
      GameHUDStore.resetRun();
      GameHUDStore.setStatus('New run generated!');
      this.time.delayedCall(2000, () => {
        this.updateRoomStatus();
      });
    }
  }
}
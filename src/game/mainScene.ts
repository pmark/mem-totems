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
  
  // UI elements
  private essenceText!: Phaser.GameObjects.Text;
  private healthText!: Phaser.GameObjects.Text;
  private roomText!: Phaser.GameObjects.Text;
  private interactionPrompt!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;

  constructor() {
    super('MainScene');
  }

  create() {
    console.log('MainScene ready');

    // Initialize systems
    this.tilemapSystem = new TilemapSystem(this, 32);
    this.totemSystem = new TotemSystem(this);
    this.essenceSystem = new EssenceSystem(99);
    this.combatSystem = new CombatSystem(this);
    this.roomSystem = new RoomSystem(this);
    
    // Set up system event handlers
    this.totemSystem.onMatch = (element: ElementType) => this.handleTotemMatch(element);
    this.totemSystem.onMismatch = () => this.handleTotemMismatch();
    this.essenceSystem.onEssenceChanged = (essence) => this.updateEssenceUI(essence);
    this.combatSystem.onPlayerDamaged = (health, maxHealth) => this.updateHealthUI(health, maxHealth);
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

      // Create UI elements
      this.setupUI();

      // Load first room (after UI is ready so UI updates are safe)
      this.loadCurrentRoom();

    // Set up keyboard controls
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.attackKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  this.regenerateKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    // Create UI elements
    this.setupUI();

    // Load first room (after UI is ready so UI updates are safe)
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
    
    // Update room UI
    if (this.roomText) {
      this.roomText.setText(this.roomSystem.getRoomTypeDescription());
    }
    
    // Special handling for rest room
    if (this.roomSystem.isRestRoom()) {
      if (this.statusText) this.statusText.setText('Rest Room - Move to portal when ready');
      this.roomSystem.markRoomCleared(); // Auto-clear rest room
    } else {
      if (this.statusText) this.updateRoomStatus();
    }

    console.info('Room loaded', { index: roomIndex, type: room.type, totems: this.totemSystem.getRemainingCount(), enemies: this.combatSystem.getEnemyCount() });
  }

  /**
   * Check for room transition
   */
  private handleRoomTransitionCheck(): void {
    if (this.roomSystem.canTransition(this.player.x, this.player.y)) {
      this.interactionPrompt.setText('SPACE to enter portal');
      this.interactionPrompt.setVisible(true);
      
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.roomSystem.transitionToNextRoom();
      }
    } else if (!this.totemSystem.findNearestTotem(this.player.x, this.player.y, 40)) {
      this.interactionPrompt.setVisible(false);
    }
  }

  /**
   * Handle room cleared event
   */
  private handleRoomCleared(): void {
    this.statusText.setText('Room cleared! Portal opened.');
    this.statusText.setColor('#00ffff');
    
    this.time.delayedCall(2000, () => {
      this.statusText.setColor('#aaaaaa');
      this.statusText.setText('Enter the portal to continue');
    });
  }

  /**
   * Handle room transition
   */
  private handleRoomTransition(index: number): void {
    console.log(`Transitioning to room ${index + 1}`);
    
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
      onComplete: () => flash.destroy()
    });
  }

  /**
   * Handle run complete
   */
  private handleRunComplete(): void {
    this.statusText.setText('Victory! You completed the run!');
    this.statusText.setColor('#ffff00');
    this.playerSpeed = 0;
  }

  /**
   * Update room status text
   */
  private updateRoomStatus(): void {
    const totems = this.totemSystem.getRemainingCount();
    const enemies = this.combatSystem.getEnemyCount();
    
    if (totems > 0) {
      this.statusText.setText(`${totems} totems remaining - Press SPACE to activate`);
    } else if (enemies > 0) {
      this.statusText.setText(`${enemies} enemies remaining - Press A to attack`);
    } else {
      this.statusText.setText('Press SPACE near totems to activate');
    }
  }

  /**
   * Set up UI elements
   */
  private setupUI(): void {
    // Title
    this.add.text(10, 10, 'Mem-Totems', {
      font: '20px monospace',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setDepth(1000);

    // Essence display
    this.essenceText = this.add.text(10, 40, '', {
      font: '14px monospace',
      color: '#ffffff'
    }).setDepth(1000);
    this.updateEssenceUI(this.essenceSystem.getEssence());

    // Health display
    this.healthText = this.add.text(10, 60, '', {
      font: '14px monospace',
      color: '#ffffff'
    }).setDepth(1000);
    const health = this.combatSystem.getPlayerHealth();
    this.updateHealthUI(health.current, health.max);

    // Interaction prompt
    this.interactionPrompt = this.add.text(160, 270, '', {
      font: '16px monospace',
      color: '#ffff00',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5).setDepth(1000);

    // Status messages
    this.statusText = this.add.text(160, 500, 'Press SPACE near totems to activate', {
      font: '14px monospace',
      color: '#aaaaaa',
      align: 'center'
    }).setOrigin(0.5).setDepth(1000);
  }

  /**
   * Handle combat updates
   */
  private handleCombat(): void {
    // Update combat system
    this.combatSystem.update(this.player.x, this.player.y);

    // Update companion
    this.companion.update(this.player.x, this.player.y);

    // Handle player attack input
    if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
      const didAttack = this.combatSystem.playerAttack(this.player.x, this.player.y);
      if (didAttack) {
        // Attack visual feedback on player
        this.tweens.add({
          targets: this.player,
          scale: { from: 1, to: 1.2 },
          duration: 100,
          yoyo: true
        });
      }
    }
  }

  /**
   * Update health UI
   */
  private updateHealthUI(health: number, maxHealth: number): void {
    this.healthText.setText(`Health: ${health}/${maxHealth}`);
    
    // Change color based on health percentage
    const healthPercent = health / maxHealth;
    if (healthPercent > 0.5) {
      this.healthText.setColor('#00ff00');
    } else if (healthPercent > 0.25) {
      this.healthText.setColor('#ffff00');
    } else {
      this.healthText.setColor('#ff0000');
    }
  }

  /**
   * Handle player death
   */
  private handlePlayerDeath(): void {
    this.statusText.setText('You died! Refresh to restart.');
    this.statusText.setColor('#ff0000');
    
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
    
    this.statusText.setText(`Enemy defeated! +1 ${enemy.element} essence`);
    this.statusText.setColor('#00ff00');
    
    this.time.delayedCall(1500, () => {
      this.statusText.setColor('#aaaaaa');
      const enemyCount = this.combatSystem.getEnemyCount();
      if (enemyCount > 0) {
        this.statusText.setText(`${enemyCount} enemies remaining - Press A to attack`);
      } else {
        this.statusText.setText('Press SPACE near totems to activate');
      }
    });
  }
  private updateEssenceUI(essence: { fire: number; water: number; earth: number; air: number }): void {
    this.essenceText.setText(
      `Essence: 🔥${essence.fire} 💧${essence.water} 🌍${essence.earth} 💨${essence.air}`
    );
  }

  /**
   * Handle totem match event
   */
  private handleTotemMatch(element: ElementType): void {
    this.essenceSystem.addEssence(element, 1);
    
    const remaining = this.totemSystem.getRemainingCount();
    this.statusText.setText(`Match! +1 ${element} essence (${remaining} totems left)`);
    this.statusText.setColor('#00ff00');
    
    // Reset status text color after 2 seconds
    this.time.delayedCall(2000, () => {
      this.statusText.setColor('#aaaaaa');
      this.statusText.setText('Press SPACE near totems to activate');
    });
  }

  /**
   * Handle totem mismatch event
   */
  private handleTotemMismatch(): void {
    this.statusText.setText('Mismatch! Enemy spawned!');
    this.statusText.setColor('#ff0000');
    
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
    
    // Reset status text after 2 seconds
    this.time.delayedCall(2000, () => {
      this.statusText.setColor('#aaaaaa');
      this.statusText.setText('Press A to attack enemies');
    });
  }

  /**
   * Handle totem interaction
   */
  private handleTotemInteraction(): void {
    // Find nearest totem
    const nearestTotem = this.totemSystem.findNearestTotem(this.player.x, this.player.y, 40);
    
    if (nearestTotem) {
      this.interactionPrompt.setText('SPACE to activate');
      this.interactionPrompt.setVisible(true);
      
      // Check for space key press
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !this.totemSystem.isProcessing()) {
        this.totemSystem.activateTotem(nearestTotem);
      }
    } else {
      this.interactionPrompt.setVisible(false);
    }
  }

  private handlePlayerMovement(): void {
    let velocityX = 0;
    let velocityY = 0;

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
      this.statusText.setColor('#ffff00');
      this.statusText.setText('New run generated!');
      this.time.delayedCall(2000, () => {
        this.statusText.setColor('#aaaaaa');
        this.updateRoomStatus();
      });
    }
  }
}
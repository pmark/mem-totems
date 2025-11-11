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
  private useKey!: Phaser.Input.Keyboard.Key;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyShift!: Phaser.Input.Keyboard.Key;
  private attackKey!: Phaser.Input.Keyboard.Key;
  private regenerateKey!: Phaser.Input.Keyboard.Key;
  private player!: Phaser.GameObjects.Arc; // shadow anchor at ground (logical position)
  private playerBody!: Phaser.GameObjects.Arc; // elevated visual body
  private playerElevation: number = 0;
  // Movement state
  private vel = { x: 0, y: 0 };
  private accel = 0.18; // acceleration per frame
  private damping = 0.85; // friction
  private maxSpeed = 2.4;
  private sprintMultiplier = 1.9;
  private cameraLerp = 0.16;
  private tilemapSystem!: TilemapSystem;
  private totemSystem!: TotemSystem;
  private essenceSystem!: EssenceSystem;
  private combatSystem!: CombatSystem;
  private roomSystem!: RoomSystem;
  private companion!: Companion;
  
  private autoAttackCooldown: number = 650; // ms, Archero-like cadence
  private lastAutoAttackTime: number = 0;
  // Debounce per-totem auto-activation to avoid rapid re-trigger after mismatch
  private totemActivationCooldown = new WeakMap<Totem, number>();
  private totemAutoActivateDelayMs = 800;
  private isPanning = false;
  private lastPanPointer?: Phaser.Input.Pointer;
  private jumping = false;
  
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
  this.useKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  // WASD keys and sprint
  this.keyW = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  this.keyA = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  this.keyS = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  this.keyD = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  this.keyShift = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
      this.attackKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.regenerateKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    // Gamepad connect
    this.input.gamepad?.once('connected', (pad: Phaser.Input.Gamepad.Gamepad) => {
      console.info('Gamepad connected', pad.id);
    });

    // Load first room (React HUD will reflect state via store)
    this.loadCurrentRoom();

    // Refit camera on resize/orientation changes
    this.scale.on('resize', () => {
      try {
        const room = this.roomSystem.getCurrentRoom?.();
        if (room?.mapData) {
          this.fitCameraToMap(room.mapData);
        }
      } catch (_) {
        // ignore transient errors during scene transitions
      }
    });

    // Pointer pan (right-click or two-finger drag) to temporarily pan camera
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (p.rightButtonDown()) {
        this.isPanning = true;
        this.lastPanPointer = p;
        this.cameras.main.stopFollow();
      }
    });

    this.input.on('pointerup', () => {
      if (this.isPanning) {
        this.isPanning = false;
        // resume follow
        this.cameras.main.startFollow(this.player, true, this.cameraLerp, this.cameraLerp);
      }
    });

    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (!this.isPanning || !this.lastPanPointer) return;
      const cam = this.cameras.main;
      const dx = p.x - this.lastPanPointer.x;
      const dy = p.y - this.lastPanPointer.y;
      const zoom = cam.zoom || 1;
      cam.scrollX -= dx / zoom;
      cam.scrollY -= dy / zoom;
      this.lastPanPointer = p;
    });

    // Listen for UI-driven restart events (for mobile modal)
    const restartHandler = () => {
      console.log('[MainScene] Received restart-run event, calling regenerateRun()');
      this.regenerateRun();
    };
    window.addEventListener('memTotems:restart-run', restartHandler as EventListener);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener('memTotems:restart-run', restartHandler as EventListener);
    });
  }

  update() {
    this.handlePlayerMovement();
    this.handleTotemInteraction();
    this.handleCombat();
    // Update special cooldown HUD hint each frame (cheap calc)
    const cd = this.combatSystem.getSpecialCooldownRemaining(this.time.now);
    GameHUDStore.setSpecialCooldown(cd);
    this.handleRoomTransitionCheck();
    this.handleRunRegeneration();
  }

  /**
   * Load the current room from RoomSystem
   */
  private loadCurrentRoom(): void {
    const roomIndex = this.roomSystem.getCurrentRoomIndex();
    const room = this.roomSystem.getCurrentRoom();
    console.info('Loading room', { index: roomIndex, type: room.type, theme: room.theme });
    
    // Load tilemap with theme
    this.tilemapSystem.loadMap(room.mapData, room.theme);

  // Fit and center the board to the viewport via camera zoom + scroll
  this.fitCameraToMap(room.mapData);
    
    // Create/reset player
    if (!this.player) {
      // Shadow (logical anchor)
      this.player = this.add.circle(room.playerStart.x, room.playerStart.y, 10, 0x000000, 0.35);
      this.player.setDepth(11);
      this.player.setScale(1.0);
      // Body (visual)
      this.playerBody = this.add.circle(room.playerStart.x, room.playerStart.y, 10, 0xffcc00, 1);
      this.playerBody.setDepth(12);
      // Make camera follow the player smoothly
      const cam = this.cameras.main;
      cam.startFollow(this.player, true, this.cameraLerp, this.cameraLerp);
    } else {
      this.player.setPosition(room.playerStart.x, room.playerStart.y);
      this.player.setDepth(11);
      if (this.playerBody) {
        this.playerBody.setPosition(room.playerStart.x, room.playerStart.y - this.playerElevation);
        this.playerBody.setDepth(12);
      }
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
   * Adjust camera zoom and scroll so the tilemap fills the screen and is centered
   */
  private fitCameraToMap(mapData: number[][]): void {
    const cols = mapData[0]?.length ?? 0;
    const rows = mapData.length;
    const tile = this.tilemapSystem.getTileSize();
    const worldW = cols * tile;
    const worldH = rows * tile;
    const viewW = this.scale.width;
    const viewH = this.scale.height;

    if (worldW === 0 || worldH === 0) return;

    const zoom = Math.min(viewW / worldW, viewH / worldH);
    const cam = this.cameras.main;
    cam.setZoom(zoom);
    // Constrain camera to world and center on map center
    cam.setBounds(0, 0, worldW, worldH);
    cam.centerOn(worldW / 2, worldH / 2);
    cam.setRoundPixels(true);
  }

  /**
   * Check for room transition
   */
  private handleRoomTransitionCheck(): void {
    if (this.roomSystem.canTransition(this.player.x, this.player.y)) {
      GameHUDStore.setPrompt('Press E or SPACE to enter portal');
      const interact = Phaser.Input.Keyboard.JustDown(this.spaceKey) || Phaser.Input.Keyboard.JustDown(this.useKey) || TouchController.consumeUse();
      if (interact) {
        this.roomSystem.transitionToNextRoom();
      }
    } else {
      // No portal nearby, clear any existing prompt
      GameHUDStore.setPrompt(null);
    }
  }

  /**
   * Handle room cleared event
   */
  private handleRoomCleared(): void {
    GameHUDStore.setStatus('🎊 Room Cleared! You matched all totems and defeated all enemies!');
    GameHUDStore.setPrompt('🌀 A cyan portal has appeared - Move close and press E or SPACE to continue');
    
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
    this.maxSpeed = 0;
  }

  /**
   * Update room status text
   */
  private updateRoomStatus(): void {
    const totems = this.totemSystem.getRemainingCount();
    const enemies = this.combatSystem.getEnemyCount();
    
    if (totems > 0) {
      GameHUDStore.setStatus(`${totems} totems remaining - Move close to auto-activate`);
    } else if (enemies > 0) {
      GameHUDStore.setStatus(`${enemies} enemies remaining - Press A to attack`);
    } else {
      GameHUDStore.setStatus('Move close to totems to activate them');
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
        this.tweens.add({ targets: this.playerBody, scale: { from: 1, to: 1.2 }, duration: 100, yoyo: true });
      }
    }

    // Keep manual attack available on keyboard for desktop
    if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
      const didAttack = this.combatSystem.playerAttack(this.player.x, this.player.y);
      if (didAttack) {
        this.tweens.add({ targets: this.playerBody, scale: { from: 1, to: 1.2 }, duration: 100, yoyo: true });
      }
    }

    // Special attack (keyboard X key or touch special button)
    const specialKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    if (Phaser.Input.Keyboard.JustDown(specialKey) || TouchController.consumeSpecial()) {
      const didSpecial = this.combatSystem.playerSpecial(this.player.x, this.player.y);
      if (didSpecial) {
        // Visual effect: expanding ring
        const ring = this.add.circle(this.player.x, this.player.y, 8, 0x66ccff, 0.4);
        ring.setDepth(50);
        this.tweens.add({
          targets: ring,
          scale: { from: 1, to: 4 },
          alpha: { from: 0.4, to: 0 },
          duration: 400,
          ease: 'Cubic.easeOut',
          onComplete: () => ring.destroy()
        });
        this.tweens.add({ targets: this.playerBody, scale: { from: 1, to: 1.3 }, duration: 140, yoyo: true });
        GameHUDStore.setStatus('🌊 Special attack unleashed!');
      } else {
        GameHUDStore.setStatus('Special attack recharging...');
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
    this.maxSpeed = 0;
    
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
      GameHUDStore.setPrompt('✨ Portal opened! Press E or SPACE to advance');
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
        GameHUDStore.setStatus(`⚠️ A wild ${randomElement} spirit appeared! Press A to attack or dodge.`);
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
    // Auto-activate nearest totem on proximity (collision-based interaction)
    const nearestTotem = this.totemSystem.findNearestTotem(this.player.x, this.player.y, 38); // slightly tighter radius
    if (nearestTotem && !this.totemSystem.isProcessing()) {
      const now = this.time.now;
      const last = this.totemActivationCooldown.get(nearestTotem) || 0;
      if (now - last < this.totemAutoActivateDelayMs) {
        return; // still cooling down
      }
      // Prompt no longer needed for totems; activation is automatic
      this.totemSystem.activateTotem(nearestTotem);
      this.totemActivationCooldown.set(nearestTotem, now);
    }
    // Any prompt management now handled exclusively by portal logic
  }

  private handlePlayerMovement(): void {
    // Gather input: touch joystick, gamepad left stick, WASD/arrow keys
    let inX = 0;
    let inY = 0;

    // Touch movement
    const tv = TouchController.get();
    if (tv.active && tv.mag > 0.05) {
      inX += tv.x * tv.mag;
      inY += tv.y * tv.mag;
    }

    // Gamepad left stick
    const pad = this.input.gamepad?.getPad(0);
    if (pad) {
      const lx = pad.axes.length > 0 ? pad.axes[0].getValue() : 0;
      const ly = pad.axes.length > 1 ? pad.axes[1].getValue() : 0;
      if (Math.abs(lx) > 0.08 || Math.abs(ly) > 0.08) {
        inX += lx;
        inY += ly;
      }
      // right stick camera panning
      const rx = pad.axes.length > 2 ? pad.axes[2].getValue() : 0;
      const ry = pad.axes.length > 3 ? pad.axes[3].getValue() : 0;
      if (Math.abs(rx) > 0.12 || Math.abs(ry) > 0.12) {
        const cam = this.cameras.main;
        cam.scrollX += -rx * 8;
        cam.scrollY += -ry * 8;
        // temporarily stop follow while pushing camera manually
        if (!this.isPanning) {
          this.cameras.main.stopFollow();
          this.isPanning = true;
          this.time.delayedCall(300, () => {
            this.isPanning = false;
            this.cameras.main.startFollow(this.player, true, this.cameraLerp, this.cameraLerp);
          });
        }
      }
    }

    // Keyboard (WASD + arrows)
    if (this.keyW.isDown || this.cursors.up.isDown) inY -= 1;
    if (this.keyS.isDown || this.cursors.down.isDown) inY += 1;
    if (this.keyA.isDown || this.cursors.left.isDown) inX -= 1;
    if (this.keyD.isDown || this.cursors.right.isDown) inX += 1;

    // Normalize combined input
    const len = Math.hypot(inX, inY);
    let dirX = 0, dirY = 0;
    if (len > 0.001) {
      dirX = inX / len;
      dirY = inY / len;
    }

    // Sprint
    const sprint = this.keyShift.isDown || TouchController.isSprinting();
    const targetSpeed = this.maxSpeed * (sprint ? this.sprintMultiplier : 1);

    // Smooth acceleration toward target velocity
    this.vel.x += (dirX * targetSpeed - this.vel.x) * this.accel;
    this.vel.y += (dirY * targetSpeed - this.vel.y) * this.accel;

    // Apply damping when no input
    if (len < 0.05) {
      this.vel.x *= this.damping;
      this.vel.y *= this.damping;
      if (Math.abs(this.vel.x) < 0.01) this.vel.x = 0;
      if (Math.abs(this.vel.y) < 0.01) this.vel.y = 0;
    }

    // If velocity is negligible, skip movement
    const speed = Math.hypot(this.vel.x, this.vel.y);
    if (speed < 0.001) return;

    // Collision-aware movement using previous corner test logic
    const radius = 10;
    const canAt = (px: number, py: number) => {
      const corners = [
        { x: px - radius, y: py - radius },
        { x: px + radius, y: py - radius },
        { x: px - radius, y: py + radius },
        { x: px + radius, y: py + radius },
      ];
      return corners.every(c => {
        if (this.tilemapSystem.isWall(c.x, c.y)) return false;
        if (this.tilemapSystem.isPit(c.x, c.y)) return this.jumping; // allow pits only while jumping
        if (this.tilemapSystem.isJumpable(c.x, c.y)) return this.jumping; // allow low obstacles only while jumping
        return this.tilemapSystem.isWalkable(c.x, c.y);
      });
    };

    const startX = this.player.x;
    const startY = this.player.y;
    const fullX = startX + this.vel.x;
    const fullY = startY + this.vel.y;

    if (canAt(fullX, fullY)) {
      this.player.x = fullX;
      this.player.y = fullY;
    } else {
      // axis fallback
      let moved = false;
      if (this.vel.x !== 0 && canAt(startX + this.vel.x, startY)) {
        this.player.x = startX + this.vel.x;
        moved = true;
      }
      if (this.vel.y !== 0 && canAt(this.player.x, startY + this.vel.y)) {
        this.player.y = startY + this.vel.y;
        moved = true;
      }
      if (!moved) {
        // small slide
        const slideAmount = 0.6;
        if (this.vel.x !== 0) {
          const sx = startX + Math.sign(this.vel.x) * slideAmount;
          if (canAt(sx, startY)) this.player.x = sx;
        }
        if (this.vel.y !== 0) {
          const sy = startY + Math.sign(this.vel.y) * slideAmount;
          if (canAt(this.player.x, sy)) this.player.y = sy;
        }
      }
    }

    // Jump handling (visual hop without moving logical position)
    const jumped = Phaser.Input.Keyboard.JustDown(this.spaceKey) || TouchController.consumeJump() || (pad && pad.buttons.length > 0 && pad.buttons[0].pressed);
    if (jumped && !this.jumping) {
      this.startJump();
    }

    // Pit crossing logic: allow movement over pits only while jumping animation active
    if (!this.jumping && this.tilemapSystem.isPit(this.player.x, this.player.y)) {
      // fell into pit -> small penalty: move player back to start & take minor damage
      const room = this.roomSystem.getCurrentRoom();
      this.tweens.add({
        targets: this.player,
        alpha: { from: 1, to: 0 },
        duration: 180,
        yoyo: true,
        onYoyo: () => {
          this.player.setPosition(room.playerStart.x, room.playerStart.y);
          if (this.playerBody) this.playerBody.setPosition(room.playerStart.x, room.playerStart.y - this.playerElevation);
          GameHUDStore.setStatus('🕳️ You stumbled into a pit! Jump (Space/⬆️) to cross.');
          this.combatSystem.playerTakeEnvironmentalDamage(8);
        }
      });
    }

    // Sync body and shadow visuals each frame
    if (this.playerBody) {
      this.playerBody.x = this.player.x;
      this.playerBody.y = this.player.y - this.playerElevation;
    }
  }

  private isPlayerMoving(): boolean {
    const tv = TouchController.get();
    const touching = tv.active && tv.mag > 0.05;
    const keyboard = this.keyW.isDown || this.keyA.isDown || this.keyS.isDown || this.keyD.isDown || this.cursors.left.isDown || this.cursors.right.isDown || this.cursors.up.isDown || this.cursors.down.isDown;
    const pad = this.input.gamepad?.getPad(0);
    const padMoving = !!pad && pad.axes.some(a => Math.abs(a.getValue()) > 0.08);
    const velMoving = Math.hypot(this.vel.x, this.vel.y) > 0.02;
    return touching || keyboard || padMoving || velMoving;
  }

  /**
   * Handle run regeneration (R key) for quick restarts.
   */
  private handleRunRegeneration(): void {
    if (Phaser.Input.Keyboard.JustDown(this.regenerateKey)) {
      this.regenerateRun();
    }
  }

  /** Public regeneration routine that can be triggered by UI */
  private regenerateRun(): void {
    // Clear current enemies & totems
    this.combatSystem.clearEnemies();
    this.totemSystem.reset();

    // Reset essence & player state
    this.essenceSystem.reset();
    this.combatSystem.resetPlayer();
    this.maxSpeed = 2.4;
    this.vel.x = 0; this.vel.y = 0;
    this.player.setAlpha(1);
    this.playerElevation = 0;
    if (this.playerBody) {
      this.playerBody.setAlpha(1);
      this.playerBody.setPosition(this.player.x, this.player.y);
      this.playerBody.setScale(1);
    }

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

  /** Start a simple jump animation: body elevates while shadow stays, affects traversal gating */
  private startJump(height: number = 14, upMs: number = 160, downMs: number = 180) {
    this.jumping = true;
    // Up phase
    this.tweens.add({
      targets: this,
      playerElevation: { from: 0, to: height },
      duration: upMs,
      ease: 'Sine.easeOut',
      onUpdate: () => this.updateJumpVisuals(height),
      onComplete: () => {
        // Down phase
        this.tweens.add({
          targets: this,
          playerElevation: { from: height, to: 0 },
          duration: downMs,
          ease: 'Sine.easeIn',
          onUpdate: () => this.updateJumpVisuals(height),
          onComplete: () => {
            this.jumping = false;
            this.updateJumpVisuals(height);
          }
        });
      }
    });
  }

  /** Update shadow scale/alpha based on elevation */
  private updateJumpVisuals(maxHeight: number) {
    const t = Phaser.Math.Clamp(this.playerElevation / maxHeight, 0, 1);
    // Shadow: smaller and lighter at peak
    const shadowScale = 1 - 0.15 * t;
    const shadowAlpha = 0.35 - 0.15 * t;
    this.player.setScale(shadowScale);
    this.player.setAlpha(shadowAlpha);
    // Body synced in update() positioning; maintain base scale 1
    if (this.playerBody && this.playerBody.scale < 0.98) {
      this.playerBody.setScale(1);
    }
  }
}
import Phaser from 'phaser';
import { RoomTemplates } from '../data/RoomTemplates';
import type { RoomTemplate } from '../data/RoomTemplates';

export interface RunConfiguration {
  totalRooms: number;
  restRoomIndex: number;
  bossRoomIndex: number;
}

/**
 * Manages procedural room generation, room transitions, and run progression
 */
export class RoomSystem {
  private scene: Phaser.Scene;
  private currentRoomIndex: number = 0;
  private rooms: RoomTemplate[] = [];
  private runConfig: RunConfiguration;
  private exitPortal: Phaser.GameObjects.Container | Phaser.GameObjects.Arc | null = null;
  private isRoomCleared: boolean = false;

  // Event callbacks
  public onRoomCleared?: () => void;
  public onRoomTransition?: (newRoomIndex: number, room: RoomTemplate) => void;
  public onRunComplete?: () => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.runConfig = this.generateRunConfiguration();
    this.generateRooms();
  }

  /**
   * Regenerate the entire run (new configuration + rooms) and reset progression.
   * Useful for quick iteration / starting a fresh attempt without page reload.
   */
  regenerateRun(): void {
    // Destroy any existing portal
    if (this.exitPortal) {
      this.exitPortal.destroy();
      this.exitPortal = null;
    }

    // New configuration + rooms
    this.runConfig = this.generateRunConfiguration();
    this.generateRooms();

    // Reset progression state
    this.currentRoomIndex = 0;
    this.isRoomCleared = false;

    // Do not emit transition here; caller should load the first room explicitly
  }

  /**
   * Generate run configuration (6-8 rooms with special rooms)
   */
  private generateRunConfiguration(): RunConfiguration {
    const totalRooms = 6 + Math.floor(Math.random() * 3); // 6-8 rooms
    const restRoomIndex = 2 + Math.floor(Math.random() * 2); // Rest room at index 2-3
    const bossRoomIndex = totalRooms - 1; // Boss is always last

    return {
      totalRooms,
      restRoomIndex,
      bossRoomIndex,
    };
  }

  /**
   * Generate all rooms for the run
   */
  private generateRooms(): void {
    this.rooms = [];

    for (let i = 0; i < this.runConfig.totalRooms; i++) {
      let room: RoomTemplate;

      if (i === this.runConfig.restRoomIndex) {
        room = RoomTemplates.restRoom();
      } else if (i === this.runConfig.bossRoomIndex) {
        room = RoomTemplates.bossRoom();
      } else {
        room = RoomTemplates.getRandomNormalRoom();
        // Ensure totem pairs by adjusting elements
        room = this.ensureTotemPairs(room);
      }

      this.rooms.push(room);
    }

    console.log(`Generated run with ${this.runConfig.totalRooms} rooms`);
  }

  /**
   * Ensure room has at least one matching totem pair
   */
  private ensureTotemPairs(room: RoomTemplate): RoomTemplate {
    if (room.totemSpawns.length < 2) return room;

    // Group totems by element
    const elementCounts: Record<string, number> = {};
    for (const spawn of room.totemSpawns) {
      elementCounts[spawn.element] = (elementCounts[spawn.element] || 0) + 1;
    }

    // Check if at least one element has a pair
    const hasPair = Object.values(elementCounts).some(count => count >= 2);

    if (!hasPair && room.totemSpawns.length >= 2) {
      // Force first two totems to match
      const firstElement = room.totemSpawns[0].element;
      room.totemSpawns[1].element = firstElement;
    }

    return room;
  }

  /**
   * Get current room
   */
  getCurrentRoom(): RoomTemplate {
    return this.rooms[this.currentRoomIndex];
  }

  /**
   * Get current room index
   */
  getCurrentRoomIndex(): number {
    return this.currentRoomIndex;
  }

  /**
   * Get total number of rooms
   */
  getTotalRooms(): number {
    return this.runConfig.totalRooms;
  }

  /**
   * Check if current room is a special type
   */
  isRestRoom(): boolean {
    return this.currentRoomIndex === this.runConfig.restRoomIndex;
  }

  isBossRoom(): boolean {
    return this.currentRoomIndex === this.runConfig.bossRoomIndex;
  }

  /**
   * Mark room as cleared (all totems matched or enemies defeated)
   */
  markRoomCleared(): void {
    if (this.isRoomCleared) return;

    this.isRoomCleared = true;
    this.showExitPortal();

    if (this.onRoomCleared) {
      this.onRoomCleared();
    }
  }

  /**
   * Show exit portal
   */
  private showExitPortal(): void {
    const room = this.getCurrentRoom();
    
    // Build a much more visible portal as a container with glow, rings, and orbs
    const container = this.scene.add.container(room.exitPortal.x, room.exitPortal.y);
    container.setDepth(11); // Above totems/enemies, below player (12)

    // Core bright circle
    const core = this.scene.add.circle(0, 0, 16, 0x00ffff, 0.95);
    // Glowing rings
    const ring1 = this.scene.add.circle(0, 0, 26, 0x00ffff, 0.18);
    const ring2 = this.scene.add.circle(0, 0, 36, 0x00ffff, 0.10);
    // Orbiting orbs (add at offset so rotating container makes them orbit)
    const orb1 = this.scene.add.circle(28, 0, 4, 0xffffff, 0.9);
    const orb2 = this.scene.add.circle(-28, 0, 4, 0x00ffff, 0.9);
    // Label for clarity
    const label = this.scene.add.text(0, -42, 'PORTAL', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#00ffff'
    }).setOrigin(0.5, 1);

    container.add([ring2, ring1, core, orb1, orb2, label]);

    // Shimmer on core
    this.scene.tweens.add({
      targets: core,
      scale: { from: 1, to: 1.25 },
      alpha: { from: 0.95, to: 0.75 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    // Pulse rings
    this.scene.tweens.add({
      targets: [ring1, ring2],
      alpha: { from: 0.22, to: 0.08 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    // Rotate container to make orbs orbit
    this.scene.tweens.add({
      targets: container,
      angle: 360,
      duration: 4000,
      repeat: -1,
      ease: 'Linear'
    });
    // Bob label
    this.scene.tweens.add({
      targets: label,
      y: '-=6',
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.exitPortal = container;
  }

  /**
   * Check if player is near exit portal
   */
  canTransition(playerX: number, playerY: number): boolean {
    if (!this.isRoomCleared || !this.exitPortal) return false;

    const dx = this.exitPortal.x - playerX;
    const dy = this.exitPortal.y - playerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance <= 30;
  }

  /**
   * Transition to next room
   */
  transitionToNextRoom(): boolean {
    if (!this.isRoomCleared) return false;

    // Check if run is complete
    if (this.currentRoomIndex >= this.runConfig.totalRooms - 1) {
      if (this.onRunComplete) {
        this.onRunComplete();
      }
      return false;
    }

    // Move to next room
    this.currentRoomIndex++;
    this.isRoomCleared = false;

    // Destroy exit portal
    if (this.exitPortal) {
      this.exitPortal.destroy();
      this.exitPortal = null;
    }

    const newRoom = this.getCurrentRoom();
    if (this.onRoomTransition) {
      this.onRoomTransition(this.currentRoomIndex, newRoom);
    }

    return true;
  }

  /**
   * Reset room cleared state (for debugging)
   */
  reset(): void {
    this.isRoomCleared = false;
    if (this.exitPortal) {
      this.exitPortal.destroy();
      this.exitPortal = null;
    }
  }

  /**
   * Get room type description for UI
   */
  getRoomTypeDescription(): string {
    const room = this.getCurrentRoom();
    switch (room.type) {
      case 'rest':
        return 'Rest Room - Safe Zone';
      case 'boss':
        return 'Boss Room - Final Challenge!';
      default:
        return `Room ${this.currentRoomIndex + 1}/${this.runConfig.totalRooms}`;
    }
  }
}

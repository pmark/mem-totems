import Phaser from 'phaser';
import { Totem } from '../entities/Totem';
import type { ElementType } from '../entities/Totem';

export interface TotemMatchResult {
  matched: boolean;
  element?: ElementType;
}

/**
 * Manages totem activation, matching logic, and pair resolution.
 * Tracks which totems have been activated and determines match/mismatch outcomes.
 */
export class TotemSystem {
  private scene: Phaser.Scene;
  private totems: Totem[] = [];
  private activatedTotems: Totem[] = [];
  private isProcessingMatch: boolean = false;

  // Event callbacks
  public onMatch?: (element: ElementType) => void;
  public onMismatch?: () => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Add a totem to the system
   */
  addTotem(totem: Totem): void {
    this.totems.push(totem);
  }

  /**
   * Get all totems in the system
   */
  getTotems(): readonly Totem[] {
    return this.totems;
  }

  /**
   * Find the nearest unactivated totem to a position
   */
  findNearestTotem(x: number, y: number, maxDistance: number = 40): Totem | null {
    let nearest: Totem | null = null;
    let minDistance = maxDistance;

    for (const totem of this.totems) {
      if (totem.isActivated) continue;

      const pos = totem.getPosition();
      const dx = pos.x - x;
      const dy = pos.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < minDistance) {
        minDistance = distance;
        nearest = totem;
      }
    }

    return nearest;
  }

  /**
   * Activate a totem and check for matches
   */
  async activateTotem(totem: Totem): Promise<TotemMatchResult> {
    if (totem.isActivated || this.isProcessingMatch) {
      return { matched: false };
    }

    // Activate the totem
    totem.activate();
    this.activatedTotems.push(totem);

    // If this is the first totem, wait for the second
    if (this.activatedTotems.length === 1) {
      return { matched: false };
    }

    // We have two activated totems - check for match
    this.isProcessingMatch = true;
    const result = await this.checkMatch();
    this.isProcessingMatch = false;

    return result;
  }

  /**
   * Check if the two activated totems match
   */
  private async checkMatch(): Promise<TotemMatchResult> {
    if (this.activatedTotems.length !== 2) {
      return { matched: false };
    }

    const [first, second] = this.activatedTotems;
    const matched = first.element === second.element;

    // Wait briefly to show both activated totems
    await this.delay(400);

    if (matched) {
      // Match! Remove both totems and trigger callback
      this.totems = this.totems.filter(t => t !== first && t !== second);
      first.destroy();
      second.destroy();
      
      if (this.onMatch) {
        this.onMatch(first.element);
      }

      this.activatedTotems = [];
      return { matched: true, element: first.element };
    } else {
      // Mismatch - deactivate both totems
      first.deactivate();
      second.deactivate();
      
      if (this.onMismatch) {
        this.onMismatch();
      }

      this.activatedTotems = [];
      return { matched: false };
    }
  }

  /**
   * Reset all activated totems (for error recovery)
   */
  reset(): void {
    for (const totem of this.activatedTotems) {
      totem.deactivate();
    }
    this.activatedTotems = [];
    this.isProcessingMatch = false;
  }

  /**
   * Get count of remaining totems
   */
  getRemainingCount(): number {
    return this.totems.length;
  }

  /**
   * Check if currently processing a match
   */
  isProcessing(): boolean {
    return this.isProcessingMatch;
  }

  /**
   * Helper to create a delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => {
      this.scene.time.delayedCall(ms, resolve);
    });
  }
}

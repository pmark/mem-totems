import type { ElementType } from '../entities/Totem';

export interface EssenceCount {
  fire: number;
  water: number;
  earth: number;
  air: number;
}

/**
 * Manages essence collection and tracking per element type.
 * Handles essence caps and provides methods to query current essence levels.
 */
export class EssenceSystem {
  private essence: EssenceCount = {
    fire: 0,
    water: 0,
    earth: 0,
    air: 0,
  };

  private maxEssence: number;

  // Event callback for essence changes
  public onEssenceChanged?: (essence: EssenceCount) => void;

  constructor(maxEssence: number = 99) {
    this.maxEssence = maxEssence;
  }

  /**
   * Add essence of a specific element type
   */
  addEssence(element: ElementType, amount: number = 1): boolean {
    const currentAmount = this.essence[element];
    
    if (currentAmount >= this.maxEssence) {
      return false; // Already at cap
    }

    this.essence[element] = Math.min(currentAmount + amount, this.maxEssence);
    
    if (this.onEssenceChanged) {
      this.onEssenceChanged(this.getEssence());
    }

    return true;
  }

  /**
   * Spend essence of a specific element type
   */
  spendEssence(element: ElementType, amount: number): boolean {
    if (this.essence[element] < amount) {
      return false; // Not enough essence
    }

    this.essence[element] -= amount;
    
    if (this.onEssenceChanged) {
      this.onEssenceChanged(this.getEssence());
    }

    return true;
  }

  /**
   * Get current essence for a specific element
   */
  getElementEssence(element: ElementType): number {
    return this.essence[element];
  }

  /**
   * Get all essence counts (returns a copy)
   */
  getEssence(): EssenceCount {
    return { ...this.essence };
  }

  /**
   * Get total essence across all elements
   */
  getTotalEssence(): number {
    return this.essence.fire + this.essence.water + this.essence.earth + this.essence.air;
  }

  /**
   * Get maximum essence cap
   */
  getMaxEssence(): number {
    return this.maxEssence;
  }

  /**
   * Check if an element is at max capacity
   */
  isAtCap(element: ElementType): boolean {
    return this.essence[element] >= this.maxEssence;
  }

  /**
   * Reset all essence to zero
   */
  reset(): void {
    this.essence = {
      fire: 0,
      water: 0,
      earth: 0,
      air: 0,
    };
    
    if (this.onEssenceChanged) {
      this.onEssenceChanged(this.getEssence());
    }
  }
}

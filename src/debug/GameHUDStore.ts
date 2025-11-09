export interface HUDState {
  essence: { fire: number; water: number; earth: number; air: number };
  health: { current: number; max: number };
  room: { index: number; total: number; type: string; description: string };
  status: string;
  prompt: string | null;
  victory: boolean;
  dead: boolean;
  banner: string | null; // Large, temporary overlay banner (e.g., HUD ACTIVE)
}

const defaultState: HUDState = {
  essence: { fire: 0, water: 0, earth: 0, air: 0 },
  health: { current: 100, max: 100 },
  room: { index: 0, total: 0, type: 'unknown', description: '' },
  status: '',
  prompt: null,
  victory: false,
  dead: false,
  banner: null,
};

export type HUDSubscriber = (state: HUDState) => void;

class GameHUDStoreImpl {
  private state: HUDState = { ...defaultState };
  private subs: Set<HUDSubscriber> = new Set();

  subscribe(fn: HUDSubscriber): () => void {
    this.subs.add(fn);
    fn(this.get());
    return () => this.subs.delete(fn);
  }

  get(): HUDState { return this.state; }

  private emit() {
    // Always provide a new object identity so React subscribers re-render
    const snapshot: HUDState = {
      ...this.state,
      essence: { ...this.state.essence },
      health: { ...this.state.health },
      room: { ...this.state.room },
    };
    for (const fn of this.subs) fn(snapshot);
  }

  patch(partial: Partial<HUDState>) {
    this.state = { ...this.state, ...partial };
    this.emit();
  }

  setEssence(essence: HUDState['essence']) {
    this.state = { ...this.state, essence: { ...essence } }; this.emit();
  }
  setHealth(health: HUDState['health']) {
    this.state = { ...this.state, health: { ...health } }; this.emit();
  }
  setRoom(room: HUDState['room']) {
    this.state = { ...this.state, room: { ...room } }; this.emit();
  }
  setStatus(status: string) {
    this.state = { ...this.state, status }; this.emit();
  }
  setPrompt(prompt: string | null) {
    this.state = { ...this.state, prompt }; this.emit();
  }
  setVictory() { this.state = { ...this.state, victory: true }; this.emit(); }
  setDead() { this.state = { ...this.state, dead: true }; this.emit(); }
  setBanner(text: string) { this.state = { ...this.state, banner: text }; this.emit(); }
  clearBanner() { this.state = { ...this.state, banner: null }; this.emit(); }
  resetRun() {
    this.state = { ...this.state, victory: false, dead: false, status: '', prompt: null, banner: null };
    this.emit();
  }
}

export const GameHUDStore = new GameHUDStoreImpl();

export type TouchVector = { x: number; y: number; mag: number; active: boolean };

type Subscriber = (vec: TouchVector) => void;

class TouchControllerImpl {
  private vec: TouchVector = { x: 0, y: 0, mag: 0, active: false };
  private subs = new Set<Subscriber>();
  private interactRequested = false;

  subscribe(fn: Subscriber) {
    this.subs.add(fn);
    fn(this.vec);
    return () => this.subs.delete(fn);
  }

  get(): TouchVector { return this.vec; }

  setVector(nx: number, ny: number, mag: number, active: boolean) {
    this.vec = { x: nx, y: ny, mag, active };
    for (const fn of this.subs) fn(this.vec);
  }

  clear() { this.setVector(0, 0, 0, false); }

  requestInteract() { this.interactRequested = true; }
  consumeInteract(): boolean {
    const was = this.interactRequested;
    this.interactRequested = false;
    return was;
  }
}

export const TouchController = new TouchControllerImpl();

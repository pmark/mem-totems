export type TouchVector = { x: number; y: number; mag: number; active: boolean };
export type LookVector = { x: number; y: number; mag: number; active: boolean };

type MoveSubscriber = (vec: TouchVector) => void;
type LookSubscriber = (vec: LookVector) => void;

class TouchControllerImpl {
  // Movement joystick
  private moveVec: TouchVector = { x: 0, y: 0, mag: 0, active: false };
  private moveSubs = new Set<MoveSubscriber>();

  // Look / camera joystick
  private lookVec: LookVector = { x: 0, y: 0, mag: 0, active: false };
  private lookSubs = new Set<LookSubscriber>();

  // Action requests
  private useRequested = false;
  private jumpRequested = false;
  private specialRequested = false;
  private sprintActive = false;

  // Movement API
  subscribe(fn: MoveSubscriber) {
    this.moveSubs.add(fn);
    fn(this.moveVec);
    return () => this.moveSubs.delete(fn);
  }

  get(): TouchVector { return this.moveVec; }

  setVector(nx: number, ny: number, mag: number, active: boolean) {
    this.moveVec = { x: nx, y: ny, mag, active };
    for (const fn of this.moveSubs) fn(this.moveVec);
  }

  clear() { this.setVector(0, 0, 0, false); }

  // Look API
  subscribeLook(fn: LookSubscriber) {
    this.lookSubs.add(fn);
    fn(this.lookVec);
    return () => this.lookSubs.delete(fn);
  }

  getLook(): LookVector { return this.lookVec; }

  setLook(nx: number, ny: number, mag: number, active: boolean) {
    this.lookVec = { x: nx, y: ny, mag, active };
    for (const fn of this.lookSubs) fn(this.lookVec);
  }

  // Actions
  requestUse() { this.useRequested = true; }
  consumeUse(): boolean {
    const was = this.useRequested;
    this.useRequested = false;
    return was;
  }

  requestJump() { this.jumpRequested = true; }
  consumeJump(): boolean {
    const was = this.jumpRequested;
    this.jumpRequested = false;
    return was;
  }

  requestSpecial() { this.specialRequested = true; }
  consumeSpecial(): boolean {
    const was = this.specialRequested;
    this.specialRequested = false;
    return was;
  }
  setSprint(active: boolean) { this.sprintActive = active; }
  isSprinting(): boolean { return this.sprintActive; }
}

export const TouchController = new TouchControllerImpl();

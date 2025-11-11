import { useEffect, useState } from 'react';
import { GameHUDStore } from '../debug/GameHUDStore';
import './GameHUD.css';

export function GameHUD() {
  const [state, setState] = useState(GameHUDStore.get());
  useEffect(() => GameHUDStore.subscribe(setState), []);

  // Determine clear instructions based on current game state
  const isMobile = ('ontouchstart' in window) || navigator.maxTouchPoints > 0 || window.innerWidth < 860;
  const getInstructions = () => {
    if (state.victory) return isMobile ? 'Tap R (keyboard) to start a new run' : 'Press R to start a new run';
    if (state.dead) return isMobile ? 'Tap R to restart' : 'Press R to restart';
    if (state.prompt) return isMobile ? 'Tap ✨' : 'Press E or SPACE to interact'; // Portal interaction
    if (state.status.includes('enemies remaining')) return isMobile ? 'Stop moving to auto-attack enemies' : 'Press A to attack nearby enemies';
    if (state.status.includes('totems remaining')) return 'Move close to totems to activate';
    if (state.status.includes('cleared')) return isMobile ? 'Move to portal & tap ✨' : 'Move to the cyan portal and press E or SPACE';
    if (state.status.includes('Rest Room')) return isMobile ? 'Rest room: move to portal when ready' : 'Safe zone - move to portal when ready';
    return isMobile
      ? 'Drag to move • Stop to auto-attack • Tap ✨ for portal'
      : 'WASD/Arrows move • Shift sprint • Space jump • Right-drag camera • A attack • E/Space Use';
  };

  return (
    <div className="hud-root" aria-live="polite">
      {state.banner && (
        <div className="hud-overlay-banner" role="status" aria-live="assertive">
          <div className="hud-overlay-banner-inner">{state.banner}</div>
          <div className="hud-overlay-banner-sub">If you can read this, the UI overlay is active.</div>
        </div>
      )}

      <div className="hud-bar">
        <span className="hud-title">Mem-Totems</span>
        <span className="hud-room">{state.room.description}</span>
        <span className="hud-essence">🔥 {state.essence.fire} | 💧 {state.essence.water} | 🌍 {state.essence.earth} | 💨 {state.essence.air}</span>
        <span className="hud-health">Health: {state.health.current}/{state.health.max}</span>
      </div>

      {/* Instructions panel - always visible */}
      <div className="hud-instructions">
        <div className="hud-instructions-label">→</div>
        <div className="hud-instructions-text">{getInstructions()}</div>
      </div>

      <div className="hud-status">
        {state.victory && <div className="hud-banner victory">Victory! Run complete.</div>}
        {state.dead && <div className="hud-banner dead">You died. Press R for new run.</div>}
        {!state.victory && !state.dead && state.status && <div className="hud-message">{state.status}</div>}
      </div>
    </div>
  );
}

export default GameHUD;

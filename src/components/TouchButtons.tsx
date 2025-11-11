import { useEffect, useMemo, useState } from 'react';
import { GameHUDStore } from '../debug/GameHUDStore';
import { TouchController } from '../input/TouchController';
import './TouchButtons.css';

function supportsTouch() {
  return ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
}

export default function TouchButtons() {
  const [enabled, setEnabled] = useState(false);
  const [promptActive, setPromptActive] = useState(false);
  const [specialCooldownMs, setSpecialCooldownMs] = useState(0);

  useEffect(() => {
    const small = window.innerWidth < 1024; // enable on narrow or touch
    if (supportsTouch() || small) setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const unsub = GameHUDStore.subscribe(s => {
      setPromptActive(!!s.prompt);
      setSpecialCooldownMs(s.specialCooldownMs);
    });
    return () => unsub();
  }, [enabled]);

  const label = useMemo(() => (promptActive ? 'Use (✨)' : '✨'), [promptActive]);

  if (!enabled) return null;
  const specialOnCooldown = specialCooldownMs > 0;
  const specialSeconds = Math.ceil(specialCooldownMs / 100) / 10; // one decimal
  // Provide a progress percentage for the CSS ring if possible. We don't know total here,
  // so just show label countdown; the ring is optional and left at 0% by default.

  return (
    <div className="touch-buttons" aria-hidden="false">
      <button
        className={`tb-btn tb-jump`}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); TouchController.requestJump(); }}
        aria-label="Jump"
      >
        <span className="tb-emoji" role="img" aria-hidden>⬆️</span>
        <span className="tb-label">Jump</span>
      </button>

      <button
        className={`tb-btn tb-special ${specialOnCooldown ? 'cooldown' : ''}`}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); TouchController.requestSpecial(); }}
        aria-label="Smart Bomb"
        disabled={specialOnCooldown}
      >
        <span className="tb-emoji" role="img" aria-hidden>💥</span>
        <span className="tb-label">{specialOnCooldown ? `${specialSeconds.toFixed(1)}s` : 'Special'}</span>
      </button>

      <button
        className={`tb-btn tb-use ${promptActive ? 'active' : ''}`}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); TouchController.requestUse(); }}
        aria-label="Use"
      >
        <span className="tb-emoji" role="img" aria-hidden>✨</span>
        <span className="tb-label">{label}</span>
      </button>
    </div>
  );
}

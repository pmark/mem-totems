import { useEffect, useRef, useState } from 'react';
import { TouchController } from '../input/TouchController';
import './TouchControls.css';

function supportsTouch() {
  return ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
}

export default function TouchControls() {
  const [enabled, setEnabled] = useState(false);
  const originRef = useRef<{ x: number; y: number } | null>(null);
  const stickRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simple heuristic: enable if touch supported or viewport is narrow
    const small = window.innerWidth < 860;
    if (supportsTouch() || small) setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      originRef.current = { x: t.clientX, y: t.clientY };
      positionStick(t.clientX, t.clientY);
      updateVector(t.clientX, t.clientY);
    };
    const onMove = (e: TouchEvent) => {
      const t = e.touches[0];
      updateVector(t.clientX, t.clientY);
    };
    const onEnd = () => {
      originRef.current = null;
      TouchController.clear();
      if (stickRef.current) stickRef.current.style.opacity = '0';
    };
    window.addEventListener('touchstart', onStart, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onEnd);
    };
  }, [enabled]);

  function positionStick(x: number, y: number) {
    if (!stickRef.current) return;
    stickRef.current.style.opacity = '1';
    stickRef.current.style.transform = `translate(${x - 56}px, ${y - 56}px)`; // center 112px container
  }

  function updateVector(x: number, y: number) {
    if (!originRef.current) return;
    const dx = x - originRef.current.x;
    const dy = y - originRef.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const max = 48; // clamp radius
    const clamped = Math.min(dist, max);
    const nx = dist === 0 ? 0 : dx / dist;
    const ny = dist === 0 ? 0 : dy / dist;
    const handleX = originRef.current.x + nx * clamped;
    const handleY = originRef.current.y + ny * clamped;
    if (handleRef.current) {
      handleRef.current.style.transform = `translate(${handleX - 20}px, ${handleY - 20}px)`; // handle diameter 40
    }
    TouchController.setVector(nx, ny, clamped / max, true);
  }

  if (!enabled) return null;
  return (
    <div className="touch-layer" aria-hidden="false">
      <div ref={stickRef} className="touch-stick">
        <div className="touch-base" />
      </div>
      <div ref={handleRef} className="touch-handle" />
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { TouchController } from '../input/TouchController';
import './TouchControls.css';

function supportsTouch() {
  return ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
}

export default function TouchControls() {
  const [enabled, setEnabled] = useState(false);
  const originRef = useRef<{ x: number; y: number } | null>(null);
  const baseCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const stickRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simple heuristic: enable if touch supported or viewport is narrow
    const small = window.innerWidth < 860;
    if (supportsTouch() || small) setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const computeBaseCenter = () => {
      // Default (hidden) position; actual origin is set at user's first touch point
      const baseSize = 112;
      const margin = Math.min(28, Math.max(16, Math.round(window.innerWidth * 0.02)));
      const cx = margin + baseSize / 2;
      const cy = window.innerHeight - margin - baseSize / 2;
      baseCenterRef.current = { x: cx, y: cy };
      if (stickRef.current) {
        stickRef.current.style.transform = `translate(${cx - baseSize / 2}px, ${cy - baseSize / 2}px)`;
        stickRef.current.style.opacity = '0';
      }
      if (handleRef.current) {
        handleRef.current.style.transform = `translate(${cx - 20}px, ${cy - 20}px)`;
      }
    };

    computeBaseCenter();
    const onResize = () => computeBaseCenter();

    let activeId: number | null = null;

    const isInteractiveTarget = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return false;
      // Ignore touches on right-side button cluster or any interactive controls
      return !!(target.closest('.touch-buttons') || target.closest('.tb-btn'));
    };

    const onStart = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (activeId !== null) break;
        const target = (e.target as EventTarget) || null;
        if (isInteractiveTarget(target)) continue; // don't start when tapping buttons
        // Start joystick at the exact touch point anywhere on the scene
        activeId = t.identifier;
        originRef.current = { x: t.clientX, y: t.clientY };
        // Position base and make it visible
        const baseSize = 112;
        if (stickRef.current) {
          stickRef.current.style.transform = `translate(${t.clientX - baseSize / 2}px, ${t.clientY - baseSize / 2}px)`;
          stickRef.current.style.opacity = '1';
        }
        if (handleRef.current) {
          handleRef.current.style.transform = `translate(${t.clientX - 20}px, ${t.clientY - 20}px)`;
        }
        updateVector(t.clientX, t.clientY);
        e.preventDefault();
        break;
      }
    };
    const onMove = (e: TouchEvent) => {
      if (activeId === null) return;
      for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i];
        if (t.identifier === activeId) {
          updateVector(t.clientX, t.clientY);
          e.preventDefault();
          break;
        }
      }
    };
    const endActive = (id: number) => {
      if (activeId === id) {
        activeId = null;
        originRef.current = null;
        TouchController.clear();
        // Return handle to center
        const c = baseCenterRef.current;
        if (handleRef.current) handleRef.current.style.transform = `translate(${c.x - 20}px, ${c.y - 20}px)`;
        if (stickRef.current) stickRef.current.style.opacity = '0';
      }
    };
    const onEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        endActive(t.identifier);
      }
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    window.addEventListener('touchstart', onStart, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onEnd);
    };
  }, [enabled]);

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
      <div ref={stickRef} className="touch-stick left-bottom">
        <div className="touch-base" />
      </div>
      <div ref={handleRef} className="touch-handle" />
    </div>
  );
}

import { useEffect, useState } from 'react';
import { GameHUDStore } from '../debug/GameHUDStore';
import { TouchController } from '../input/TouchController';
import './InteractButton.css';

function supportsTouch() {
  return ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
}

export default function InteractButton() {
  const [visible, setVisible] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const unsub = GameHUDStore.subscribe(s => {
      // Show when a prompt exists (totem or portal), hide otherwise
      setVisible(!!s.prompt);
    });
    setEnabled(supportsTouch() || window.innerWidth < 860);
    return () => unsub();
  }, []);

  if (!enabled || !visible) return null;
  return (
    <button
      className="interact-btn"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); TouchController.requestInteract(); }}
    >
      Interact
    </button>
  );
}

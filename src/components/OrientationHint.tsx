import { useEffect, useState } from 'react';
import './OrientationHint.css';

export default function OrientationHint() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const check = () => {
      const portrait = window.innerHeight > window.innerWidth;
      setShow(portrait && window.innerWidth < 700);
    };
    check();
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check as any);
    return () => { window.removeEventListener('resize', check); window.removeEventListener('orientationchange', check as any); };
  }, []);
  if (!show) return null;
  return (
    <div className="orient-overlay" aria-live="polite" role="status">
      <div className="orient-card">
        <div className="orient-icon">📱↻</div>
        <div className="orient-text">Rotate your device for the best view</div>
      </div>
    </div>
  );
}

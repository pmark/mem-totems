import { useEffect, useState } from 'react';
import { GameHUDStore } from '../debug/GameHUDStore';
import './DeathModal.css';

interface RunSummary {
  roomsCleared: number;
  totalRooms: number;
  essence: { fire: number; water: number; earth: number; air: number };
  enemiesDefeated: number;
  timeAliveSec: number;
}

function formatTime(sec: number){
  const m = Math.floor(sec/60); const s = Math.floor(sec%60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function DeathModal(){
  const [dead, setDead] = useState(GameHUDStore.get().dead);
  const [victory, setVictory] = useState(GameHUDStore.get().victory);
  const [summary, setSummary] = useState<RunSummary | null>(null);
  const [visible, setVisible] = useState(dead || victory);
  const [startTime] = useState<number>(performance.now());
  const [enemiesDefeated, setEnemiesDefeated] = useState(0);

  useEffect(() => {
    const unsub = GameHUDStore.subscribe(s => {
      if (!dead && s.dead){
        setDead(true); setVisible(true);
        // compute summary
        const roomsCleared = s.room.index; // index of current room when died
        const totalRooms = s.room.total;
        setSummary({
          roomsCleared,
          totalRooms,
          essence: s.essence,
          enemiesDefeated,
          timeAliveSec: (performance.now() - startTime)/1000
        });
      }
      if (!victory && s.victory){
        setVictory(true); setVisible(true);
        setSummary({
          roomsCleared: s.room.total,
          totalRooms: s.room.total,
          essence: s.essence,
          enemiesDefeated,
          timeAliveSec: (performance.now() - startTime)/1000
        });
      }
      if (!s.dead && !s.victory){
        setDead(false); setVictory(false); setVisible(false);
      }
    });
    return () => unsub();
  }, [dead, victory, startTime, enemiesDefeated]);

  // TEMP: track defeats via status text pattern
  useEffect(() => {
    const unsub = GameHUDStore.subscribe(s => {
      if (/Enemy defeated!/i.test(s.status)) setEnemiesDefeated(prev => prev + 1);
    });
    return () => unsub();
  }, []);

  const restartRun = () => {
    console.log('[DeathModal] Restart button clicked - dispatching restart event');
    // Dispatch a custom event the Phaser scene listens for
    window.dispatchEvent(new Event('memTotems:restart-run'));
    // Also close the modal
    setVisible(false);
  };
  const dismiss = () => {
    console.log('[DeathModal] Dismiss button clicked');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="death-modal-backdrop" role="dialog" aria-modal="true" aria-label={victory ? 'Run Complete' : 'Run Failed'}>
      <div className="death-modal">
        <div className="death-modal-header">
          <span className="emoji" aria-hidden>{victory ? '🏆' : '💀'}</span>
          <span>{victory ? 'Run Complete' : 'You Fell'}</span>
        </div>
        <div className="death-modal-body">
          {summary && (
            <div className="run-stats" aria-label="Run statistics">
              <div className="stat"><span className="stat-label">Rooms Cleared</span><span className="stat-value">{summary.roomsCleared}/{summary.totalRooms}</span></div>
              <div className="stat"><span className="stat-label">Time Alive</span><span className="stat-value">{formatTime(summary.timeAliveSec)}</span></div>
              <div className="stat"><span className="stat-label">Enemies Defeated</span><span className="stat-value">{summary.enemiesDefeated}</span></div>
              <div className="stat"><span className="stat-label">Essence Fire</span><span className="stat-value">{summary.essence.fire}</span></div>
              <div className="stat"><span className="stat-label">Essence Water</span><span className="stat-value">{summary.essence.water}</span></div>
              <div className="stat"><span className="stat-label">Essence Earth</span><span className="stat-value">{summary.essence.earth}</span></div>
              <div className="stat"><span className="stat-label">Essence Air</span><span className="stat-value">{summary.essence.air}</span></div>
            </div>
          )}
          <div className="tips" aria-label="Helpful tips">
            {victory ? (
              <>
                <span>Great job! Try a fresh run for different portal sequences.</span>
                <span>Experiment with pacing: sprint less to auto-attack more.</span>
              </>
            ) : (
              <>
                <span>Tip: Stop moving to auto-attack nearby enemies faster.</span>
                <span>Jump (Space/⬆️) to cross pits and avoid backtracking.</span>
                <span>Use the smart bomb (💥) when surrounded.</span>
              </>
            )}
          </div>
        </div>
        <div className="death-modal-actions">
          <button className="dm-btn" onClick={restartRun}>{victory ? 'New Run' : 'Retry'}</button>
          <button className="dm-btn secondary" onClick={dismiss}>Review Map</button>
        </div>
      </div>
    </div>
  );
}

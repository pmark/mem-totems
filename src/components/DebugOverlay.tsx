import { useEffect, useMemo, useState } from 'react';
import { Logger, type LogEntry } from '../debug/Logger';
import './DebugOverlay.css';

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString();
}

export default function DebugOverlay() {
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'error' | 'warn' | 'info' | 'log'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (paused) return;
    return Logger.subscribe(setEntries);
  }, [paused]);

  const filtered = useMemo(() => {
    return entries.filter(e => {
      if (filter !== 'all' && e.level !== filter) return false;
      if (search && !`${e.message} ${e.stack ?? ''}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }).slice().reverse(); // newest first
  }, [entries, filter, search]);

  function copyAll() {
    const text = filtered.map(e => `[${formatTime(e.timestamp)}][${e.level.toUpperCase()}] ${e.message}${e.stack ? `\n${e.stack}` : ''}`).join('\n');
    navigator.clipboard.writeText(text).catch(() => {});
  }

  return (
    <div className="dbg-root" aria-live="polite">
      <button className="dbg-toggle" onClick={() => setVisible(v => !v)} aria-expanded={visible}>
        {visible ? '⛔ Hide Logs' : '🐞 Show Logs'}
      </button>

      {visible && (
        <div className="dbg-panel">
          <div className="dbg-toolbar">
            <div className="dbg-filters">
              {(['all','error','warn','info','log'] as const).map(k => (
                <button key={k} className={filter===k? 'active': ''} onClick={() => setFilter(k)}>{k}</button>
              ))}
            </div>
            <input className="dbg-search" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)} />
            <button onClick={()=>setPaused(p=>!p)}>{paused? 'Resume' : 'Pause'}</button>
            <button onClick={copyAll}>Copy</button>
          </div>

          <ul className="dbg-list">
            {filtered.length === 0 && <li className="dbg-empty">No messages</li>}
            {filtered.map(e => (
              <li key={e.id} className={`dbg-item ${e.level}`}>
                <div className="dbg-head" onClick={() => Logger.toggle(e.id)}>
                  <span className="dbg-time">{formatTime(e.timestamp)}</span>
                  <span className="dbg-level">{e.level.toUpperCase()}</span>
                  <span className="dbg-msg">{e.message}</span>
                  {e.stack && <span className="dbg-caret">{e.collapsed ? '▸' : '▾'}</span>}
                </div>
                {e.stack && !e.collapsed && (
                  <pre className="dbg-stack" role="region" aria-label="Stack trace">{e.stack}</pre>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export type LogLevel = 'log' | 'info' | 'warn' | 'error';

export interface LogEntry {
  id: number;
  level: LogLevel;
  message: string;
  timestamp: number;
  stack?: string;
  collapsed?: boolean;
}

function formatArg(value: unknown): string {
  try {
    if (value instanceof Error) {
      return `${value.name}: ${value.message}`;
    }
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean' || value == null)
      return String(value);

    // Handle ErrorEvent/PromiseRejectionEvent
    if (typeof window !== 'undefined' && value instanceof Event) {
      const anyVal = value as any;
      if (anyVal?.message || anyVal?.reason) {
        return anyVal.message || (anyVal.reason?.message ?? String(anyVal.reason));
      }
    }

    const cache = new Set<any>();
    const s = JSON.stringify(value as any, function (_key, val) {
      if (typeof val === 'object' && val !== null) {
        if (cache.has(val)) return '[Circular]';
        cache.add(val);
      }
      if (val instanceof Error) {
        return { name: val.name, message: val.message };
      }
      return val;
    });
    cache.clear();
    return s ?? String(value);
  } catch {
    try { return String(value); } catch { return '[Unprintable]'; }
  }
}

class LoggerImpl {
  private entries: LogEntry[] = [];
  private listeners: Array<(entries: LogEntry[]) => void> = [];
  private nextId = 1;
  private maxEntries = 500;

  subscribe(listener: (entries: LogEntry[]) => void): () => void {
    this.listeners.push(listener);
    listener(this.entries);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private emit() {
    for (const l of this.listeners) l(this.entries);
  }

  private push(level: LogLevel, args: unknown[], stack?: string) {
    const message = args.map(a => formatArg(a)).join(' ');
    // Try to find a stack if not provided
    if (!stack) {
      for (const a of args) {
        if (a instanceof Error && a.stack) { stack = a.stack; break; }
      }
    }

    const entry: LogEntry = {
      id: this.nextId++,
      level,
      message,
      timestamp: Date.now(),
      stack,
      collapsed: true
    };
    this.entries.push(entry);
    if (this.entries.length > this.maxEntries) {
      this.entries.splice(0, this.entries.length - this.maxEntries);
    }
    this.emit();
  }

  log = (...args: unknown[]) => this.push('log', args);
  info = (...args: unknown[]) => this.push('info', args);
  warn = (...args: unknown[]) => this.push('warn', args);
  error = (...args: unknown[]) => {
    let stack: string | undefined;
    for (const a of args) {
      if (a instanceof Error && a.stack) { stack = a.stack; break; }
    }
    this.push('error', args, stack);
  };

  toggle(entryId: number) {
    const entry = this.entries.find(e => e.id === entryId);
    if (entry) {
      entry.collapsed = !entry.collapsed;
      this.emit();
    }
  }
}

export const Logger = new LoggerImpl();

// Patch global console
const original = { ...console };
console.log = (...a: unknown[]) => { original.log?.(...a); Logger.log(...a); };
console.info = (...a: unknown[]) => { original.info?.(...a); Logger.info(...a); };
console.warn = (...a: unknown[]) => { original.warn?.(...a); Logger.warn(...a); };
console.error = (...a: unknown[]) => { original.error?.(...a); Logger.error(...a); };

// Global error hooks
window.addEventListener('error', (ev: ErrorEvent) => {
  const details = { source: ev.filename, line: ev.lineno, column: ev.colno };
  if (ev.error instanceof Error) {
    Logger.error(ev.message, details, ev.error);
  } else {
    Logger.error(ev.message, details);
  }
});
window.addEventListener('unhandledrejection', (ev: PromiseRejectionEvent) => {
  const reason = ev.reason;
  if (reason instanceof Error) {
    Logger.error('UnhandledRejection:', reason);
  } else {
    Logger.error('UnhandledRejection:', reason);
  }
});

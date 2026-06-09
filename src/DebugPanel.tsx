import React, { useState, useEffect, useRef, useCallback } from 'react';

export type LogEntry = {
  id: number;
  time: string;
  type: 'click' | 'error' | 'warn' | 'info' | 'event';
  message: string;
  detail?: string;
};

let globalLogId = 0;
let externalAddLog: ((entry: Omit<LogEntry, 'id' | 'time'>) => void) | null = null;

export function debugLog(entry: Omit<LogEntry, 'id' | 'time'>) {
  externalAddLog?.(entry);
}

// ─── Строка лога с кнопкой копирования ────────────────────────────────────
function LogRow({
  log,
  typeColor,
  typeBg,
}: {
  log: LogEntry;
  typeColor: Record<LogEntry['type'], string>;
  typeBg: Record<LogEntry['type'], string>;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = [log.time, log.type.toUpperCase(), log.message, log.detail]
      .filter(Boolean)
      .join('  ');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }).catch(() => {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        padding: '3px 8px 3px 12px',
        background: typeBg[log.type],
        borderLeft: `2px solid ${typeColor[log.type]}`,
        marginBottom: '1px',
        position: 'relative',
      }}
      className="debug-row"
    >
      <span style={{ color: '#334155', fontSize: '9px', whiteSpace: 'nowrap', paddingTop: '2px', minWidth: '80px' }}>
        {log.time}
      </span>
      <span style={{ color: typeColor[log.type], fontSize: '9px', whiteSpace: 'nowrap', paddingTop: '2px', minWidth: '36px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        {log.type}
      </span>
      <span style={{ color: '#cbd5e1', fontSize: '10px', wordBreak: 'break-all', lineHeight: 1.4, flex: 1 }}>
        {log.message}
        {log.detail && (
          <span style={{ color: '#64748b', marginLeft: '6px' }}>{log.detail}</span>
        )}
      </span>
      {/* Кнопка копирования */}
      <button
        onClick={handleCopy}
        title="Копировать"
        style={{
          flexShrink: 0,
          width: '20px',
          height: '20px',
          borderRadius: '4px',
          border: `1px solid ${copied ? typeColor[log.type] : 'rgba(255,255,255,0.08)'}`,
          background: copied ? `${typeColor[log.type]}22` : 'transparent',
          color: copied ? typeColor[log.type] : '#475569',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          transition: 'all 0.15s',
          padding: 0,
        }}
      >
        {copied ? '✓' : '⎘'}
      </button>
    </div>
  );
}

export function DebugPanel() {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'click' | 'error' | 'warn' | 'info' | 'event'>('all');
  const [panelPos, setPanelPos] = useState({ x: 0, y: -56 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const bottomRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((entry: Omit<LogEntry, 'id' | 'time'>) => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
    setLogs(prev => {
      const next = [...prev, { ...entry, id: ++globalLogId, time }];
      return next.length > 200 ? next.slice(-200) : next;
    });
  }, []);

  // Регистрируем глобальный хук
  useEffect(() => {
    externalAddLog = addLog;
    return () => { externalAddLog = null; };
  }, [addLog]);

  // Перехват console.error / console.warn
  useEffect(() => {
    const origError = console.error.bind(console);
    const origWarn = console.warn.bind(console);

    console.error = (...args: unknown[]) => {
      origError(...args);
      const asText = args.map(a => String(a)).join(' ');
      const hasThemeNoise = args.some(a => typeof a === 'string' && a.includes('[getThemeColors]'));
      if (hasThemeNoise) return;

      const err = args.find((a): a is Error => a instanceof Error);
      addLog({ type: 'error', message: asText, detail: err?.stack });
    };
    console.warn = (...args: unknown[]) => {
      origWarn(...args);
      addLog({ type: 'warn', message: args.map(a => String(a)).join(' ') });
    };

    return () => {
      console.error = origError;
      console.warn = origWarn;
    };
  }, [addLog]);

  // Перехват window.onerror и unhandledrejection
  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      addLog({ type: 'error', message: e.message, detail: `${e.filename}:${e.lineno}:${e.colno}` });
    };
    const onUnhandled = (e: PromiseRejectionEvent) => {
      addLog({ type: 'error', message: `Unhandled promise rejection: ${String(e.reason)}` });
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandled);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandled);
    };
  }, [addLog]);

  // Перехват глобальных кликов с определением цели
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const tag = target.tagName.toLowerCase();
      const classes = Array.from(target.classList).slice(0, 4).join(' ');
      const id = target.id ? `#${target.id}` : '';
      const text = target.textContent?.trim().slice(0, 40) || '';
      addLog({
        type: 'click',
        message: `${tag}${id} [${classes}]`,
        detail: text ? `"${text}"` : undefined,
      });
    };
    window.addEventListener('click', onClick, { capture: true });
    return () => window.removeEventListener('click', onClick, { capture: true });
  }, [addLog]);

  // Авто-скролл вниз
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, open]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panelPos.x, y: e.clientY - panelPos.y });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setPanelPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    };
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  const filtered = filter === 'all' ? logs : logs.filter(l => l.type === filter);

  const typeColor: Record<LogEntry['type'], string> = {
    click: '#22d3ee',
    error: '#f87171',
    warn:  '#fbbf24',
    info:  '#a78bfa',
    event: '#34d399',
  };
  const typeBg: Record<LogEntry['type'], string> = {
    click: 'rgba(34,211,238,0.08)',
    error: 'rgba(248,113,113,0.10)',
    warn:  'rgba(251,191,36,0.08)',
    info:  'rgba(167,139,250,0.08)',
    event: 'rgba(52,211,153,0.08)',
  };

  const counts = logs.reduce((acc, l) => { acc[l.type] = (acc[l.type] || 0) + 1; return acc; }, {} as Record<string, number>);

  return (
    <>
      {/* Иконка-кнопка */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Debug Panel"
        style={{
          position: 'fixed',
          bottom: '12px',
          right: '12px',
          zIndex: 9999,
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: counts.error ? 'rgba(248,113,113,0.25)' : 'rgba(7,7,22,0.85)',
          border: `2px solid ${counts.error ? '#f87171' : '#22d3ee44'}`,
          color: counts.error ? '#f87171' : '#22d3ee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          boxShadow: counts.error ? '0 0 12px rgba(248,113,113,0.5)' : '0 0 8px rgba(34,211,238,0.2)',
          fontSize: '14px',
          fontFamily: 'monospace',
          transition: 'all 0.2s',
        }}
      >
        {counts.error ? '!' : '⬛'}
        {counts.error ? (
          <span style={{ position: 'absolute', top: -5, right: -5, background: '#f87171', color: '#000', borderRadius: '50%', fontSize: '9px', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {counts.error > 99 ? '99+' : counts.error}
          </span>
        ) : null}
      </button>

      {/* Панель */}
      {open && (
        <div
          style={{
            position: 'fixed',
            left: `${panelPos.x}px`,
            top: `${panelPos.y}px`,
            zIndex: 9999,
            width: '480px',
            maxWidth: 'calc(100vw - 24px)',
            height: '400px',
            background: 'rgba(4,4,18,0.97)',
            border: '1px solid rgba(34,211,238,0.2)',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
            backdropFilter: 'blur(16px)',
            fontFamily: 'monospace',
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Заголовок */}
          <div
            style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', gap: '8px', flexShrink: 0, cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none' }}
            onMouseDown={handleMouseDown}
          >
            <span style={{ color: '#22d3ee', fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase' }}>DEBUG</span>
            <span style={{ color: '#475569', fontSize: '10px' }}>{logs.length} entries</span>
            <div style={{ flex: 1 }} />
            {/* Фильтры */}
            {(['all', 'click', 'error', 'warn', 'event'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  fontSize: '9px',
                  padding: '2px 7px',
                  borderRadius: '6px',
                  border: `1px solid ${filter === f ? (f === 'all' ? '#22d3ee' : typeColor[f as LogEntry['type']]) : 'rgba(255,255,255,0.1)'}`,
                  background: filter === f ? 'rgba(255,255,255,0.06)' : 'transparent',
                  color: filter === f ? (f === 'all' ? '#22d3ee' : typeColor[f as LogEntry['type']]) : '#64748b',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                {f}{f !== 'all' && counts[f] ? ` (${counts[f]})` : ''}
              </button>
            ))}
            <button
              onClick={() => setLogs([])}
              style={{ fontSize: '9px', padding: '2px 7px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#64748b', cursor: 'pointer', letterSpacing: '1px' }}
            >
              CLR
            </button>
            <button
              onClick={() => setOpen(false)}
              style={{ fontSize: '14px', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0 4px' }}
            >
              ×
            </button>
          </div>

          {/* Логи */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
            {filtered.length === 0 && (
              <div style={{ color: '#334155', fontSize: '11px', textAlign: 'center', marginTop: '40px' }}>нет записей</div>
            )}
            {filtered.map(log => {
              const row = <LogRow log={log} typeColor={typeColor} typeBg={typeBg} />;
              return React.cloneElement(row, { key: log.id });
            })}
            <div ref={bottomRef} />
          </div>
        </div>
      )}
    </>
  );
}

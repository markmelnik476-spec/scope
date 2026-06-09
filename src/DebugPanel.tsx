import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { LogEntry, LogType, PerfSnapshot, NetworkEntry, TabId } from './types/debug-panel';
import { formatTime, formatRelative, formatBytes, argsToString } from './utils/format';
import { copyToClipboard } from './utils/clipboard';
import { useMouseDrag, useMouseResize } from './hooks/useMouseDrag';
import { TYPE_COLOR, TYPE_BG, BTN_BASE } from './utils/debug-styles';

// Re-export types for consumers
export type { LogType, LogEntry } from './types/debug-panel';

// ─── Globals ────────────────────────────────────────────────────────────────
let globalLogId = 0;
let externalAddLog: ((entry: Omit<LogEntry, 'id' | 'time' | 'timestamp'>) => void) | null = null;

export function debugLog(entry: Omit<LogEntry, 'id' | 'time' | 'timestamp'>) {
  externalAddLog?.(entry);
}

// ─── LogRow ─────────────────────────────────────────────────────────────────
const LogRow = React.memo(function LogRow({
  log,
  relativeTime,
  onToggleStar,
  expanded,
  onToggleExpand,
}: {
  log: LogEntry;
  relativeTime: boolean;
  onToggleStar: (id: number) => void;
  expanded: boolean;
  onToggleExpand: (id: number) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = [log.time, log.type.toUpperCase(), log.message, log.detail].filter(Boolean).join('  ');
    copyToClipboard(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  };

  return (
    <div
      onClick={() => log.detail && onToggleExpand(log.id)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '6px',
        padding: '3px 8px 3px 12px',
        background: TYPE_BG[log.type],
        borderLeft: `2px solid ${TYPE_COLOR[log.type]}`,
        marginBottom: '1px',
        cursor: log.detail ? 'pointer' : 'default',
        transition: 'background 0.1s',
      }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onToggleStar(log.id); }}
        title="Bookmark"
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '10px', padding: 0, color: log.starred ? '#fbbf24' : '#1e293b', flexShrink: 0, marginTop: '1px' }}
      >
        {log.starred ? '\u2605' : '\u2606'}
      </button>
      <span style={{ color: '#475569', fontSize: '9px', whiteSpace: 'nowrap', paddingTop: '2px', minWidth: relativeTime ? '56px' : '78px', flexShrink: 0 }}>
        {relativeTime ? formatRelative(log.timestamp) : log.time}
      </span>
      <span style={{ color: TYPE_COLOR[log.type], fontSize: '9px', whiteSpace: 'nowrap', paddingTop: '2px', minWidth: '52px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, flexShrink: 0 }}>
        {log.type}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ color: '#cbd5e1', fontSize: '10px', wordBreak: 'break-all', lineHeight: 1.4 }}>
          {log.message}
        </span>
        {log.detail && !expanded && (
          <span style={{ color: '#334155', marginLeft: '6px', fontSize: '9px' }}>[...]</span>
        )}
        {expanded && log.detail && (
          <pre style={{ color: '#64748b', fontSize: '9px', margin: '4px 0 2px', whiteSpace: 'pre-wrap', wordBreak: 'break-all', lineHeight: 1.3, background: 'rgba(0,0,0,0.3)', padding: '6px 8px', borderRadius: '4px', maxHeight: '200px', overflowY: 'auto' }}>
            {log.detail}
          </pre>
        )}
      </div>
      <button
        onClick={handleCopy}
        title="Copy"
        style={{
          flexShrink: 0, width: '18px', height: '18px', borderRadius: '4px',
          border: `1px solid ${copied ? TYPE_COLOR[log.type] : 'rgba(255,255,255,0.06)'}`,
          background: copied ? `${TYPE_COLOR[log.type]}22` : 'transparent',
          color: copied ? TYPE_COLOR[log.type] : '#334155',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '9px', transition: 'all 0.15s', padding: 0,
        }}
      >
        {copied ? '\u2713' : '\u2398'}
      </button>
    </div>
  );
});

// ─── PerformanceTab ─────────────────────────────────────────────────────────
const PerformanceTab = React.memo(function PerformanceTab() {
  const [snapshots, setSnapshots] = useState<PerfSnapshot[]>([]);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    let rafId: number;
    let frameCount = 0;

    const tick = (now: number) => {
      frameCount++;
      const delta = now - lastTimeRef.current;
      if (delta >= 1000) {
        const fps = Math.round((frameCount * 1000) / delta);
        const mem = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory;
        const memMB = mem ? mem.usedJSHeapSize : null;
        const domNodes = document.querySelectorAll('*').length;
        setSnapshots(prev => {
          const next = [...prev, { fps, memory: memMB, domNodes, timestamp: Date.now() }];
          return next.length > 60 ? next.slice(-60) : next;
        });
        frameCount = 0;
        lastTimeRef.current = now;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const latest = snapshots[snapshots.length - 1];
  const avgFps = snapshots.length ? Math.round(snapshots.reduce((s, p) => s + p.fps, 0) / snapshots.length) : 0;
  const maxFps = snapshots.length ? Math.max(...snapshots.map(s => s.fps)) : 0;
  const minFps = snapshots.length ? Math.min(...snapshots.map(s => s.fps)) : 0;

  const barWidth = 4;
  const barGap = 1;
  const graphHeight = 80;

  return (
    <div style={{ padding: '12px', color: '#cbd5e1', fontSize: '10px' }}>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <div style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)', borderRadius: '8px', padding: '8px 14px', minWidth: '80px' }}>
          <div style={{ color: '#475569', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase' }}>FPS</div>
          <div style={{ color: '#22d3ee', fontSize: '22px', fontWeight: 'bold' }}>{latest?.fps ?? '-'}</div>
          <div style={{ color: '#334155', fontSize: '8px' }}>avg {avgFps} | min {minFps} | max {maxFps}</div>
        </div>
        <div style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '8px', padding: '8px 14px', minWidth: '80px' }}>
          <div style={{ color: '#475569', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase' }}>Memory</div>
          <div style={{ color: '#a78bfa', fontSize: '22px', fontWeight: 'bold' }}>{latest?.memory ? formatBytes(latest.memory) : 'N/A'}</div>
        </div>
        <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '8px', padding: '8px 14px', minWidth: '80px' }}>
          <div style={{ color: '#475569', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase' }}>DOM Nodes</div>
          <div style={{ color: '#34d399', fontSize: '22px', fontWeight: 'bold' }}>{latest?.domNodes ?? '-'}</div>
        </div>
      </div>

      <div style={{ color: '#475569', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>FPS History (60s)</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: `${barGap}px`, height: `${graphHeight}px`, background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '4px', overflow: 'hidden' }}>
        {snapshots.map((s, i) => {
          const h = Math.max(2, (s.fps / 70) * graphHeight);
          const color = s.fps >= 50 ? '#34d399' : s.fps >= 30 ? '#fbbf24' : '#f87171';
          return <div key={i} style={{ width: `${barWidth}px`, height: `${h}px`, background: color, borderRadius: '1px', flexShrink: 0, transition: 'height 0.3s' }} />;
        })}
      </div>
    </div>
  );
});

// ─── NetworkTab ─────────────────────────────────────────────────────────────
const NetworkTab = React.memo(function NetworkTab({ entries }: { entries: NetworkEntry[] }) {
  return (
    <div style={{ padding: '4px 0', fontSize: '10px' }}>
      {entries.length === 0 && (
        <div style={{ color: '#334155', fontSize: '11px', textAlign: 'center', marginTop: '40px' }}>No network requests captured</div>
      )}
      {entries.map(e => (
        <div key={e.id} style={{
          display: 'flex', gap: '8px', padding: '4px 12px', borderBottom: '1px solid rgba(255,255,255,0.03)',
          alignItems: 'center', background: e.status && e.status >= 400 ? 'rgba(248,113,113,0.06)' : 'transparent',
        }}>
          <span style={{
            color: e.pending ? '#fbbf24' : (e.status && e.status >= 400 ? '#f87171' : '#34d399'),
            fontSize: '9px', fontWeight: 'bold', minWidth: '32px',
          }}>
            {e.pending ? '...' : e.status ?? 'ERR'}
          </span>
          <span style={{ color: '#a78bfa', fontSize: '9px', fontWeight: 600, minWidth: '36px', textTransform: 'uppercase' }}>{e.method}</span>
          <span style={{ color: '#cbd5e1', fontSize: '9px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {e.url.replace(/^https?:\/\/[^/]+/, '')}
          </span>
          <span style={{ color: '#475569', fontSize: '9px', minWidth: '50px', textAlign: 'right' }}>
            {e.duration !== null ? `${e.duration}ms` : '-'}
          </span>
          <span style={{ color: '#334155', fontSize: '9px', minWidth: '50px', textAlign: 'right' }}>
            {e.size ?? '-'}
          </span>
        </div>
      ))}
    </div>
  );
});

// ─── Main Panel ─────────────────────────────────────────────────────────────
export function DebugPanel() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<'all' | LogType>('all');
  const [search, setSearch] = useState('');
  const [relativeTime, setRelativeTime] = useState(false);
  const [autoscroll, setAutoscroll] = useState(true);
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('logs');
  const [networkEntries, setNetworkEntries] = useState<NetworkEntry[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const { panelSize, handleResizeStart } = useMouseResize({ w: 540, h: 420 });
  const { panelPos, isDragging, handleDragStart } = useMouseDrag(null, panelSize);

  const bottomRef = useRef<HTMLDivElement>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const netIdRef = useRef(0);

  const addLog = useCallback((entry: Omit<LogEntry, 'id' | 'time' | 'timestamp'>) => {
    const now = new Date();
    setLogs(prev => {
      const next = [...prev, { ...entry, id: ++globalLogId, time: formatTime(now), timestamp: now.getTime() }];
      return next.length > 500 ? next.slice(-500) : next;
    });
  }, []);

  // Register global hook
  useEffect(() => {
    externalAddLog = addLog;
    return () => { externalAddLog = null; };
  }, [addLog]);

  // Intercept console.error / console.warn / console.log
  useEffect(() => {
    const origError = console.error.bind(console);
    const origWarn = console.warn.bind(console);
    const origLog = console.log.bind(console);

    console.error = (...args: unknown[]) => {
      origError(...args);
      if (args.some(a => typeof a === 'string' && a.includes('[getThemeColors]'))) return;
      if (args.some(a => typeof a === 'string' && a.includes('[DebugPanel]'))) return;
      const err = args.find((a): a is Error => a instanceof Error);
      addLog({ type: 'error', message: argsToString(args), detail: err?.stack });
    };
    console.warn = (...args: unknown[]) => {
      origWarn(...args);
      addLog({ type: 'warn', message: argsToString(args) });
    };
    console.log = (...args: unknown[]) => {
      origLog(...args);
      const asText = argsToString(args);
      if (asText.includes('[DebugPanel]')) return;
      addLog({ type: 'console', message: asText });
    };

    return () => {
      console.error = origError;
      console.warn = origWarn;
      console.log = origLog;
    };
  }, [addLog]);

  // Intercept window errors
  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      addLog({ type: 'error', message: e.message, detail: `${e.filename}:${e.lineno}:${e.colno}` });
    };
    const onUnhandled = (e: PromiseRejectionEvent) => {
      addLog({ type: 'error', message: `Unhandled: ${String(e.reason)}` });
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandled);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandled);
    };
  }, [addLog]);

  // Intercept clicks
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-debug-panel]')) return;
      const tag = target.tagName.toLowerCase();
      const cls = Array.from(target.classList).slice(0, 3).join('.');
      const id = target.id ? `#${target.id}` : '';
      const text = target.textContent?.trim().slice(0, 40) || '';
      addLog({
        type: 'click',
        message: `${tag}${id}${cls ? '.' + cls : ''}`,
        detail: text ? `"${text}"` : undefined,
      });
    };
    window.addEventListener('click', onClick, { capture: true });
    return () => window.removeEventListener('click', onClick, { capture: true });
  }, [addLog]);

  // Intercept fetch for network tab
  useEffect(() => {
    const origFetch = window.fetch.bind(window);
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;
      const method = init?.method?.toUpperCase() || 'GET';
      const id = ++netIdRef.current;
      const start = performance.now();

      setNetworkEntries(prev => [...prev, { id, method, url, status: null, duration: null, size: null, startTime: Date.now(), pending: true }]);
      addLog({ type: 'network', message: `${method} ${url}` });

      try {
        const res = await origFetch(input, init);
        const duration = Math.round(performance.now() - start);
        const clone = res.clone();
        let size: string | null = null;
        try {
          const blob = await clone.blob();
          size = formatBytes(blob.size);
        } catch { /* ignore */ }

        setNetworkEntries(prev => prev.map(e => e.id === id ? { ...e, status: res.status, duration, size, pending: false } : e));
        return res;
      } catch (err) {
        const duration = Math.round(performance.now() - start);
        setNetworkEntries(prev => prev.map(e => e.id === id ? { ...e, status: 0, duration, pending: false } : e));
        addLog({ type: 'error', message: `Fetch failed: ${method} ${url}`, detail: String(err) });
        throw err;
      }
    };
    return () => { window.fetch = origFetch; };
  }, [addLog]);

  // Autoscroll
  useEffect(() => {
    if (open && autoscroll && activeTab === 'logs') {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, open, autoscroll, activeTab]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Toggle star
  const toggleStar = useCallback((id: number) => {
    setLogs(prev => prev.map(l => l.id === id ? { ...l, starred: !l.starred } : l));
  }, []);

  // Toggle expand
  const toggleExpand = useCallback((id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  // Export
  const handleExport = () => {
    const data = JSON.stringify(logs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${new Date().toISOString().slice(0, 19)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy all visible
  const handleCopyAll = () => {
    const text = filtered.map(l => `[${l.time}] ${l.type.toUpperCase()} ${l.message}${l.detail ? ' | ' + l.detail : ''}`).join('\n');
    copyToClipboard(text);
  };

  // Scroll detection for auto-pause
  const handleLogsScroll = () => {
    const el = logsContainerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 30;
    setAutoscroll(atBottom);
  };

  // Filtered + searched logs
  const filtered = useMemo(() => {
    let result = logs;
    if (filter !== 'all') result = result.filter(l => l.type === filter);
    if (showStarredOnly) result = result.filter(l => l.starred);
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(l => l.message.toLowerCase().includes(s) || l.detail?.toLowerCase().includes(s) || l.type.includes(s));
    }
    return result;
  }, [logs, filter, search, showStarredOnly]);

  const counts = useMemo(() => logs.reduce((acc, l) => { acc[l.type] = (acc[l.type] || 0) + 1; return acc; }, {} as Record<string, number>), [logs]);
  const starCount = useMemo(() => logs.filter(l => l.starred).length, [logs]);

  const tabs: { id: TabId; label: string; badge?: number }[] = [
    { id: 'logs', label: 'Logs', badge: logs.length },
    { id: 'performance', label: 'Perf' },
    { id: 'network', label: 'Network', badge: networkEntries.length },
  ];

  return (
    <>
      {/* Toggle button */}
      <button
        data-debug-panel
        onClick={() => setOpen(o => !o)}
        title="Debug Panel (Ctrl+Shift+D)"
        style={{
          position: 'fixed', bottom: '12px', right: '12px', zIndex: 9999,
          width: '36px', height: '36px', borderRadius: '50%',
          background: counts.error ? 'rgba(248,113,113,0.25)' : 'rgba(7,7,22,0.85)',
          border: `2px solid ${counts.error ? '#f87171' : '#22d3ee44'}`,
          color: counts.error ? '#f87171' : '#22d3ee',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', backdropFilter: 'blur(8px)',
          boxShadow: counts.error ? '0 0 12px rgba(248,113,113,0.5)' : '0 0 8px rgba(34,211,238,0.2)',
          fontSize: '14px', fontFamily: 'monospace', transition: 'all 0.2s',
        }}
      >
        {counts.error ? '!' : '\u25fc'}
        {counts.error ? (
          <span style={{ position: 'absolute', top: -5, right: -5, background: '#f87171', color: '#000', borderRadius: '50%', fontSize: '9px', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {(counts.error || 0) > 99 ? '99+' : counts.error}
          </span>
        ) : null}
      </button>

      {/* Panel */}
      {open && (
        <div
          style={{
            position: 'fixed',
            left: panelPos ? `${panelPos.x}px` : undefined,
            top: panelPos ? `${panelPos.y}px` : undefined,
            right: panelPos ? undefined : '12px',
            bottom: panelPos ? undefined : '56px',
            zIndex: 9999,
            width: `${panelSize.w}px`,
            maxWidth: 'calc(100vw - 24px)',
            height: minimized ? 'auto' : `${panelSize.h}px`,
            background: 'rgba(4,4,18,0.97)',
            border: '1px solid rgba(34,211,238,0.15)',
            borderRadius: '12px',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
            backdropFilter: 'blur(16px)',
            fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
          }}
          data-debug-panel
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{ display: 'flex', alignItems: 'center', padding: '6px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)', gap: '6px', flexShrink: 0, cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none' }}
            onMouseDown={handleDragStart}
          >
            <span style={{ color: '#334155', fontSize: '11px', cursor: 'grab' }}>{'\u2630'}</span>
            <span style={{ color: '#22d3ee', fontSize: '10px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase' }}>DEBUG</span>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '2px', marginLeft: '8px' }}>
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={(e) => { e.stopPropagation(); setActiveTab(t.id); }}
                  onMouseDown={e => e.stopPropagation()}
                  style={{
                    ...BTN_BASE,
                    border: activeTab === t.id ? '1px solid rgba(34,211,238,0.4)' : BTN_BASE.border,
                    background: activeTab === t.id ? 'rgba(34,211,238,0.1)' : 'transparent',
                    color: activeTab === t.id ? '#22d3ee' : '#475569',
                    fontSize: '8px',
                  }}
                >
                  {t.label}{t.badge ? ` (${t.badge})` : ''}
                </button>
              ))}
            </div>

            <div style={{ flex: 1 }} />

            {/* Actions */}
            <button onClick={(e) => { e.stopPropagation(); setMinimized(m => !m); }} onMouseDown={e => e.stopPropagation()} title={minimized ? 'Expand' : 'Minimize'} style={{ ...BTN_BASE, fontSize: '11px', padding: '0 4px', lineHeight: '16px' }}>
              {minimized ? '\u25a1' : '\u2500'}
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleExport(); }} onMouseDown={e => e.stopPropagation()} title="Export JSON" style={BTN_BASE}>{'\u2913'}</button>
            <button onClick={(e) => { e.stopPropagation(); handleCopyAll(); }} onMouseDown={e => e.stopPropagation()} title="Copy all visible" style={BTN_BASE}>{'\u2398'}</button>
            <button onClick={(e) => { e.stopPropagation(); setOpen(false); }} onMouseDown={e => e.stopPropagation()} style={{ fontSize: '14px', background: 'transparent', border: 'none', color: '#475569', cursor: 'pointer', padding: '0 2px' }}>
              {'\u00d7'}
            </button>
          </div>

          {!minimized && (
            <>
              {/* Toolbar for logs tab */}
              {activeTab === 'logs' && (
                <div style={{ display: 'flex', alignItems: 'center', padding: '4px 10px', gap: '4px', borderBottom: '1px solid rgba(255,255,255,0.03)', flexShrink: 0 }}>
                  {/* Search */}
                  <div style={{ position: 'relative', flex: 1, maxWidth: '200px' }}>
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search logs..."
                      onMouseDown={e => e.stopPropagation()}
                      style={{
                        width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '6px', padding: '3px 8px 3px 22px', color: '#cbd5e1', fontSize: '9px',
                        outline: 'none', fontFamily: 'inherit',
                      }}
                    />
                    <span style={{ position: 'absolute', left: '7px', top: '50%', transform: 'translateY(-50%)', color: '#334155', fontSize: '10px', pointerEvents: 'none' }}>{'\u2315'}</span>
                  </div>

                  {/* Type filters */}
                  {(['all', 'click', 'error', 'warn', 'console', 'network', 'event'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      style={{
                        ...BTN_BASE,
                        border: `1px solid ${filter === f ? (f === 'all' ? '#22d3ee' : TYPE_COLOR[f as LogType]) : 'rgba(255,255,255,0.08)'}`,
                        background: filter === f ? 'rgba(255,255,255,0.05)' : 'transparent',
                        color: filter === f ? (f === 'all' ? '#22d3ee' : TYPE_COLOR[f as LogType]) : '#334155',
                        fontSize: '8px', padding: '2px 5px',
                      }}
                    >
                      {f}{f !== 'all' && counts[f] ? `\u00b7${counts[f]}` : ''}
                    </button>
                  ))}

                  <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.06)' }} />

                  {/* Star filter */}
                  <button
                    onClick={() => setShowStarredOnly(s => !s)}
                    title="Show starred only"
                    style={{ ...BTN_BASE, color: showStarredOnly ? '#fbbf24' : '#334155', border: showStarredOnly ? '1px solid rgba(251,191,36,0.4)' : BTN_BASE.border, fontSize: '10px', padding: '1px 5px' }}
                  >
                    {'\u2605'}{starCount > 0 ? ` ${starCount}` : ''}
                  </button>

                  {/* Time format */}
                  <button
                    onClick={() => setRelativeTime(r => !r)}
                    title={relativeTime ? 'Absolute time' : 'Relative time'}
                    style={{ ...BTN_BASE, fontSize: '8px', padding: '2px 5px' }}
                  >
                    {relativeTime ? 'REL' : 'ABS'}
                  </button>

                  {/* Autoscroll */}
                  <button
                    onClick={() => setAutoscroll(a => !a)}
                    title={autoscroll ? 'Pause autoscroll' : 'Resume autoscroll'}
                    style={{ ...BTN_BASE, color: autoscroll ? '#34d399' : '#475569', border: autoscroll ? '1px solid rgba(52,211,153,0.3)' : BTN_BASE.border, fontSize: '8px', padding: '2px 5px' }}
                  >
                    {autoscroll ? '\u25b6' : '\u23f8'}
                  </button>

                  {/* Clear */}
                  <button onClick={() => setLogs([])} style={{ ...BTN_BASE, fontSize: '8px', padding: '2px 5px' }}>CLR</button>
                </div>
              )}

              {/* Content */}
              <div
                ref={logsContainerRef}
                onScroll={activeTab === 'logs' ? handleLogsScroll : undefined}
                style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}
              >
                {activeTab === 'logs' && (
                  <>
                    {filtered.length === 0 && (
                      <div style={{ color: '#1e293b', fontSize: '11px', textAlign: 'center', marginTop: '60px' }}>
                        {search ? 'No matching entries' : 'No log entries yet'}
                        <div style={{ color: '#0f172a', fontSize: '9px', marginTop: '4px' }}>Ctrl+Shift+D to toggle panel</div>
                      </div>
                    )}
                    {filtered.map(log => (
                      <LogRow
                        key={log.id}
                        log={log}
                        relativeTime={relativeTime}
                        onToggleStar={toggleStar}
                        expanded={expandedIds.has(log.id)}
                        onToggleExpand={toggleExpand}
                      />
                    ))}
                    <div ref={bottomRef} />
                  </>
                )}
                {activeTab === 'performance' && <PerformanceTab />}
                {activeTab === 'network' && <NetworkTab entries={networkEntries} />}
              </div>

              {/* Status bar */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '3px 10px', borderTop: '1px solid rgba(255,255,255,0.04)', gap: '8px', flexShrink: 0, fontSize: '8px', color: '#1e293b' }}>
                <span>{logs.length} total</span>
                <span>{'\u00b7'}</span>
                <span>{filtered.length} shown</span>
                {counts.error ? <><span>{'\u00b7'}</span><span style={{ color: '#f87171' }}>{counts.error} errors</span></> : null}
                <div style={{ flex: 1 }} />
                <span style={{ color: '#0f172a' }}>Ctrl+Shift+D</span>
              </div>

              {/* Resize handle */}
              <div
                onMouseDown={handleResizeStart}
                style={{
                  position: 'absolute', bottom: 0, right: 0, width: '16px', height: '16px',
                  cursor: 'nwse-resize', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#1e293b', fontSize: '8px',
                }}
              >
                {'\u25e2'}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Unlock, Zap } from 'lucide-react';

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
    });
  };

  return (
    <div
      className="flex items-start gap-2 px-3 py-1.5 mb-0.5 transition-colors duration-150 group hover:bg-white/5 border-l-2"
      style={{
        borderColor: typeColor[log.type],
        backgroundColor: typeBg[log.type],
      }}
    >
      <span className="text-slate-500 text-[9px] whitespace-nowrap flex-shrink-0 min-w-fit pt-0.5">
        {log.time}
      </span>
      <span 
        className="text-[9px] whitespace-nowrap pt-0.5 min-w-fit uppercase tracking-widest font-semibold flex-shrink-0"
        style={{ color: typeColor[log.type] }}
      >
        {log.type}
      </span>
      <span className="text-slate-200 text-[10px] word-break break-all leading-relaxed flex-1">
        {log.message}
        {log.detail && (
          <span className="text-slate-500 ml-1.5">{log.detail}</span>
        )}
      </span>
      <button
        onClick={handleCopy}
        title="Копировать"
        className="flex-shrink-0 w-5 h-5 rounded border transition-all duration-150 flex items-center justify-center text-[10px] p-0 cursor-pointer"
        style={{
          borderColor: copied ? typeColor[log.type] : 'rgba(255,255,255,0.08)',
          backgroundColor: copied ? `${typeColor[log.type]}22` : 'transparent',
          color: copied ? typeColor[log.type] : '#475569',
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
  const [isLocked, setIsLocked] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((entry: Omit<LogEntry, 'id' | 'time'>) => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
    setLogs(prev => {
      const next = [...prev, { ...entry, id: ++globalLogId, time }];
      return next.length > 200 ? next.slice(-200) : next;
    });
  }, []);

  useEffect(() => {
    externalAddLog = addLog;
    return () => { externalAddLog = null; };
  }, [addLog]);

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

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, open]);

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
  const hasErrors = counts.error && counts.error > 0;

  return (
    <>
      {/* Debug Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 0.75 }}
        exit={{ opacity: 0, scale: 0.6 }}
        onClick={() => setOpen(o => !o)}
        title="Debug Panel"
        style={{ transformOrigin: 'bottom right' }}
        className={`fixed bottom-4 right-4 z-[9998] w-9 h-9 rounded-lg backdrop-blur-xl transition-all duration-200 flex items-center justify-center cursor-pointer border shadow-[0_10px_25px_rgba(0,0,0,0.4)] ${
          hasErrors
            ? 'bg-red-950/40 border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(248,113,113,0.3)]'
            : 'bg-[#070716]/80 border-cyan-500/20 text-cyan-400 hover:text-white'
        }`}
      >
        {hasErrors ? (
          <>
            <span className="font-mono font-bold text-xs">!</span>
            {counts.error > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold border border-red-600 shadow-lg">
                {counts.error > 99 ? '99+' : counts.error}
              </span>
            )}
          </>
        ) : (
          <Zap className="w-4 h-4" />
        )}
      </motion.button>

      {/* Debug Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: 25, y: 25, scale: 0.65 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 0.7 }}
            exit={{ opacity: 0, x: 25, y: 25, scale: 0.65 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ transformOrigin: 'bottom right' }}
            className="hud-panel fixed bottom-[-45px] right-[-35px] w-96 h-96 bg-[#070716]/92 backdrop-blur-2xl border border-cyan-500/20 p-3 rounded-xl shadow-[0_25px_50px_rgba(0,0,0,0.85)] z-[9998] flex flex-col gap-2 prevent-wheel-zoom"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-2 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <h2 className="font-mono font-semibold text-[9px] tracking-widest text-slate-300 uppercase">DEBUG ЛОГИРОВАНИЕ</h2>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsLocked(!isLocked)}
                  className={`w-fit p-0.5 rounded transition-colors flex-shrink-0 ${isLocked ? 'text-slate-600 hover:text-amber-400' : 'text-amber-400 hover:text-slate-500'}`}
                  title={isLocked ? "Разблокировать панель" : "Заблокировать панель"}
                >
                  {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="text-slate-400 hover:text-red-400 transition-colors cursor-pointer p-0.5 rounded hover:bg-white/5"
                  title="Закрыть Debug Panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-[9px] text-slate-500 font-mono mr-1">ФИЛЬТР:</span>
              {(['all', 'click', 'error', 'warn', 'event'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-[8px] py-0.5 px-1.5 rounded-lg border transition-all uppercase tracking-wider cursor-pointer font-mono font-semibold ${
                    filter === f
                      ? 'bg-white/5 border-white/20 text-white'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-300 hover:border-white/20'
                  }`}
                >
                  {f}{f !== 'all' && counts[f] ? ` (${counts[f]})` : ''}
                </button>
              ))}
              <div className="flex-1" />
              <button
                onClick={() => setLogs([])}
                className="text-[8px] py-0.5 px-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-300 cursor-pointer uppercase tracking-wider font-mono font-semibold transition-all"
              >
                ОЧИСТИТЬ
              </button>
            </div>

            {/* Log List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar prevent-wheel-zoom">
              {filtered.length === 0 ? (
                <div className="text-slate-500 text-[11px] text-center mt-16 font-mono">нет записей</div>
              ) : (
                <>
                  {filtered.map(log => (
                    <LogRow key={log.id} log={log} typeColor={typeColor} typeBg={typeBg} />
                  ))}
                  <div ref={bottomRef} />
                </>
              )}
            </div>

            {/* Footer Stats */}
            <div className="border-t border-white/5 pt-2 flex-shrink-0">
              <div className="text-[9px] text-slate-400 font-mono">
                Всего записей: <span className="text-cyan-400">{logs.length}</span>
                {hasErrors && <span className="ml-2">Ошибок: <span className="text-red-400">{counts.error}</span></span>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

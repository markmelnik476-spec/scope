import type React from 'react';
import type { LogType } from '../types/debug-panel';

export const TYPE_COLOR: Record<LogType, string> = {
  click: '#22d3ee',
  error: '#f87171',
  warn: '#fbbf24',
  info: '#a78bfa',
  event: '#34d399',
  network: '#fb923c',
  console: '#94a3b8',
};

export const TYPE_BG: Record<LogType, string> = {
  click: 'rgba(34,211,238,0.08)',
  error: 'rgba(248,113,113,0.10)',
  warn: 'rgba(251,191,36,0.08)',
  info: 'rgba(167,139,250,0.08)',
  event: 'rgba(52,211,153,0.08)',
  network: 'rgba(251,146,60,0.08)',
  console: 'rgba(148,163,184,0.06)',
};

export const BTN_BASE: React.CSSProperties = {
  fontSize: '9px',
  padding: '2px 7px',
  borderRadius: '6px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'transparent',
  color: '#64748b',
  cursor: 'pointer',
  textTransform: 'uppercase',
  letterSpacing: '1px',
};

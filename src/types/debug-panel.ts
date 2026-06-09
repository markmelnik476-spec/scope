import type React from 'react';

export type LogType = 'click' | 'error' | 'warn' | 'info' | 'event' | 'network' | 'console';

export type LogEntry = {
  id: number;
  time: string;
  timestamp: number;
  type: LogType;
  message: string;
  detail?: string;
  starred?: boolean;
  meta?: Record<string, unknown>;
};

export type PerfSnapshot = {
  fps: number;
  memory: number | null;
  domNodes: number;
  timestamp: number;
};

export type NetworkEntry = {
  id: number;
  method: string;
  url: string;
  status: number | null;
  duration: number | null;
  size: string | null;
  startTime: number;
  pending: boolean;
};

export type TabId = 'logs' | 'performance' | 'network';

export type PanelPosition = { x: number; y: number };

export type PanelSize = { w: number; h: number };

export type MouseDragState = {
  position: PanelPosition;
  isDragging: boolean;
  handleDragStart: (e: React.MouseEvent) => void;
};

export type MouseResizeState = {
  size: PanelSize;
  isResizing: boolean;
  handleResizeStart: (e: React.MouseEvent) => void;
};

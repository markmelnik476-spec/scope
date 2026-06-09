import { useState, useEffect, useCallback } from 'react';
import type React from 'react';
import type { PanelPosition, PanelSize } from '../types/debug-panel';

/**
 * Reusable hook for mouse-drag-to-move panel positioning.
 */
export function useMouseDrag(initialPos: PanelPosition | null, panelSize: PanelSize) {
  const [panelPos, setPanelPos] = useState<PanelPosition | null>(initialPos);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const pos = panelPos ?? {
      x: Math.max(12, window.innerWidth - panelSize.w - 12),
      y: Math.max(12, window.innerHeight - panelSize.h - 56),
    };
    setIsDragging(true);
    setDragStart({ x: e.clientX - pos.x, y: e.clientY - pos.y });
    if (!panelPos) setPanelPos(pos);
  }, [panelPos, panelSize]);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      const x = Math.max(0, Math.min(window.innerWidth - 100, e.clientX - dragStart.x));
      const y = Math.max(0, Math.min(window.innerHeight - 40, e.clientY - dragStart.y));
      setPanelPos({ x, y });
    };
    const onUp = () => setIsDragging(false);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [isDragging, dragStart]);

  return { panelPos, isDragging, handleDragStart };
}

/**
 * Reusable hook for mouse-drag-to-resize panel dimensions.
 */
export function useMouseResize(initialSize: PanelSize) {
  const [panelSize, setPanelSize] = useState<PanelSize>(initialSize);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: 0, h: 0 });

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({ x: e.clientX, y: e.clientY, w: panelSize.w, h: panelSize.h });
  }, [panelSize]);

  useEffect(() => {
    if (!isResizing) return;
    const onMove = (e: MouseEvent) => {
      const dw = e.clientX - resizeStart.x;
      const dh = e.clientY - resizeStart.y;
      setPanelSize({
        w: Math.max(360, Math.min(window.innerWidth - 24, resizeStart.w + dw)),
        h: Math.max(200, Math.min(window.innerHeight - 60, resizeStart.h + dh)),
      });
    };
    const onUp = () => setIsResizing(false);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [isResizing, resizeStart]);

  return { panelSize, isResizing, handleResizeStart };
}

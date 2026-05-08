'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Minus, GripVertical, Square, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const MIN_W = 280;
const MIN_H = 180;
const DRAG_THRESHOLD = 4;
const NO_DRAG_SELECTOR =
  'button, a, input, textarea, select, label, [contenteditable="true"], [data-no-drag]';

export default function Window({
  id,
  title,
  icon: Icon,
  position,
  size,
  zIndex,
  minimized,
  maximized = false,
  onUpdate,
  onClose,
  onMinimize,
  onToggleMaximize,
  onFocus,
  children,
  accent = 'cyan',
}) {
  const [dragging, setDragging] = useState(false);
  const moveRef = useRef(null);
  const upRef = useRef(null);

  const frameStyle = useMemo(() => {
    if (maximized) {
      return {
        left: 12,
        top: 48,
        width: 'calc(100vw - 24px)',
        height: 'calc(100vh - 120px)',
        zIndex,
      };
    }

    return {
      left: position.x,
      top: position.y,
      width: size.w,
      height: size.h,
      zIndex,
    };
  }, [maximized, position.x, position.y, size.h, size.w, zIndex]);

  const startDrag = (e) => {
    if (maximized) return;
    if (e.button !== undefined && e.button !== 0) return;
    if (e.target.closest(NO_DRAG_SELECTOR)) return;
    onFocus?.(id);

    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = { ...position };
    let started = false;

    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (!started) {
        if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
        started = true;
        setDragging(true);
        document.body.style.userSelect = 'none';
      }
      const maxX = window.innerWidth - 80;
      const maxY = window.innerHeight - 60;
      const nx = Math.max(-size.w + 120, Math.min(maxX, startPos.x + dx));
      const ny = Math.max(0, Math.min(maxY, startPos.y + dy));
      onUpdate?.(id, { position: { x: nx, y: ny } });
    };

    const onUp = () => {
      setDragging(false);
      document.body.style.userSelect = '';
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    moveRef.current = onMove;
    upRef.current = onUp;
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const startResize = (dir) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    onFocus?.(id);
    if (maximized) {
      const restoredWidth = Math.max(MIN_W, Math.min(window.innerWidth - 80, size.w));
      const restoredHeight = Math.max(MIN_H, Math.min(window.innerHeight - 120, size.h));
      const nextX = Math.max(24, window.innerWidth - restoredWidth - 24);
      const nextY = Math.max(56, window.innerHeight - restoredHeight - 32);

      onUpdate?.(id, {
        maximized: false,
        position: {
          x: dir.includes('w') ? 24 : nextX,
          y: dir.includes('n') ? 56 : nextY,
        },
        size: {
          w: restoredWidth,
          h: restoredHeight,
        },
      });
      return;
    }

    const startX = e.clientX;
    const startY = e.clientY;
    const start = { ...size, ...position };
    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      let { x, y } = position;
      let w = start.w;
      let h = start.h;
      if (dir.includes('e')) w = Math.max(MIN_W, start.w + dx);
      if (dir.includes('s')) h = Math.max(MIN_H, start.h + dy);
      if (dir.includes('w')) {
        const nw = Math.max(MIN_W, start.w - dx);
        x = start.x + (start.w - nw);
        w = nw;
      }
      if (dir.includes('n')) {
        const nh = Math.max(MIN_H, start.h - dy);
        y = start.y + (start.h - nh);
        h = nh;
      }
      onUpdate?.(id, { size: { w, h }, position: { x, y } });
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  useEffect(() => () => {
    if (moveRef.current) window.removeEventListener('pointermove', moveRef.current);
    if (upRef.current) window.removeEventListener('pointerup', upRef.current);
    document.body.style.userSelect = '';
  }, []);

  const accentRing = {
    cyan: 'shadow-[0_0_0_1px_rgba(103,232,249,0.18),0_30px_80px_-20px_rgba(34,211,238,0.35)]',
    violet: 'shadow-[0_0_0_1px_rgba(167,139,250,0.18),0_30px_80px_-20px_rgba(139,92,246,0.35)]',
    emerald: 'shadow-[0_0_0_1px_rgba(110,231,183,0.18),0_30px_80px_-20px_rgba(16,185,129,0.35)]',
    amber: 'shadow-[0_0_0_1px_rgba(252,211,77,0.18),0_30px_80px_-20px_rgba(245,158,11,0.35)]',
    pink: 'shadow-[0_0_0_1px_rgba(244,114,182,0.18),0_30px_80px_-20px_rgba(236,72,153,0.35)]',
  }[accent] || '';

  return (
    <AnimatePresence>
      {!minimized && (
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ type: 'spring', stiffness: 340, damping: 30 }}
          onPointerDown={(e) => {
            startDrag(e);
            onFocus?.(id);
          }}
          className={cn(
            'absolute rounded-2xl backdrop-blur-xl bg-slate-950/55 border border-white/10 overflow-hidden',
            maximized ? 'rounded-[18px]' : 'rounded-2xl',
            accentRing,
            dragging ? 'cursor-grabbing' : maximized ? 'cursor-default' : 'cursor-grab',
          )}
          style={frameStyle}
        >
          <div
            onDoubleClick={() => onToggleMaximize?.(id)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 select-none border-b border-white/10',
              'bg-gradient-to-r from-white/[0.07] via-white/[0.04] to-transparent',
            )}
          >
            <GripVertical className="w-3.5 h-3.5 text-white/40" />
            {Icon ? <Icon className="w-4 h-4 text-cyan-300" /> : null}
            <span className="text-sm font-medium text-white/85 tracking-wide truncate">{title}</span>
            <div className="ml-auto flex items-center gap-1" data-no-drag>
              <button
                onClick={() => onMinimize?.(id)}
                className="w-7 h-7 inline-flex items-center justify-center rounded-md text-white/70 hover:text-white hover:bg-white/10 transition"
                aria-label="Minimize"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => onToggleMaximize?.(id)}
                className="w-7 h-7 inline-flex items-center justify-center rounded-md text-white/70 hover:text-white hover:bg-white/10 transition"
                aria-label={maximized ? 'Restore' : 'Maximize'}
              >
                {maximized ? <Copy className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => onClose?.(id)}
                className="w-7 h-7 inline-flex items-center justify-center rounded-md text-white/70 hover:text-white hover:bg-rose-500/30 transition"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="h-[calc(100%-40px)] overflow-auto custom-scroll" data-window-content>
            {children}
          </div>

          <div data-no-drag onPointerDown={startResize('n')} className="absolute top-0 left-3 right-3 h-1 cursor-n-resize z-20" />
          <div data-no-drag onPointerDown={startResize('s')} className="absolute bottom-0 left-3 right-3 h-1 cursor-s-resize z-20" />
          <div data-no-drag onPointerDown={startResize('w')} className="absolute top-3 bottom-3 left-0 w-1 cursor-w-resize z-20" />
          <div data-no-drag onPointerDown={startResize('e')} className="absolute top-3 bottom-3 right-0 w-1 cursor-e-resize z-20" />
          <div data-no-drag onPointerDown={startResize('nw')} className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize z-20" />
          <div data-no-drag onPointerDown={startResize('ne')} className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize z-20" />
          <div data-no-drag onPointerDown={startResize('sw')} className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize z-20" />
          <div data-no-drag onPointerDown={startResize('se')} className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize z-20">
            <div className="absolute right-1 bottom-1 w-2 h-2 border-r-2 border-b-2 border-white/30 rounded-sm pointer-events-none" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

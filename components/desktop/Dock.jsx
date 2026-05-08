'use client';

import { motion } from 'framer-motion';
import { Languages } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Dock({ items, onOpen, lang, setLang, openIds, minimizedIds }) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 240, damping: 22 }}
        className="pointer-events-auto flex items-end gap-2 px-3 py-2 rounded-2xl bg-slate-950/55 border border-white/10 backdrop-blur-2xl shadow-[0_30px_80px_-30px_rgba(34,211,238,0.5)]"
      >
        {items.map((it) => {
          const isOpen = openIds.has(it.id);
          const isMinimized = minimizedIds.has(it.id);

          return (
            <button
              key={it.id}
              onClick={() => onOpen(it.id)}
              title={it.label}
              className={cn(
                'group relative flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all',
                'bg-gradient-to-br from-white/[0.06] to-white/[0.02] hover:from-white/[0.14] hover:to-white/[0.06]',
                'border border-white/10 hover:border-white/25 hover:-translate-y-1',
              )}
            >
              <it.icon className={cn('w-5 h-5 transition', isOpen ? 'text-cyan-300' : 'text-white/80 group-hover:text-white')} />
              <span className="mt-0.5 text-[10px] text-white/60 group-hover:text-white/85">{it.label}</span>
              {isOpen ? (
                <span className={cn('absolute -bottom-1 w-1.5 h-1.5 rounded-full', isMinimized ? 'bg-amber-300' : 'bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.9)]')} />
              ) : null}
            </button>
          );
        })}

        <div className="w-px h-10 bg-white/10 mx-1" />

        <button
          onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
          title={lang === 'es' ? 'Switch to English' : 'Cambiar a Español'}
          className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] hover:from-white/[0.14] hover:to-white/[0.06] border border-white/10 hover:border-white/25 transition-all hover:-translate-y-1"
        >
          <Languages className="w-5 h-5 text-violet-300" />
          <span className="mt-0.5 text-[10px] font-semibold text-white/80">{lang.toUpperCase()}</span>
        </button>
      </motion.div>
    </div>
  );
}

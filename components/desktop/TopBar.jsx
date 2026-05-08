'use client';

import { useEffect, useState } from 'react';
import { Wifi, BatteryFull, Volume2, Cpu } from 'lucide-react';

export default function TopBar({ lang, title = 'AI Agents', authSlot = null }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(id);
  }, []);

  const fmt = now.toLocaleString(lang === 'es' ? 'es-ES' : 'en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 h-9 text-[12px] text-white/80 bg-slate-950/45 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center gap-2">
        <div className="relative flex items-center justify-center w-5 h-5 rounded-md bg-gradient-to-br from-cyan-400/30 to-violet-500/30 border border-white/15">
          <Cpu className="w-3 h-3 text-cyan-200" />
        </div>
        <span className="font-semibold tracking-wider text-white/90">TechOps</span>
        <span className="text-white/40">•</span>
        <span className="text-white/60">desktop</span>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 text-white/80 font-medium">
        {title}
      </div>

      <div className="flex items-center gap-3">
        {authSlot}
        <Wifi className="w-3.5 h-3.5" />
        <Volume2 className="w-3.5 h-3.5" />
        <BatteryFull className="w-3.5 h-3.5" />
        <span className="font-medium text-white/85">{fmt}</span>
      </div>
    </div>
  );
}

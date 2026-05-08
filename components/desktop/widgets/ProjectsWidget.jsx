'use client';

import { projects } from '@/lib/portfolio/data';
import { ExternalLink, Boxes } from 'lucide-react';

export default function ProjectsWidget({ lang, t, onOpenProject }) {
  return (
    <div className="p-5 h-full">
      <h2 className="text-lg font-semibold text-white mb-4">{t.projects.title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => onOpenProject?.(p)}
            className="group relative overflow-hidden text-left rounded-xl border border-white/10 hover:border-violet-300/50 bg-white/5 hover:bg-white/[0.08] transition"
          >
            <div
              className="h-28 bg-cover bg-center"
              style={{ backgroundImage: `url(${p.cover})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-3">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-violet-300" />
                <h3 className="text-sm font-medium text-white group-hover:text-violet-200">{p.title}</h3>
                {p.url && <ExternalLink className="w-3 h-3 text-white/60 ml-auto" />}
              </div>
              <p className="mt-1 text-[11px] text-white/65 line-clamp-2">{p.description[lang]}</p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {p.tags.slice(0, 4).map((tg) => (
                  <span key={tg} className="px-1.5 py-0.5 rounded-md text-[10px] bg-violet-400/15 text-violet-200 border border-violet-300/20">{tg}</span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

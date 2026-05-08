'use client';

import { articles } from '@/lib/portfolio/data';
import { Clock, ArrowUpRight } from 'lucide-react';

export default function ArticlesWidget({ lang, t, onOpenArticle }) {
  const list = articles.filter((a) => a.published);
  return (
    <div className="p-5 h-full">
      <h2 className="text-lg font-semibold text-white mb-4">{t.articles.title}</h2>
      {list.length === 0 ? (
        <p className="text-white/60 text-sm">{t.articles.empty}</p>
      ) : (
        <div className="space-y-3">
          {list.map((a) => (
            <button
              key={a.id}
              onClick={() => onOpenArticle?.(a)}
              className="group w-full text-left flex gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/[0.09] border border-white/10 hover:border-cyan-300/40 transition"
            >
              <div
                className="w-20 h-20 shrink-0 rounded-lg bg-cover bg-center border border-white/10"
                style={{ backgroundImage: `url(${a.cover})` }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-cyan-300">
                  <span>{a.category}</span>
                  <span className="text-white/30">•</span>
                  <span>{new Date(a.date).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-GB')}</span>
                </div>
                <h3 className="mt-1 text-sm font-medium text-white group-hover:text-cyan-200 truncate">
                  {a.title[lang]}
                </h3>
                <p className="mt-1 text-xs text-white/65 line-clamp-2">{a.excerpt[lang]}</p>
                <div className="mt-1.5 flex items-center gap-2 text-[11px] text-white/50">
                  <Clock className="w-3 h-3" />
                  {a.readingTime} {t.articles.readingTime}
                  <ArrowUpRight className="w-3 h-3 ml-auto group-hover:text-cyan-300" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
      <div className="mt-4 text-right">
        <a href="/blog" className="text-xs text-cyan-300 hover:underline">{t.articles.viewAll} →</a>
      </div>
    </div>
  );
}

'use client';

import { Clock } from 'lucide-react';

export default function ArticleWidget({ article, lang, t }) {
  if (!article) return null;
  const html = (article.content[lang] || '')
    .replace(/^# (.*)$/gm, '<h1 class="text-xl font-semibold text-white mb-3">$1</h1>')
    .replace(/^## (.*)$/gm, '<h2 class="text-lg font-semibold text-white mt-4 mb-2">$1</h2>')
    .replace(/\n\n/g, '<br/><br/>');
  return (
    <article className="p-5 text-white/85">
      <div
        className="w-full h-44 rounded-xl bg-cover bg-center mb-4 border border-white/10"
        style={{ backgroundImage: `url(${article.cover})` }}
      />
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-cyan-300">
        <span>{article.category}</span>
        <span className="text-white/30">•</span>
        <span>{new Date(article.date).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-GB')}</span>
        <span className="text-white/30">•</span>
        <Clock className="w-3 h-3" />
        <span>{article.readingTime} {t.articles.readingTime}</span>
      </div>
      <h1 className="text-2xl font-semibold text-white mt-2">{article.title[lang]}</h1>
      <p className="mt-2 text-sm text-white/65">{article.excerpt[lang]}</p>
      <div
        className="prose prose-invert mt-4 text-sm text-white/85 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}

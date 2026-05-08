'use client';

import { ExternalLink } from 'lucide-react';

export default function ProjectWidget({ project, lang, t }) {
  if (!project) return null;
  return (
    <div className="p-5 text-white/85">
      <div
        className="w-full h-44 rounded-xl bg-cover bg-center mb-4 border border-white/10"
        style={{ backgroundImage: `url(${project.cover})` }}
      />
      <h1 className="text-2xl font-semibold text-white">{project.title}</h1>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {project.tags.map((tg) => (
          <span key={tg} className="px-2 py-0.5 rounded-md text-[11px] bg-violet-400/15 text-violet-200 border border-violet-300/20">{tg}</span>
        ))}
      </div>
      <p className="mt-3 text-sm text-white/80 leading-relaxed">{project.description[lang]}</p>
      {project.url && (
        <a
          href={project.url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-violet-500 text-slate-950 font-semibold text-sm hover:opacity-90"
        >
          <ExternalLink className="w-4 h-4" />
          {t.actions.visit}
        </a>
      )}
    </div>
  );
}

'use client';

import { profile, experience, education, skills } from '@/lib/portfolio/data';
import { pickLang } from '@/lib/i18n/translations';
import { Briefcase, GraduationCap, Languages as LangIcon, Award, Download } from 'lucide-react';

export default function CVWidget({ lang, t }) {
  return (
    <div className="p-5 h-full text-white/85">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{profile.name}</h2>
          <p className="text-sm text-cyan-300/90">{profile.titles[lang].join(' · ')}</p>
          <p className="text-xs text-white/55 mt-0.5">{profile.location} · {profile.email}</p>
        </div>
        <button
          onClick={() => window.print()}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-300/50 text-xs"
        >
          <Download className="w-3.5 h-3.5" />
          {t.actions.download}
        </button>
      </div>

      <Section icon={Briefcase} title={t.cv.experience}>
        <div className="space-y-3">
          {experience.map((e) => (
            <div key={e.id} className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-white">{pickLang(e.role, lang)}</p>
                <span className="text-[11px] text-cyan-300">{e.period}</span>
              </div>
              <p className="text-xs text-white/60">{e.company}</p>
              <ul className="mt-2 space-y-1 text-xs text-white/75 list-disc pl-4">
                {e.points[lang].map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={GraduationCap} title={t.cv.education}>
        <div className="space-y-2">
          {education.map((e, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <span className="shrink-0 px-2 py-0.5 rounded-md text-[11px] font-mono bg-violet-400/15 text-violet-200 border border-violet-300/20">{e.year}</span>
              <div>
                <p className="text-white">{pickLang(e.title, lang)}</p>
                <p className="text-xs text-white/55">{e.org}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={LangIcon} title={t.cv.languages}>
        <div className="flex flex-wrap gap-2 text-sm">
          <Pill>{lang === 'es' ? 'Español — Nativo' : 'Spanish — Native'}</Pill>
          <Pill>{lang === 'es' ? 'Inglés — C1' : 'English — C1'}</Pill>
        </div>
      </Section>

      <Section icon={Award} title={t.cv.certifications}>
        <Pill>AWS Cloud Practitioner Essentials — 2026</Pill>
      </Section>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <section className="mt-5">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-cyan-300" />
        <h3 className="text-[12px] uppercase tracking-widest text-white/70">{title}</h3>
      </div>
      {children}
    </section>
  );
}
function Pill({ children }) {
  return (
    <span className="px-2.5 py-1 rounded-lg text-xs bg-white/5 border border-white/10 text-white/85">{children}</span>
  );
}

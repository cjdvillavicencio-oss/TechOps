'use client';

import { profile } from '@/lib/portfolio/data';
import { Mail, MapPin, Phone, Linkedin } from 'lucide-react';

export default function AboutWidget({ lang, t }) {
  return (
    <div className="p-5 text-white/85 h-full">
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500 flex items-center justify-center text-2xl font-bold text-slate-900 shadow-[0_0_30px_rgba(34,211,238,0.4)]">
          CD
          <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-emerald-400/90 text-[9px] font-bold text-slate-900">ONLINE</span>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">{profile.name}</h2>
          <p className="text-sm text-cyan-300/90">{profile.titles[lang].join(' · ')}</p>
        </div>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-white/75 whitespace-pre-line">{profile.about[lang]}</p>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        <Row icon={MapPin} value={profile.location} />
        <Row icon={Mail} value={profile.email} href={`mailto:${profile.email}`} />
        <Row icon={Phone} value={profile.phone} href={`tel:${profile.phone.replace(/\s/g,'')}`} />
        <Row icon={Linkedin} value="linkedin.com/in/cdiazvillavicencio" href={profile.linkedin} />
      </div>

      <div className="mt-5 p-3 rounded-xl border border-emerald-300/20 bg-emerald-300/5">
        <p className="text-[12px] uppercase tracking-widest text-emerald-300/80">{t.about.availability}</p>
        <p className="text-sm text-white/85">{profile.availability[lang]}</p>
      </div>
    </div>
  );
}

function Row({ icon: Icon, value, href }) {
  const inner = (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-300/40 transition">
      <Icon className="w-4 h-4 text-cyan-300" />
      <span className="truncate text-white/85">{value}</span>
    </div>
  );
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" data-no-drag>{inner}</a>
  ) : inner;
}

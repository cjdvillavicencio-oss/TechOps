'use client';

import { useState } from 'react';
import { profile } from '@/lib/portfolio/data';
import { Send, Mail, MessageCircle } from 'lucide-react';

const WA_NUMBER = '34632459468';

export default function ContactWidget({ lang, t }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3500);
    setForm({ name: '', email: '', message: '' });
  };

  const waText = encodeURIComponent(
    lang === 'es' ? 'Hola Carlos, te escribo desde tu web TechOps.' : 'Hi Carlos, writing from your TechOps website.',
  );

  return (
    <div className="p-5 h-full">
      <h2 className="text-lg font-semibold text-white mb-4">{t.contact.title}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        <a
          href={`mailto:${profile.email}`}
          data-no-drag
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-400/10 border border-cyan-300/30 text-cyan-200 text-sm hover:bg-cyan-400/15"
        >
          <Mail className="w-4 h-4 shrink-0" />
          <span className="truncate">{profile.email}</span>
        </a>
        <a
          href={`https://wa.me/${WA_NUMBER}?text=${waText}`}
          target="_blank"
          rel="noreferrer"
          data-no-drag
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-400/10 border border-emerald-300/30 text-emerald-200 text-sm hover:bg-emerald-400/15"
        >
          <MessageCircle className="w-4 h-4 shrink-0" />
          <span className="truncate">{lang === 'es' ? 'Escríbeme por WhatsApp' : 'WhatsApp me'}</span>
        </a>
      </div>

      <form onSubmit={submit} className="space-y-3">
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder={t.contact.name}
          className="w-full bg-white/5 border border-white/10 focus:border-cyan-300/60 rounded-lg px-3 py-2 text-sm text-white outline-none"
        />
        <input
          required
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder={t.contact.email}
          className="w-full bg-white/5 border border-white/10 focus:border-cyan-300/60 rounded-lg px-3 py-2 text-sm text-white outline-none"
        />
        <textarea
          required
          rows={4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder={t.contact.message}
          className="w-full bg-white/5 border border-white/10 focus:border-cyan-300/60 rounded-lg px-3 py-2 text-sm text-white outline-none resize-none"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-violet-500 text-slate-950 font-semibold text-sm hover:opacity-90"
        >
          <Send className="w-4 h-4" />
          {t.actions.send}
        </button>
        {sent && <p className="text-emerald-300 text-sm">{t.contact.sent}</p>}
      </form>
    </div>
  );
}

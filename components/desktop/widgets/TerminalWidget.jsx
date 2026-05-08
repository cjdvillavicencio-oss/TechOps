'use client';

import { useEffect, useRef, useState } from 'react';
import { profile } from '@/lib/portfolio/data';

const banner = (lang) => [
  '╔═══════════════════════════════════════╗',
  '║  TechOps Terminal v1.0           ║',
  '╚═══════════════════════════════════════╝',
  lang === 'es' ? "Escribe 'help' para ver comandos." : "Type 'help' to list commands.",
  '',
].join('\n');

const help = {
  es: [
    'Comandos disponibles:',
    '  help            — mostrar esta ayuda',
    '  whoami          — sobre mí',
    '  skills          — listar skills',
    '  contact         — datos de contacto',
    '  ls projects     — listar proyectos',
    '  date            — fecha actual',
    '  clear           — limpiar pantalla',
  ].join('\n'),
  en: [
    'Available commands:',
    '  help            — show this help',
    '  whoami          — about me',
    '  skills          — list skills',
    '  contact         — contact info',
    '  ls projects     — list projects',
    '  date            — current date',
    '  clear           — clear screen',
  ].join('\n'),
};

export default function TerminalWidget({ lang, t }) {
  const [lines, setLines] = useState([banner(lang)]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const run = (cmdRaw) => {
    const cmd = cmdRaw.trim();
    const out = [`carlos@techops ~ $ ${cmdRaw}`];
    if (!cmd) {
      setLines((l) => [...l, ...out]);
      return;
    }
    if (cmd === 'clear') {
      setLines([]);
      return;
    }
    if (cmd === 'help') out.push(help[lang]);
    else if (cmd === 'whoami')
      out.push(`${profile.name} — ${profile.titles[lang].join(', ')}\n${profile.location}`);
    else if (cmd === 'skills') out.push('n8n, Docker, M365, LLMs (GPT/Claude/Gemini), PostgreSQL, Codex, Webhooks, Zendesk, Remedy, AWS…');
    else if (cmd === 'contact') out.push(`email: ${profile.email}\nphone: ${profile.phone}\nlinkedin: ${profile.linkedin}`);
    else if (cmd === 'ls projects') out.push('starxia\nhelpdesk-ai\nauto-onboarding');
    else if (cmd === 'date') out.push(new Date().toString());
    else out.push(lang === 'es' ? `comando no encontrado: ${cmd}` : `command not found: ${cmd}`);
    setLines((l) => [...l, ...out, '']);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    run(input);
    setInput('');
  };

  return (
    <div
      className="h-full p-3 font-mono text-[12.5px] leading-relaxed text-emerald-200 bg-black/60"
      onClick={() => inputRef.current?.focus()}
    >
      {lines.map((l, i) => (
        <pre key={i} className="whitespace-pre-wrap">{l}</pre>
      ))}
      <form onSubmit={onSubmit} className="flex items-center gap-2">
        <span className="text-cyan-300">carlos@techops</span>
        <span className="text-white/40">~</span>
        <span className="text-emerald-400">$</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
          className="flex-1 bg-transparent outline-none text-emerald-100 caret-emerald-300"
          placeholder={t.terminal.hint}
        />
      </form>
      <div ref={endRef} />
    </div>
  );
}

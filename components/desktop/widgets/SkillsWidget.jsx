'use client';

import { skills } from '@/lib/portfolio/data';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Ultra-short definitions (ES/EN) for each skill
const defs = {
  Windows: { es: 'Sistema operativo de Microsoft', en: 'Microsoft operating system' },
  Zendesk: { es: 'Plataforma de tickets y soporte', en: 'Ticketing & support platform' },
  Remedy: { es: 'ITSM de BMC para gestión de incidencias', en: 'BMC ITSM for incident management' },
  'Google Workspace': { es: 'Suite de productividad de Google', en: 'Google productivity suite' },
  'Google Sheets': { es: 'Hojas de cálculo en la nube', en: 'Cloud spreadsheets' },
  'Microsoft 365': { es: 'Suite ofimática en la nube', en: 'Cloud office suite' },
  Excel: { es: 'Hojas de cálculo de Microsoft', en: 'Microsoft spreadsheets' },
  SharePoint: { es: 'Gestión documental colaborativa', en: 'Collaborative document management' },
  'HTML/CSS': { es: 'Lenguajes para estructura y estilo web', en: 'Web structure & styling languages' },
  Git: { es: 'Control de versiones de código', en: 'Source code version control' },
  'VS Code': { es: 'Editor de código de Microsoft', en: 'Microsoft code editor' },
  WordPress: { es: 'CMS para crear webs y blogs', en: 'CMS for websites & blogs' },
  n8n: { es: 'Automatización de flujos open-source', en: 'Open-source workflow automation' },
  ChatGPT: { es: 'Asistente IA de OpenAI', en: 'OpenAI AI assistant' },
  Claude: { es: 'Asistente IA de Anthropic', en: 'Anthropic AI assistant' },
  Gemini: { es: 'Asistente IA de Google', en: 'Google AI assistant' },
  Codex: { es: 'IA generadora de código de OpenAI', en: 'OpenAI code-generation AI' },
  Webhooks: { es: 'Notificaciones HTTP en tiempo real', en: 'Real-time HTTP notifications' },
  Ollama: { es: 'Ejecutar LLMs en local', en: 'Run LLMs locally' },
  Grok: { es: 'IA conversacional de xAI', en: 'xAI conversational AI' },
  Imagine: { es: 'Generador de imágenes con IA', en: 'AI image generator' },
  Docker: { es: 'Contenedores ligeros para apps', en: 'Lightweight app containers' },
  PostgreSQL: { es: 'Base de datos relacional', en: 'Relational database' },
  VirtualBox: { es: 'Virtualización de escritorio', en: 'Desktop virtualization' },
  YCloud: { es: 'API empresarial de WhatsApp', en: 'WhatsApp business API' },
  Easypanel: { es: 'Panel para desplegar apps en VPS', en: 'Panel to deploy apps on VPS' },
  Metabase: { es: 'Dashboards y BI open-source', en: 'Open-source dashboards & BI' },
  Base44: { es: 'Plataforma no-code para apps', en: 'No-code app platform' },
  Lovable: { es: 'Builder de apps con IA', en: 'AI app builder' },
  CapCut: { es: 'Editor de vídeo rápido', en: 'Fast video editor' },
  Emergent: { es: 'Agente full-stack con IA', en: 'Full-stack AI agent' },
  ElevenLabs: { es: 'Voces sintéticas con IA', en: 'AI synthetic voices' },
  Suno: { es: 'Generador de música con IA', en: 'AI music generator' },
  Whisk: { es: 'Mezcla imágenes con IA (Google)', en: 'Google AI image remix' },
};

export default function SkillsWidget({ lang, t }) {
  return (
    <TooltipProvider delayDuration={120}>
      <div className="p-5 h-full">
        <h2 className="text-lg font-semibold text-white mb-4">{t.skills.title}</h2>
        <div className="space-y-4">
          {Object.entries(skills).map(([key, group]) => (
            <div key={key}>
              <p className="text-[11px] uppercase tracking-widest text-cyan-300 mb-2">{group.label[lang]}</p>
              <div className="flex flex-wrap gap-1.5">
                {group.items.map((it) => {
                  const def = defs[it]?.[lang] || (lang === 'es' ? 'Herramienta tecnológica' : 'Tech tool');
                  return (
                    <Tooltip key={it}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          data-no-drag
                          className="px-2.5 py-1 rounded-lg text-xs bg-gradient-to-br from-white/[0.07] to-white/[0.03] text-white/85 border border-white/10 hover:border-cyan-300/50 hover:text-cyan-200 transition cursor-help focus:outline-none focus:border-cyan-300/60"
                        >
                          {it}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        sideOffset={6}
                        className="bg-slate-950/95 border border-cyan-300/30 text-white/90 text-xs px-2.5 py-1.5 rounded-md shadow-[0_0_24px_-4px_rgba(34,211,238,0.4)]"
                      >
                        {def}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}

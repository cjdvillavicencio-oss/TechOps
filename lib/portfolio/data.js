// Portfolio data extracted from CV + mock content for MVP

export const profile = {
  name: 'Carlos Diaz Villavicencio',
  alias: '4codex',
  titles: {
    es: ['Atención al Usuario', 'IT Help Desk', 'Automatización & IA'],
    en: ['User Support', 'IT Help Desk', 'Automation & AI'],
  },
  location: 'Valladolid, España',
  email: 'cjdvillavicencio@gmail.com',
  phone: '+34 632 459 468',
  linkedin: 'https://linkedin.com/in/cdiazvillavicencio',
  website: 'https://www.starxia.com',
  about: {
    es: `Especialista en Soporte Técnico con experiencia en atención al usuario y gestión de incidencias.
Capaz de priorizar, resolver problemas y comunicar soluciones a usuarios de distintos niveles técnicos.
Enfocado en mejora de procesos y automatización con herramientas como n8n, Codex y Claude Code,
con un enfoque estructurado, proactivo y orientado a la mejora continua. Inglés avanzado (C1).`,
    en: `Technical Support specialist with experience in customer service and incident management.
Able to prioritize, solve problems and communicate solutions to users of different technical levels.
Focused on process improvement and automation with tools like n8n, Codex and Claude Code,
with a structured, proactive approach oriented towards continuous improvement. Advanced English (C1).`,
  },
  availability: {
    es: 'Disponibilidad inmediata · L-V · Disponibilidad para viajar',
    en: 'Immediate availability · Mon-Fri · Available to travel',
  },
};

export const experience = [
  {
    id: 'ct-ingenieros',
    company: 'CT Ingenieros',
    period: '2024',
    role: { es: 'Soporte Técnico N1', en: 'Technical Support N1' },
    points: {
      es: [
        'Implementación y configuración de puestos de trabajo en red',
        'Soporte a usuarios (Windows y Microsoft 365)',
        'Resolución de incidencias hardware y software',
        'Configuración de dispositivos móviles corporativos',
        'Mantenimiento de impresoras y escáneres',
      ],
      en: [
        'Implementation and setup of networked workstations',
        'User support (Windows and Microsoft 365)',
        'Hardware and software incident resolution',
        'Configuration of corporate mobile devices',
        'Printer and scanner maintenance',
      ],
    },
  },
  {
    id: 'dxc',
    company: 'DXC Technology',
    period: '2023 — 2024',
    role: { es: 'IT Help Desk N1', en: 'IT Help Desk N1' },
    points: {
      es: [
        'Gestión y resolución de incidencias con herramientas de ticketing y CRM',
        'Soporte a usuarios en Microsoft 365 (Office, Outlook, Teams)',
        'Soporte remoto a usuarios finales',
        'Instalación y configuración de aplicaciones y certificados digitales',
        'Generación de reportes y seguimiento de incidencias en Excel',
      ],
      en: [
        'Incident management and resolution using ticketing and CRM tools',
        'User support on Microsoft 365 (Office, Outlook, Teams)',
        'Remote support for end-users',
        'Application install/config and digital certificates',
        'Reporting and incident tracking in Excel',
      ],
    },
  },
  {
    id: 'indra',
    company: 'Indra BPO Servicios — Madrid',
    period: '2018 — 2023',
    role: { es: 'Atención al Paciente y Soporte Técnico IT N1', en: 'Patient Care & IT Support N1' },
    points: {
      es: [
        'Gestión de citas médicas',
        'Restablecimiento de contraseñas',
        'Gestión y resolución de incidencias técnicas',
        'Soporte remoto',
        'Colaboración con el equipo de soporte de Nivel 2',
      ],
      en: [
        'Medical appointment management',
        'Password resets',
        'Technical incident management & resolution',
        'Remote support',
        'Collaboration with Level 2 support team',
      ],
    },
  },
];

export const education = [
  { year: '2026', title: 'AWS Cloud Practitioner Essentials', org: 'AWS Skill Builder (Online)' },
  { year: '2023', title: { es: 'Programación Web Full Stack', en: 'Full Stack Web Programming' }, org: 'Tu Carrera Digital (Adecco), Madrid' },
  { year: '2017', title: { es: 'Técnico Superior Universitario en Informática', en: 'University Technician in Informatics' }, org: 'UNEFA La Guaira, Venezuela' },
  { year: '2014', title: { es: 'Curso de Inglés', en: 'English Course' }, org: 'ACET CORK, Cork, Irlanda' },
];

export const skills = {
  support: {
    label: { es: 'Soporte', en: 'Support' },
    items: ['Windows', 'Zendesk', 'Remedy', 'Google Workspace', 'Google Sheets', 'Microsoft 365', 'Excel', 'SharePoint'],
  },
  technical: {
    label: { es: 'Técnico', en: 'Technical' },
    items: ['HTML/CSS', 'Git', 'VS Code', 'WordPress'],
  },
  ai: {
    label: { es: 'Automatización & IA', en: 'Automation & AI' },
    items: ['n8n', 'ChatGPT', 'Claude', 'Gemini', 'Codex', 'Webhooks', 'Ollama', 'Grok', 'Imagine'],
  },
  systems: {
    label: { es: 'Sistemas & Infra', en: 'Systems & Infra' },
    items: ['Docker', 'PostgreSQL', 'VirtualBox', 'YCloud', 'Easypanel', 'Metabase'],
  },
  creative: {
    label: { es: 'Creativas / No-code', en: 'Creative / No-code' },
    items: ['Base44', 'Lovable', 'CapCut', 'Emergent', 'ElevenLabs', 'Suno', 'Whisk'],
  },
};

export const projects = [
  {
    id: 'starxia',
    slug: 'starxia',
    title: 'Starxia — SaaS Sandbox',
    cover: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&q=70',
    tags: ['n8n', 'WhatsApp', 'AI', 'Webhooks'],
    description: {
      es: 'Sandbox personal SaaS donde experimento con automatización IA. Demos funcionales de chatbots en WhatsApp y web para probar integraciones reales.',
      en: 'Personal SaaS sandbox to experiment with AI automation. Functional WhatsApp & web chatbot demos to test real integrations.',
    },
    url: 'https://www.starxia.com',
  },
  {
    id: 'helpdesk-ai',
    slug: 'helpdesk-ai',
    title: 'HelpDesk AI Triage',
    cover: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=900&q=70',
    tags: ['n8n', 'LLM', 'Tickets'],
    description: {
      es: 'Sistema de triage de tickets con LLMs que clasifica, prioriza y enruta incidencias automáticamente.',
      en: 'Ticket triage system using LLMs that classifies, prioritises and routes incidents automatically.',
    },
  },
  {
    id: 'auto-onboarding',
    slug: 'auto-onboarding',
    title: 'Auto-Onboarding M365',
    cover: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=900&q=70',
    tags: ['M365', 'PowerShell', 'Automation'],
    description: {
      es: 'Workflow de onboarding/offboarding automatizado en Microsoft 365 con notificaciones y auditoría.',
      en: 'Automated onboarding/offboarding workflow on Microsoft 365 with notifications and audit trail.',
    },
  },
];

export const articles = [
  {
    id: 'a1',
    slug: 'n8n-vs-make-2025',
    title: { es: 'n8n vs Make en 2025: cuál elegir', en: 'n8n vs Make in 2025: which one to choose' },
    excerpt: {
      es: 'Comparativa práctica para Help Desk e IT con casos reales de automatización.',
      en: 'Practical comparison for Help Desk and IT teams with real automation cases.',
    },
    cover: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&q=70',
    category: 'Automation',
    date: '2025-05-12',
    readingTime: 6,
    published: true,
    content: {
      es: `# n8n vs Make en 2025\n\nDespués de un año automatizando flujos de IT con ambas herramientas, aquí va mi conclusión...`,
      en: `# n8n vs Make in 2025\n\nAfter a year automating IT flows with both tools, here is my take...`,
    },
  },
  {
    id: 'a2',
    slug: 'help-desk-ia-prompts',
    title: { es: '5 prompts para tu Help Desk con IA', en: '5 AI prompts for your Help Desk' },
    excerpt: {
      es: 'Plantillas reales para reducir tiempos de respuesta sin perder calidad humana.',
      en: 'Real templates to cut response times without losing the human touch.',
    },
    cover: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=900&q=70',
    category: 'AI',
    date: '2025-04-02',
    readingTime: 4,
    published: true,
    content: {
      es: `# Prompts para Help Desk\n\nEstos prompts los uso cada día para acelerar tickets repetitivos...`,
      en: `# Prompts for Help Desk\n\nThese are prompts I use daily to speed up repetitive tickets...`,
    },
  },
  {
    id: 'a3',
    slug: 'docker-para-soporte',
    title: { es: 'Docker para gente de soporte', en: 'Docker for support folks' },
    excerpt: {
      es: 'Por qué un técnico N1/N2 debería entender contenedores en 2025.',
      en: 'Why an N1/N2 technician should understand containers in 2025.',
    },
    cover: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?w=900&q=70',
    category: 'Systems',
    date: '2025-02-18',
    readingTime: 5,
    published: true,
    content: {
      es: `# Docker para soporte\n\nNo necesitas ser DevOps para sacarle partido a Docker en tu día a día de IT...`,
      en: `# Docker for support\n\nYou don't need to be a DevOps to get value from Docker in your daily IT work...`,
    },
  },
];

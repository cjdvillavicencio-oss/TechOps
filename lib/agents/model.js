export const AGENTS_STORAGE_KEY = 'techops.agents.list.v3';
export const CONVERSATIONS_STORAGE_KEY = 'techops.agents.conversations.v2';

export const COLOR_OPTIONS = [
  {
    key: 'cyan',
    accent: 'cyan',
    gradient: 'from-cyan-300 via-cyan-400 to-teal-300',
    glow: 'shadow-[0_0_36px_rgba(74,222,255,0.55)]',
  },
  {
    key: 'violet',
    accent: 'violet',
    gradient: 'from-violet-300 via-fuchsia-400 to-violet-500',
    glow: 'shadow-[0_0_36px_rgba(192,132,252,0.55)]',
  },
  {
    key: 'amber',
    accent: 'amber',
    gradient: 'from-amber-200 via-amber-300 to-yellow-500',
    glow: 'shadow-[0_0_36px_rgba(250,204,21,0.45)]',
  },
  {
    key: 'emerald',
    accent: 'emerald',
    gradient: 'from-emerald-300 via-teal-300 to-cyan-300',
    glow: 'shadow-[0_0_36px_rgba(52,211,153,0.42)]',
  },
  {
    key: 'pink',
    accent: 'pink',
    gradient: 'from-rose-300 via-pink-400 to-fuchsia-500',
    glow: 'shadow-[0_0_36px_rgba(244,114,182,0.45)]',
  },
];

export const EMOJI_POOL = ['🧠', '🌿', '🧭', '✨', '🚀', '🫶', '🧩', '💡', '🌊', '🔮'];

export const ROLE_OPTIONS = [
  { value: 'customer-support', label: 'Atencion al cliente' },
  { value: 'assistant', label: 'Asistente' },
];

const DEFAULT_ROLE_TYPE = ROLE_OPTIONS[0].value;

const DEFAULT_AGENTS = [
  {
    id: 'vega',
    name: 'Vega',
    roleType: 'assistant',
    avatarValue: '🧠',
    colorKey: 'cyan',
  },
  {
    id: 'lia',
    name: 'Lia',
    roleType: 'assistant',
    avatarValue: '🌿',
    colorKey: 'violet',
  },
  {
    id: 'atlas',
    name: 'Atlas',
    roleType: 'assistant',
    avatarValue: '🧭',
    colorKey: 'amber',
  },
  {
    id: 'nova',
    name: 'Nova',
    roleType: 'assistant',
    avatarValue: '✨',
    colorKey: 'emerald',
  },
];

function normalizeText(value, fallback = '') {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (value && typeof value === 'object') {
    if (typeof value.es === 'string' && value.es.trim()) return value.es.trim();
    if (typeof value.en === 'string' && value.en.trim()) return value.en.trim();
  }
  return fallback;
}

function randomEmoji(index = 0) {
  return EMOJI_POOL[index % EMOJI_POOL.length];
}

function inferRoleType(rawRoleType, rawRole, fallbackRoleType = DEFAULT_ROLE_TYPE) {
  if (ROLE_OPTIONS.some((option) => option.value === rawRoleType)) return rawRoleType;

  const roleText = normalizeText(rawRole, '').toLowerCase();
  if (roleText.includes('atencion') || roleText.includes('cliente')) return 'customer-support';
  if (roleText.includes('assistant') || roleText.includes('asistente')) return 'assistant';

  return fallbackRoleType;
}

export function getColorOption(colorKey) {
  return COLOR_OPTIONS.find((option) => option.key === colorKey) ?? COLOR_OPTIONS[0];
}

export function getRoleLabel(roleType) {
  return ROLE_OPTIONS.find((option) => option.value === roleType)?.label ?? ROLE_OPTIONS[0].label;
}

export function createDefaultAgents() {
  return DEFAULT_AGENTS.map((agent, index) => normalizeAgent(agent, index));
}

export function normalizeAgent(rawAgent, index = 0) {
  const fallback = DEFAULT_AGENTS[index % DEFAULT_AGENTS.length] ?? DEFAULT_AGENTS[0];
  const avatarType =
    rawAgent?.avatarType === 'image' && typeof rawAgent?.avatarValue === 'string' && rawAgent.avatarValue
      ? 'image'
      : 'emoji';
  const roleType = inferRoleType(rawAgent?.roleType, rawAgent?.role, fallback.roleType);

  return {
    id:
      typeof rawAgent?.id === 'string' && rawAgent.id.trim()
        ? rawAgent.id.trim()
        : `agent-${Date.now()}-${index}`,
    name: normalizeText(rawAgent?.name, fallback.name),
    roleType,
    role: getRoleLabel(roleType),
    avatarType,
    avatarValue:
      typeof rawAgent?.avatarValue === 'string' && rawAgent.avatarValue.trim()
        ? rawAgent.avatarValue.trim()
        : randomEmoji(index),
    colorKey: getColorOption(rawAgent?.colorKey ?? fallback.colorKey).key,
    provider: normalizeText(rawAgent?.provider, ''),
    model: normalizeText(rawAgent?.model, ''),
    systemPrompt: normalizeText(rawAgent?.systemPrompt, ''),
    behaviorFileName: normalizeText(rawAgent?.behaviorFileName, ''),
    behaviorFileContent: normalizeText(rawAgent?.behaviorFileContent, ''),
    knowledgeFileName: normalizeText(rawAgent?.knowledgeFileName, ''),
    knowledgeFileContent: normalizeText(rawAgent?.knowledgeFileContent, ''),
    memoryProvider: normalizeText(rawAgent?.memoryProvider, 'google-sheets'),
    memoryStatus: normalizeText(rawAgent?.memoryStatus, 'planned'),
  };
}

export function normalizeAgents(rawAgents) {
  if (!Array.isArray(rawAgents) || !rawAgents.length) {
    return createDefaultAgents();
  }

  return rawAgents.map((agent, index) => normalizeAgent(agent, index));
}

export function normalizeMessage(rawMessage, index = 0) {
  const content =
    typeof rawMessage?.content === 'string'
      ? rawMessage.content
      : typeof rawMessage?.text === 'string'
        ? rawMessage.text
        : '';

  if (!content.trim()) return null;

  const rawRole = rawMessage?.role ?? rawMessage?.sender;
  const role = rawRole === 'assistant' || rawRole === 'agent' ? 'assistant' : 'user';

  return {
    id:
      typeof rawMessage?.id === 'string' && rawMessage.id.trim()
        ? rawMessage.id.trim()
        : `message-${Date.now()}-${index}`,
    role,
    content,
    createdAt:
      typeof rawMessage?.createdAt === 'string' && rawMessage.createdAt
        ? rawMessage.createdAt
        : new Date().toISOString(),
  };
}

export function normalizeConversations(rawConversations, agents) {
  const result = {};

  agents.forEach((agent) => {
    const rawList = Array.isArray(rawConversations?.[agent.id]) ? rawConversations[agent.id] : [];
    result[agent.id] = rawList.map((message, index) => normalizeMessage(message, index)).filter(Boolean);
  });

  return result;
}

export function buildAssistantIntro(agent, lang) {
  const content =
    lang === 'es'
      ? `Soy ${agent.name}. Estoy lista para ayudarte como ${agent.role}.`
      : `I am ${agent.name}. I am ready to help as your ${agent.role}.`;

  return {
    id: `intro-${agent.id}`,
    role: 'assistant',
    content,
    createdAt: new Date().toISOString(),
  };
}

export function buildAssistantReply(agent, text, lang) {
  const content =
    lang === 'es'
      ? `${agent.name} > ${agent.role}\n\nHe recibido: "${text}"\n\nEsta es una respuesta placeholder mientras conectamos el chat real del agente.`
      : `${agent.name} > ${agent.role}\n\nI received: "${text}"\n\nThis is a placeholder response while we wire the real agent chat.`;

  return {
    id: `assistant-${agent.id}-${Date.now()}`,
    role: 'assistant',
    content,
    createdAt: new Date().toISOString(),
  };
}

export function createUserMessage(text) {
  return {
    id: `user-${Date.now()}`,
    role: 'user',
    content: text,
    createdAt: new Date().toISOString(),
  };
}

export function buildCreateAgentDraft() {
  const roleType = DEFAULT_ROLE_TYPE;

  return {
    name: '',
    roleType,
    role: getRoleLabel(roleType),
    avatarType: 'emoji',
    avatarValue: randomEmoji(Math.floor(Math.random() * EMOJI_POOL.length)),
    colorKey: COLOR_OPTIONS[0].key,
    provider: '',
    model: '',
    systemPrompt: '',
    behaviorFileName: '',
    behaviorFileContent: '',
    knowledgeFileName: '',
    knowledgeFileContent: '',
    memoryProvider: 'google-sheets',
    memoryStatus: 'planned',
  };
}

'use client';

import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUp,
  CircleUserRound,
  Bot,
  BookOpen,
  ChevronLeft,
  Database,
  Ellipsis,
  KeyRound,
  Mic,
  Paperclip,
  Pencil,
  Plus,
  SendHorizontal,
  Shuffle,
  TerminalSquare,
  Upload,
  UsersRound,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import TechBackground from './TechBackground';
import TopBar from './TopBar';
import Dock from './Dock';
import Window from './Window';
import TerminalWidget from './widgets/TerminalWidget';
import AccountWindowContent from './AccountWindowContent';
import { translations } from '@/lib/i18n/translations';
import { signIn, signOut, useSession } from 'next-auth/react';
import {
  AGENTS_STORAGE_KEY,
  buildAssistantIntro,
  buildCreateAgentDraft,
  COLOR_OPTIONS,
  CONVERSATIONS_STORAGE_KEY,
  createDefaultAgents,
  createUserMessage,
  EMOJI_POOL,
  getColorOption,
  getRoleLabel,
  normalizeAgent,
  normalizeAgents,
  normalizeConversations,
  ROLE_OPTIONS,
} from '@/lib/agents/model';
import {
  createDefaultAccount,
  getAccountStorageKey,
  getModelOptions,
  getProviderOptions,
  normalizeAccount,
} from '@/lib/account/model';

const LANG_KEY = 'techops.lang';
const TERMINAL_KEY = 'techops.agents.terminal.v1';
const CHAT_KEY = 'techops.agents.chat-window.v1';
const AGENTS_PANEL_KEY = 'techops.agents.panel.v1';
const DESKTOP_SCALE_KEY = 'techops.desktop.scale.v1';

const MIN_DESKTOP_SCALE = 0.72;
const MAX_DESKTOP_SCALE = 1.2;
const DEFAULT_DESKTOP_SCALE = 0.82;

const INITIAL_TERMINAL = {
  open: false,
  minimized: false,
  maximized: false,
  position: { x: 240, y: 132 },
  size: { w: 560, h: 320 },
};

const INITIAL_CREATE_AGENT = {
  open: false,
  minimized: false,
  maximized: false,
  position: { x: 382, y: 146 },
  size: { w: 560, h: 620 },
  zIndex: 32,
};

const INITIAL_ACCOUNT = {
  open: false,
  minimized: false,
  maximized: false,
  position: { x: 420, y: 120 },
  size: { w: 640, h: 560 },
  zIndex: 33,
};

const INITIAL_CHAT = {
  open: false,
  minimized: false,
  maximized: false,
  position: { x: 318, y: 118 },
  size: { w: 760, h: 540 },
  zIndex: 30,
};

function pickRandomEmoji() {
  return EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)];
}

function buildAgentId(name) {
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 24);

  return `${slug || 'agent'}-${Date.now().toString(36)}`;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(new Error('file_read_error'));
    reader.readAsDataURL(file);
  });
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(new Error('file_read_error'));
    reader.readAsText(file);
  });
}

function getWindowPosition(index) {
  return {
    x: INITIAL_CHAT.position.x + index * 34,
    y: INITIAL_CHAT.position.y + index * 22,
  };
}

export default function Desktop() {
  const { data: session } = useSession();
  const [lang, setLang] = useState('es');
  const [isMobile, setIsMobile] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [showRibbon, setShowRibbon] = useState(true);
  const [heroDraft, setHeroDraft] = useState('');
  const [launcherVisible, setLauncherVisible] = useState(true);
  const [terminal, setTerminal] = useState(INITIAL_TERMINAL);
  const [terminalZ, setTerminalZ] = useState(20);
  const [createAgentWindow, setCreateAgentWindow] = useState(INITIAL_CREATE_AGENT);
  const [accountWindow, setAccountWindow] = useState(INITIAL_ACCOUNT);
  const [showCreateAgentMobile, setShowCreateAgentMobile] = useState(false);
  const [chatWindows, setChatWindows] = useState({});
  const [windowZ, setWindowZ] = useState(30);
  const [agents, setAgents] = useState(() => createDefaultAgents());
  const [conversationsByAgentId, setConversationsByAgentId] = useState({});
  const [draftsByAgent, setDraftsByAgent] = useState({});
  const [createAgentDraft, setCreateAgentDraft] = useState(() => buildCreateAgentDraft());
  const [createAgentError, setCreateAgentError] = useState('');
  const [createAgentMode, setCreateAgentMode] = useState('create');
  const [editingAgentId, setEditingAgentId] = useState(null);
  const [createAgentTab, setCreateAgentTab] = useState('profile');
  const [agentEditor, setAgentEditor] = useState(null);
  const [renameState, setRenameState] = useState(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [avatarEditor, setAvatarEditor] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [deleteConfirmAgentId, setDeleteConfirmAgentId] = useState(null);
  const [account, setAccount] = useState(() => createDefaultAccount());
  const [desktopScale, setDesktopScale] = useState(DEFAULT_DESKTOP_SCALE);
  const [sidebarPanel, setSidebarPanel] = useState(null);
  const [rolesPanelTab, setRolesPanelTab] = useState('roles');
  const [toast, setToast] = useState('');
  const [sendingAgentId, setSendingAgentId] = useState(null);
  const desktopViewportRef = useRef(null);

  const t = translations[lang];
  const agentsById = useMemo(() => {
    const map = new Map();
    agents.forEach((agent) => map.set(agent.id, agent));
    return map;
  }, [agents]);
  const openAgentWindows = useMemo(
    () => agents.filter((agent) => chatWindows[agent.id]?.open),
    [agents, chatWindows],
  );

  useEffect(() => {
    document.body.classList.add('desktop-mode');
    const timer = setTimeout(() => setShowRibbon(false), 3200);
    return () => {
      document.body.classList.remove('desktop-mode');
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(LANG_KEY);
      if (savedLang === 'es' || savedLang === 'en') setLang(savedLang);

      const savedTerminal = localStorage.getItem(TERMINAL_KEY);
      if (savedTerminal) {
        setTerminal({ ...INITIAL_TERMINAL, ...JSON.parse(savedTerminal) });
      }

      const savedAgents = localStorage.getItem(AGENTS_STORAGE_KEY);
      const loadedAgents = normalizeAgents(savedAgents ? JSON.parse(savedAgents) : null);
      setAgents(loadedAgents);

      const savedConversations = localStorage.getItem(CONVERSATIONS_STORAGE_KEY);
      setConversationsByAgentId(
        normalizeConversations(savedConversations ? JSON.parse(savedConversations) : null, loadedAgents),
      );

      const savedChat = localStorage.getItem(CHAT_KEY);
      if (savedChat) {
        const parsed = JSON.parse(savedChat);
        const restored = {};
        loadedAgents.forEach((agent, index) => {
          if (parsed[agent.id]) {
            restored[agent.id] = {
              ...INITIAL_CHAT,
              ...parsed[agent.id],
              open: false,
              minimized: false,
              position: parsed[agent.id].position ?? getWindowPosition(index),
            };
          }
        });
        setChatWindows(restored);
      }

      const savedPanel = localStorage.getItem(AGENTS_PANEL_KEY);
      if (savedPanel === 'hidden') setLauncherVisible(false);

      const savedScale = Number.parseFloat(localStorage.getItem(DESKTOP_SCALE_KEY) || '');
      if (Number.isFinite(savedScale)) {
        setDesktopScale(Math.min(MAX_DESKTOP_SCALE, Math.max(MIN_DESKTOP_SCALE, savedScale)));
      }
    } catch {}

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(LANG_KEY, lang);
      localStorage.setItem(TERMINAL_KEY, JSON.stringify(terminal));
      localStorage.setItem(CHAT_KEY, JSON.stringify(chatWindows));
      localStorage.setItem(AGENTS_PANEL_KEY, launcherVisible ? 'visible' : 'hidden');
      localStorage.setItem(DESKTOP_SCALE_KEY, String(desktopScale));
      localStorage.setItem(AGENTS_STORAGE_KEY, JSON.stringify(agents));
      localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(conversationsByAgentId));
    } catch {}
  }, [agents, chatWindows, conversationsByAgentId, desktopScale, hydrated, lang, launcherVisible, terminal]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (lang !== 'es') {
      setLang('es');
    }
  }, [lang, session?.user?.email]);

  useEffect(() => {
    if (!session?.user?.email) {
      setAccount(createDefaultAccount());
      return;
    }

    try {
      const saved = localStorage.getItem(getAccountStorageKey(session.user.email));
      setAccount(normalizeAccount(saved ? JSON.parse(saved) : null, session.user.email));
    } catch {
      setAccount(createDefaultAccount(session.user.email));
    }
  }, [session?.user?.email]);

  useEffect(() => {
    if (!hydrated || !session?.user?.email) return;

    try {
      localStorage.setItem(getAccountStorageKey(session.user.email), JSON.stringify(account));
    } catch {}
  }, [account, hydrated, session?.user?.email]);

  useEffect(() => {
    if (openAgentWindows.length === 0 && !createAgentWindow.open && !showCreateAgentMobile) {
      setLauncherVisible(true);
    }
  }, [createAgentWindow.open, openAgentWindows.length, showCreateAgentMobile]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeoutId = window.setTimeout(() => setToast(''), 4200);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const getNextWindowZ = useCallback(() => {
    let nextValue = 0;
    setWindowZ((current) => {
      nextValue = current + 1;
      return nextValue;
    });
    return nextValue;
  }, []);

  const ensureConversation = useCallback((agent) => {
    setConversationsByAgentId((current) => {
      if (current[agent.id]?.length) return current;
      return {
        ...current,
        [agent.id]: [buildAssistantIntro(agent, lang)],
      };
    });
  }, [lang]);

  const focusTerminal = useCallback(() => {
    setTerminalZ((current) => current + 1);
  }, []);

  const focusCreateAgent = useCallback(() => {
    const nextZ = getNextWindowZ();
    setCreateAgentWindow((current) => ({ ...current, zIndex: nextZ }));
  }, [getNextWindowZ]);

  const focusAccount = useCallback(() => {
    const nextZ = getNextWindowZ();
    setAccountWindow((current) => ({ ...current, zIndex: nextZ }));
  }, [getNextWindowZ]);

  const focusAgentWindow = useCallback((agentId) => {
    const nextZ = getNextWindowZ();
    setChatWindows((current) => ({
      ...current,
      [agentId]: {
        ...(current[agentId] ?? INITIAL_CHAT),
        zIndex: nextZ,
      },
    }));
  }, [getNextWindowZ]);

  const closeInlineEditors = useCallback(() => {
    setRenameState(null);
    setRenameDraft('');
    setAvatarEditor(null);
    setAgentEditor(null);
    setContextMenu(null);
  }, []);

  const requestGoogleSheetsAccess = useCallback(() => {
    setToast(t.agents.sheetsReconnect);
    signIn(
      'google',
      { callbackUrl: window.location.href },
      {
        scope: `openid email profile https://www.googleapis.com/auth/spreadsheets`,
        prompt: 'consent',
        access_type: 'offline',
      },
    );
  }, [t.agents.sheetsReconnect]);

  const openAccountWindow = useCallback(() => {
    setAccountWindow((current) => ({
      ...current,
      open: true,
      minimized: false,
      zIndex: getNextWindowZ(),
    }));
  }, [getNextWindowZ]);

  const openCreateAgent = useCallback(() => {
    closeInlineEditors();
    setCreateAgentError('');
    setCreateAgentMode('create');
    setEditingAgentId(null);
    setCreateAgentTab('profile');
    setCreateAgentDraft(buildCreateAgentDraft());
    if (isMobile) {
      setShowCreateAgentMobile(true);
      return;
    }
    const baseName = t.agents.newAgentBaseName;
    const nextNumber =
      agents.filter((agent) => agent.name.toLowerCase().startsWith(baseName.toLowerCase())).length + 1;
    const createdAgent = normalizeAgent(
      {
        id: buildAgentId(`${baseName}-${nextNumber}`),
        name: `${baseName} ${nextNumber}`,
        roleType: ROLE_OPTIONS[0].value,
        avatarType: 'emoji',
        avatarValue: pickRandomEmoji(),
        colorKey: COLOR_OPTIONS[agents.length % COLOR_OPTIONS.length].key,
      },
      agents.length,
    );

    startTransition(() => {
      setAgents((current) => [...current, createdAgent]);
      setConversationsByAgentId((current) => ({ ...current, [createdAgent.id]: current[createdAgent.id] ?? [] }));
      setChatWindows((current) => ({
        ...current,
        [createdAgent.id]: current[createdAgent.id] ?? {
          ...INITIAL_CHAT,
          position: getWindowPosition(agents.length),
        },
      }));
    });
    setToast(`${createdAgent.name} listo para conversar.`);
  }, [agents, closeInlineEditors, isMobile, t.agents.newAgentBaseName]);

  const closeCreateAgent = useCallback(() => {
    setCreateAgentError('');
    setCreateAgentWindow((current) => ({ ...current, open: false, minimized: false }));
    setShowCreateAgentMobile(false);
    setCreateAgentMode('create');
    setEditingAgentId(null);
    setCreateAgentTab('profile');
  }, []);

  const openEditAgent = useCallback((agent, tab = 'profile') => {
    closeInlineEditors();
    setCreateAgentError('');
    setCreateAgentMode('edit');
    setEditingAgentId(agent.id);
    setCreateAgentTab(tab);
    setCreateAgentDraft({
      name: agent.name,
      role: agent.role,
      avatarType: agent.avatarType,
      avatarValue: agent.avatarValue,
      colorKey: agent.colorKey,
      provider: agent.provider ?? '',
      model: agent.model ?? '',
      systemPrompt: agent.systemPrompt ?? '',
      roleType: agent.roleType,
      behaviorFileName: agent.behaviorFileName ?? '',
      behaviorFileContent: agent.behaviorFileContent ?? '',
      knowledgeFileName: agent.knowledgeFileName ?? '',
      knowledgeFileContent: agent.knowledgeFileContent ?? '',
      memoryProvider: agent.memoryProvider ?? 'google-sheets',
      memoryStatus: agent.memoryStatus ?? 'planned',
    });
    if (isMobile) {
      setShowCreateAgentMobile(true);
      return;
    }
    setCreateAgentWindow((current) => ({
      ...current,
      open: true,
      minimized: false,
      zIndex: getNextWindowZ(),
    }));
  }, [closeInlineEditors, getNextWindowZ, isMobile]);

  const updateAgent = useCallback((agentId, patch) => {
    startTransition(() => {
      setAgents((current) =>
        current.map((agent) => (agent.id === agentId ? normalizeAgent({ ...agent, ...patch }) : agent)),
      );
    });
  }, []);

  const deleteAgent = useCallback((agentId) => {
    startTransition(() => {
      setAgents((current) => current.filter((agent) => agent.id !== agentId));
      setConversationsByAgentId((current) => {
        const next = { ...current };
        delete next[agentId];
        return next;
      });
      setChatWindows((current) => {
        const next = { ...current };
        delete next[agentId];
        return next;
      });
      setDraftsByAgent((current) => {
        const next = { ...current };
        delete next[agentId];
        return next;
      });
    });

    if (editingAgentId === agentId) {
      closeCreateAgent();
    }

    setAgentEditor((current) => (current?.agentId === agentId ? null : current));
    setDeleteConfirmAgentId(null);
    setContextMenu(null);
    setRenameState(null);
    setAvatarEditor(null);
  }, [closeCreateAgent, editingAgentId]);

  const openChatForAgent = useCallback((agent, seedText = '') => {
    ensureConversation(agent);
    const nextZ = getNextWindowZ();
    const index = agents.findIndex((item) => item.id === agent.id);
    setChatWindows((current) => ({
      ...current,
      [agent.id]: {
        ...INITIAL_CHAT,
        ...(current[agent.id] ?? {}),
        open: true,
        minimized: false,
        zIndex: nextZ,
        position: current[agent.id]?.position ?? getWindowPosition(index < 0 ? 0 : index),
      },
    }));
    setDraftsByAgent((current) => ({ ...current, [agent.id]: seedText }));
    setLauncherVisible(false);
    setShowCreateAgentMobile(false);
    closeInlineEditors();
  }, [agents, closeInlineEditors, ensureConversation, getNextWindowZ]);

  const appendAssistantSystemMessage = useCallback((agentId, content) => {
    setConversationsByAgentId((current) => ({
      ...current,
      [agentId]: [
        ...(current[agentId] ?? []),
        {
          id: `assistant-${agentId}-${Date.now()}`,
          role: 'assistant',
          content,
          createdAt: new Date().toISOString(),
        },
      ],
    }));
  }, []);

  const appendExchange = useCallback(async (agent, text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (!session?.user?.email) {
      setToast(t.agents.noCredits);
      return;
    }

    if (account.creditsUsd < account.responseCostUsd) {
      setToast(t.agents.noCredits);
      return;
    }

    const userMessage = createUserMessage(trimmed);
    const previousConversation =
      conversationsByAgentId[agent.id]?.length
        ? conversationsByAgentId[agent.id]
        : [buildAssistantIntro(agent, lang)];
    const nextConversation = [...previousConversation, userMessage];

    setConversationsByAgentId((current) => ({
      ...current,
      [agent.id]: nextConversation,
    }));
    setSendingAgentId(agent.id);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent,
          message: trimmed,
          conversation: nextConversation,
          conversationId: `conv_${agent.id}`,
          creditsCharged: account.responseCostUsd,
          availableCredits: account.creditsUsd,
          sheetId: account.settings.sheets.sheetId,
          sheetTab: account.settings.sheets.sheetTab,
          userEmail: session.user.email,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 402) {
          setToast(payload.message || t.agents.noCredits);
        } else if (response.status === 401) {
          setToast(t.agents.noCredits);
        } else {
          setToast(payload.error || 'No se pudo enviar el mensaje al agente.');
        }
        appendAssistantSystemMessage(
          agent.id,
          payload.message || 'El chat no pudo completarse ahora mismo. Prueba de nuevo.',
        );
        return;
      }

      setConversationsByAgentId((current) => ({
        ...current,
        [agent.id]: [
          ...(current[agent.id] ?? nextConversation),
          {
            id: `assistant-${agent.id}-${Date.now()}`,
            role: 'assistant',
            content: payload.reply,
            createdAt: new Date().toISOString(),
          },
        ],
      }));

      setAccount((current) => ({
        ...current,
        creditsUsd:
          typeof payload.creditsUsd === 'number'
            ? payload.creditsUsd
            : Math.max(0, Number((current.creditsUsd - current.responseCostUsd).toFixed(4))),
        totalUsageUsd:
          typeof payload.totalUsageUsd === 'number'
            ? payload.totalUsageUsd
            : Number((current.totalUsageUsd + current.responseCostUsd).toFixed(4)),
        promptCount:
          typeof payload.promptCount === 'number' ? payload.promptCount : current.promptCount + 1,
        settings: {
          ...current.settings,
          sheets: {
            ...current.settings.sheets,
            sheetId: payload.sheetId || current.settings.sheets.sheetId,
            sheetTab: payload.sheetTab || current.settings.sheets.sheetTab,
            connectionMethod: 'google-oauth',
          },
        },
      }));

      if (payload.needsGoogleSheetsAuth) {
        requestGoogleSheetsAccess();
      } else if (payload.sheetWarning) {
        console.warn(payload.sheetWarning);
        setToast(payload.sheetWarning || t.agents.sheetsFailed);
      } else if (payload.sheetId) {
        setToast(t.agents.sheetsSaved);
      }
    } catch (error) {
      console.error('Chat send failed:', error);
      setToast('No se pudo conectar con el chat del agente.');
      appendAssistantSystemMessage(
        agent.id,
        'He recibido tu mensaje, pero no pude responder desde el servidor en este intento.',
      );
    } finally {
      setSendingAgentId((current) => (current === agent.id ? null : current));
    }
  }, [
    account.creditsUsd,
    account.responseCostUsd,
    account.settings.sheets.sheetId,
    account.settings.sheets.sheetTab,
    appendAssistantSystemMessage,
    conversationsByAgentId,
    lang,
    requestGoogleSheetsAccess,
    session?.user?.email,
    t.agents.noCredits,
    t.agents.sheetsFailed,
    t.agents.sheetsSaved,
  ]);

  const handleHeroSubmit = useCallback((event) => {
    event.preventDefault();
    const trimmed = heroDraft.trim();
    if (!trimmed) return;

    const atlas = agentsById.get('atlas') ?? agents[0];
    if (!atlas) return;

    openChatForAgent(atlas);
    void appendExchange(atlas, trimmed);
    setHeroDraft('');
  }, [agents, agentsById, appendExchange, heroDraft, openChatForAgent]);

  const handleChatSubmit = useCallback((event, agentId) => {
    event.preventDefault();
    const agent = agentsById.get(agentId);
    if (!agent) return;

    const trimmed = (draftsByAgent[agentId] ?? '').trim();
    if (!trimmed) return;

    void appendExchange(agent, trimmed);
    setDraftsByAgent((current) => ({ ...current, [agentId]: '' }));
  }, [agentsById, appendExchange, draftsByAgent]);

  const handleCreateAgentField = useCallback((field, value) => {
    setCreateAgentDraft((current) => {
      if (field === 'roleType') {
        return {
          ...current,
          roleType: value,
          role: getRoleLabel(value),
        };
      }

      return { ...current, [field]: value };
    });
    setCreateAgentError('');
  }, []);

  const handleCreateAgentFile = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024 * 1.5) {
      setCreateAgentError(t.agents.create.errors.fileTooLarge);
      event.target.value = '';
      return;
    }

    try {
      const image = await readFileAsDataUrl(file);
      setCreateAgentDraft((current) => ({
        ...current,
        avatarType: 'image',
        avatarValue: image,
      }));
      setCreateAgentError('');
    } catch {
      setCreateAgentError(t.agents.create.errors.fileRead);
    } finally {
      event.target.value = '';
    }
  }, [t.agents.create.errors.fileRead, t.agents.create.errors.fileTooLarge]);

  const handleSaveCreatedAgent = useCallback((event) => {
    event.preventDefault();

    if (!createAgentDraft.name.trim()) {
      setCreateAgentError(t.agents.create.errors.nameRequired);
      return;
    }

    if (!createAgentDraft.role.trim()) {
      setCreateAgentError(t.agents.create.errors.roleRequired);
      return;
    }

    const avatarValue = createAgentDraft.avatarValue.trim() || pickRandomEmoji();
    const normalizedDraft = {
      name: createAgentDraft.name,
      roleType: createAgentDraft.roleType,
      avatarType: createAgentDraft.avatarType,
      avatarValue,
      colorKey: createAgentDraft.colorKey,
      provider: createAgentDraft.provider,
      model: createAgentDraft.model,
      systemPrompt: createAgentDraft.systemPrompt,
      behaviorFileName: createAgentDraft.behaviorFileName,
      behaviorFileContent: createAgentDraft.behaviorFileContent,
      knowledgeFileName: createAgentDraft.knowledgeFileName,
      knowledgeFileContent: createAgentDraft.knowledgeFileContent,
      memoryProvider: createAgentDraft.memoryProvider,
      memoryStatus: createAgentDraft.memoryStatus,
    };

    if (createAgentMode === 'edit' && editingAgentId) {
      startTransition(() => {
        setAgents((current) =>
          current.map((agent) =>
            agent.id === editingAgentId
              ? normalizeAgent({ ...agent, ...normalizedDraft }, agents.length)
              : agent,
          ),
        );
      });
    } else {
      const createdAgent = normalizeAgent({
        id: buildAgentId(createAgentDraft.name),
        ...normalizedDraft,
      }, agents.length);

      startTransition(() => {
        setAgents((current) => [...current, createdAgent]);
        setConversationsByAgentId((current) => ({ ...current, [createdAgent.id]: [] }));
        setChatWindows((current) => ({
          ...current,
          [createdAgent.id]: {
            ...INITIAL_CHAT,
            position: getWindowPosition(agents.length),
          },
        }));
      });
    }

    setCreateAgentDraft(buildCreateAgentDraft());
    setCreateAgentError('');
    closeCreateAgent();
  }, [agents.length, closeCreateAgent, createAgentDraft, createAgentMode, editingAgentId, t.agents.create.errors.nameRequired, t.agents.create.errors.roleRequired]);

  const openRename = useCallback((agent, field) => {
    setAvatarEditor(null);
    setRenameState({ agentId: agent.id, field });
    setRenameDraft(field === 'name' ? agent.name : agent.role);
  }, []);

  const saveRename = useCallback(() => {
    if (!renameState) return;
    const value = renameDraft.trim();
    if (!value) return;

    updateAgent(renameState.agentId, {
      [renameState.field]: value,
    });
    setRenameState(null);
    setRenameDraft('');
  }, [renameDraft, renameState, updateAgent]);

  const openAgentEditor = useCallback((agentId, tab = 'profile') => {
    setRenameState(null);
    setRenameDraft('');
    setAvatarEditor(null);
    setContextMenu(null);
    setAgentEditor({ agentId, tab, error: '' });
  }, []);

  const updateAgentEditorField = useCallback((agentId, field, value) => {
    if (field === 'roleType') {
      updateAgent(agentId, { roleType: value });
      return;
    }

    updateAgent(agentId, { [field]: value });
  }, [updateAgent]);

  const handleAgentKnowledgeFile = useCallback(async (event, agentId, fileKind) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await readFileAsText(file);
      updateAgent(agentId, {
        [fileKind === 'behavior' ? 'behaviorFileName' : 'knowledgeFileName']: file.name,
        [fileKind === 'behavior' ? 'behaviorFileContent' : 'knowledgeFileContent']: content,
      });
      setAgentEditor((current) => (current?.agentId === agentId ? { ...current, error: '' } : current));
    } catch {
      setAgentEditor((current) =>
        current?.agentId === agentId
          ? { ...current, error: t.agents.create.errors.fileRead }
          : current,
      );
    } finally {
      event.target.value = '';
    }
  }, [t.agents.create.errors.fileRead, updateAgent]);

  const openAvatarEditor = useCallback((agent) => {
    setRenameState(null);
    setRenameDraft('');
    setAvatarEditor({
      agentId: agent.id,
      avatarType: agent.avatarType,
      avatarValue: agent.avatarValue,
      error: '',
    });
  }, []);

  const handleAvatarEditorFile = useCallback(async (event, agentId) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024 * 1.5) {
      setAvatarEditor((current) =>
        current?.agentId === agentId
          ? { ...current, error: t.agents.create.errors.fileTooLarge }
          : current,
      );
      event.target.value = '';
      return;
    }

    try {
      const image = await readFileAsDataUrl(file);
      setAvatarEditor((current) =>
        current?.agentId === agentId
          ? { ...current, avatarType: 'image', avatarValue: image, error: '' }
          : current,
      );
    } catch {
      setAvatarEditor((current) =>
        current?.agentId === agentId
          ? { ...current, error: t.agents.create.errors.fileRead }
          : current,
      );
    } finally {
      event.target.value = '';
    }
  }, [t.agents.create.errors.fileRead, t.agents.create.errors.fileTooLarge]);

  const saveAvatarEditor = useCallback(() => {
    if (!avatarEditor) return;
    const nextValue = avatarEditor.avatarValue.trim() || pickRandomEmoji();
    updateAgent(avatarEditor.agentId, {
      avatarType: avatarEditor.avatarType,
      avatarValue: nextValue,
    });
    setAvatarEditor(null);
  }, [avatarEditor, updateAgent]);

  const updateAccountApiKey = useCallback((providerKey, value) => {
    setAccount((current) => ({
      ...current,
      apiKeys: {
        ...current.apiKeys,
        [providerKey]: value,
      },
    }));
  }, []);

  const updateAccountSetting = useCallback((settingKey, value) => {
    setAccount((current) => ({
      ...current,
      settings: {
        ...current.settings,
        [settingKey]: value,
      },
    }));
  }, []);

  const updateAccountSheetSetting = useCallback((settingKey, value) => {
    setAccount((current) => ({
      ...current,
      settings: {
        ...current.settings,
        sheets: {
          ...current.settings.sheets,
          [settingKey]: value,
        },
      },
    }));
  }, []);

  const adjustDesktopScale = useCallback((delta) => {
    setDesktopScale((current) => {
      const next = Math.min(MAX_DESKTOP_SCALE, Math.max(MIN_DESKTOP_SCALE, current + delta));
      return Number(next.toFixed(2));
    });
  }, []);

  const updateTerminal = useCallback((_, patch) => {
    setTerminal((current) => ({ ...current, ...patch }));
  }, []);

  const updateCreateAgentWindow = useCallback((_, patch) => {
    setCreateAgentWindow((current) => ({ ...current, ...patch }));
  }, []);

  const updateChatWindow = useCallback((agentId, patch) => {
    setChatWindows((current) => ({
      ...current,
      [agentId]: {
        ...(current[agentId] ?? INITIAL_CHAT),
        ...patch,
      },
    }));
  }, []);

  const toggleTerminalMaximize = useCallback(() => {
    setTerminal((current) => ({ ...current, maximized: !current.maximized }));
    focusTerminal();
  }, [focusTerminal]);

  const toggleCreateAgentMaximize = useCallback(() => {
    const nextZ = getNextWindowZ();
    setCreateAgentWindow((current) => ({
      ...current,
      maximized: !current.maximized,
      zIndex: nextZ,
    }));
  }, [getNextWindowZ]);

  const toggleChatMaximize = useCallback((agentId) => {
    const nextZ = getNextWindowZ();
    setChatWindows((current) => ({
      ...current,
      [agentId]: {
        ...(current[agentId] ?? INITIAL_CHAT),
        maximized: !current[agentId]?.maximized,
        zIndex: nextZ,
      },
    }));
  }, [getNextWindowZ]);

  const exportConversation = useCallback((agent) => {
    const messages = conversationsByAgentId[agent.id] ?? [];
    if (!messages.length) {
      setToast('Todavia no hay mensajes para exportar.');
      return;
    }

    const fileContent = messages
      .map((message) => {
        const sender = message.role === 'user' ? 'Usuario' : agent.name;
        return `[${message.createdAt}] ${sender}\n${message.content}\n`;
      })
      .join('\n');

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${agent.name.toLowerCase()}-chat.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }, [conversationsByAgentId]);

  const dockItems = useMemo(
    () => [
      { id: 'agents', label: t.dock.agents, icon: Bot },
      { id: 'account', label: 'Cuenta', icon: CircleUserRound },
      { id: 'terminal', label: t.dock.terminal, icon: TerminalSquare },
    ],
    [t],
  );

  const openIds = useMemo(() => {
    const ids = [];
    if (terminal.open) ids.push('terminal');
    if (accountWindow.open) ids.push('account');
    return new Set(ids);
  }, [accountWindow.open, terminal.open]);
  const minimizedIds = useMemo(
    () => {
      const ids = [];
      if (terminal.open && terminal.minimized) ids.push('terminal');
      if (accountWindow.open && accountWindow.minimized) ids.push('account');
      return new Set(ids);
    },
    [accountWindow.minimized, accountWindow.open, terminal.minimized, terminal.open],
  );
  const hasDesktopWindowOpen =
    createAgentWindow.open || accountWindow.open || terminal.open || openAgentWindows.length > 0;
  const desktopZoomWidth = `${100 / desktopScale}%`;

  if (isMobile) {
    const firstOpenAgent = openAgentWindows[0] ?? null;

    return (
      <MobileAgentsView
        lang={lang}
        setLang={setLang}
        t={t}
        activeAgent={firstOpenAgent}
        showCreateAgent={showCreateAgentMobile}
        agents={agents}
        messages={firstOpenAgent ? conversationsByAgentId[firstOpenAgent.id] ?? [] : []}
        heroDraft={heroDraft}
        chatDraft={firstOpenAgent ? draftsByAgent[firstOpenAgent.id] ?? '' : ''}
        renameState={renameState}
        renameDraft={renameDraft}
        avatarEditor={avatarEditor}
        createAgentDraft={createAgentDraft}
        createAgentError={createAgentError}
        createAgentMode={createAgentMode}
        createAgentTab={createAgentTab}
        setHeroDraft={setHeroDraft}
        setChatDraft={(value) => {
          if (!firstOpenAgent) return;
          setDraftsByAgent((current) => ({ ...current, [firstOpenAgent.id]: value }));
        }}
        onHeroSubmit={handleHeroSubmit}
        onChatSubmit={(event) => {
          if (!firstOpenAgent) return;
          handleChatSubmit(event, firstOpenAgent.id);
        }}
        onActivateAgent={openChatForAgent}
        onOpenCreateAgent={openCreateAgent}
        onCloseCreateAgent={closeCreateAgent}
        onCloseChat={() => {
          if (!firstOpenAgent) return;
          setChatWindows((current) => ({
            ...current,
            [firstOpenAgent.id]: {
              ...(current[firstOpenAgent.id] ?? INITIAL_CHAT),
              open: false,
              minimized: false,
            },
          }));
        }}
        onCreateAgentField={handleCreateAgentField}
        onCreateAgentFile={handleCreateAgentFile}
        onSaveCreateAgent={handleSaveCreatedAgent}
        onCreateAgentTabChange={setCreateAgentTab}
        onOpenRename={openRename}
        onRenameDraftChange={setRenameDraft}
        onRenameSave={saveRename}
        onRenameCancel={() => setRenameState(null)}
        onOpenAvatarEditor={openAvatarEditor}
        onAvatarEditorChange={setAvatarEditor}
        onAvatarEditorFile={handleAvatarEditorFile}
        onAvatarEditorSave={saveAvatarEditor}
        onAvatarEditorCancel={() => setAvatarEditor(null)}
      />
    );
  }
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-white">
      <TechBackground />
      <TopBar
        lang={lang}
        title={t.agents.modeTitle}
        authSlot={
          <div className="flex items-center gap-2">
            <div className="rounded-full border border-cyan-300/15 bg-cyan-400/[0.08] px-3 py-1.5 text-[11px] text-cyan-100/90">
              {t.account.credits}: ${account.creditsUsd.toFixed(4)}
            </div>
            {session?.user ? (
              <button
                type="button"
                onClick={openAccountWindow}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11px] text-white/78"
              >
                {session.user.image ? (
                  <img src={session.user.image} alt={session.user.name || 'Usuario'} className="h-5 w-5 rounded-full object-cover" />
                ) : (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.08] text-[10px]">
                    {session.user.name?.[0] || 'U'}
                  </span>
                )}
                <span>{account.settings.displayName || session.user.name || 'Cuenta'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => signIn('google')}
                className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11px] text-white/78"
              >
                {t.account.signin}
              </button>
            )}
          </div>
        }
      />

      <div
        ref={desktopViewportRef}
        className="absolute inset-0 overflow-y-auto overflow-x-hidden pb-24 pt-9"
        onWheel={(event) => {
          if (!event.ctrlKey) return;
          event.preventDefault();
          adjustDesktopScale(event.deltaY > 0 ? -0.04 : 0.04);
        }}
      >
        <AnimatePresence>
          {hydrated && showRibbon && launcherVisible ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.2 }}
              className="absolute left-1/2 top-12 -translate-x-1/2 rounded-full border border-white/10 bg-slate-950/55 px-4 py-2 text-[12px] text-white/70 backdrop-blur-md"
            >
              <span className="font-semibold text-cyan-300">TechOps</span> · {t.boot.welcome}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {hasDesktopWindowOpen ? (
          <div className="pointer-events-none absolute inset-0 z-[5] backdrop-blur-[7px]" />
        ) : null}

        <main className="relative z-10 min-h-full">
          <AnimatePresence>
            {launcherVisible ? (
              <motion.section
                key="agents-launcher"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28 }}
                className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-[1240px] flex-col items-center justify-center px-8 pb-24 pr-[180px]"
              >
                <div
                  className="mx-auto flex flex-col items-center"
                  style={{
                    transform: `scale(${desktopScale})`,
                    transformOrigin: 'top center',
                    width: desktopZoomWidth,
                  }}
                >
                  <div className="text-center">
                    <p className="text-[14px] font-medium text-white/75">{t.agents.modeTitle}</p>
                    <h1 className="mt-8 text-[50px] font-semibold leading-[1.05] tracking-[-0.03em] text-white">
                      {t.agents.greeting}
                    </h1>
                    <p className="mt-2 text-[46px] font-semibold leading-[1.06] tracking-[-0.03em] text-white">
                      {t.agents.question}
                    </p>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08, duration: 0.35 }}
                    className="mt-10 w-full max-w-[720px]"
                  >
                    <HeroComposer
                      value={heroDraft}
                      onChange={setHeroDraft}
                      onSubmit={handleHeroSubmit}
                      placeholder={t.agents.intentPlaceholder}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.16, duration: 0.35 }}
                    className="mt-14 flex w-full flex-wrap items-start justify-center gap-x-10 gap-y-9"
                  >
                    {agents.map((agent) => (
                      <AgentAvatar
                        key={agent.id}
                        agent={agent}
                        lang={lang}
                        t={t}
                        roleOptions={ROLE_OPTIONS}
                        renameState={renameState}
                        renameDraft={renameDraft}
                        avatarEditor={avatarEditor}
                        agentEditor={agentEditor}
                        onClick={() => openChatForAgent(agent)}
                        onOpenRename={openRename}
                        onRenameDraftChange={setRenameDraft}
                        onRenameSave={saveRename}
                        onRenameCancel={() => setRenameState(null)}
                        onOpenAvatarEditor={openAvatarEditor}
                        onAvatarEditorChange={setAvatarEditor}
                        onAvatarEditorFile={handleAvatarEditorFile}
                        onAvatarEditorSave={saveAvatarEditor}
                        onAvatarEditorCancel={() => setAvatarEditor(null)}
                        onRoleChange={(value) => updateAgentEditorField(agent.id, 'roleType', value)}
                        onOpenEditor={(tab) => openAgentEditor(agent.id, tab)}
                        onEditorTabChange={(tab) =>
                          setAgentEditor((current) =>
                            current?.agentId === agent.id ? { ...current, tab } : current,
                          )
                        }
                        onEditorFieldChange={(field, value) => updateAgentEditorField(agent.id, field, value)}
                        onEditorFileChange={handleAgentKnowledgeFile}
                        onEditorClose={() =>
                          setAgentEditor((current) => (current?.agentId === agent.id ? null : current))
                        }
                        onOpenContextMenu={(event) =>
                          setContextMenu({
                            agentId: agent.id,
                            x: event.clientX,
                            y: event.clientY,
                          })}
                      />
                    ))}
                  </motion.div>
                </div>
              </motion.section>
            ) : null}
          </AnimatePresence>

          <div className="pointer-events-none fixed right-5 top-20 z-20 flex flex-col items-end gap-3">
            <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/78 p-2 shadow-[0_18px_50px_-28px_rgba(0,0,0,0.82)] backdrop-blur-xl">
              <button
                type="button"
                onClick={() => adjustDesktopScale(-0.04)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/72 transition hover:bg-white/[0.08]"
                aria-label={t.agents.zoom.out}
                title={t.agents.zoom.out}
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setDesktopScale(DEFAULT_DESKTOP_SCALE)}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[12px] text-white/70 transition hover:bg-white/[0.08]"
                aria-label={t.agents.zoom.reset}
                title={t.agents.zoom.reset}
              >
                {Math.round(desktopScale * 100)}%
              </button>
              <button
                type="button"
                onClick={() => adjustDesktopScale(0.04)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/72 transition hover:bg-white/[0.08]"
                aria-label={t.agents.zoom.in}
                title={t.agents.zoom.in}
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>

            <div className="pointer-events-auto flex w-[170px] flex-col gap-2 rounded-[28px] border border-white/10 bg-slate-950/82 p-3 shadow-[0_20px_70px_-30px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
              <SidebarActionButton icon={Plus} label={t.agents.sidebar.createAgent} onClick={openCreateAgent} />
              <SidebarActionButton
                icon={UsersRound}
                label={t.agents.sidebar.roles}
                active={sidebarPanel === 'roles'}
                onClick={() => setSidebarPanel((current) => (current === 'roles' ? null : 'roles'))}
              />
              <SidebarActionButton
                icon={Database}
                label={t.agents.sidebar.memory}
                active={sidebarPanel === 'memory'}
                onClick={() => setSidebarPanel((current) => (current === 'memory' ? null : 'memory'))}
              />
              <SidebarActionButton
                icon={BookOpen}
                label={t.agents.sidebar.knowledge}
                active={sidebarPanel === 'knowledge'}
                onClick={() => setSidebarPanel((current) => (current === 'knowledge' ? null : 'knowledge'))}
              />
            </div>

            <AnimatePresence>
              {sidebarPanel ? (
                <SidebarPanel
                  key={sidebarPanel}
                  panel={sidebarPanel}
                  t={t}
                  agents={agents}
                  rolesPanelTab={rolesPanelTab}
                  onRolesTabChange={setRolesPanelTab}
                  account={account}
                  session={session}
                  onClose={() => setSidebarPanel(null)}
                  onLogin={() => signIn('google')}
                  onOpenAgentEdit={(agent, tab) => openEditAgent(agent, tab)}
                  onSheetSettingChange={updateAccountSheetSetting}
                  onConnectSheets={requestGoogleSheetsAccess}
                />
              ) : null}
            </AnimatePresence>
          </div>

          {createAgentWindow.open ? (
            <Window
              id="create-agent"
              title={createAgentMode === 'edit' ? t.agents.create.editTitle : t.agents.create.title}
              icon={Plus}
              accent="violet"
              position={createAgentWindow.position}
              size={createAgentWindow.size}
              zIndex={createAgentWindow.zIndex ?? 32}
              minimized={createAgentWindow.minimized}
              maximized={createAgentWindow.maximized}
              onUpdate={updateCreateAgentWindow}
              onClose={closeCreateAgent}
              onMinimize={() => setCreateAgentWindow((current) => ({ ...current, minimized: !current.minimized }))}
              onToggleMaximize={toggleCreateAgentMaximize}
              onFocus={focusCreateAgent}
            >
              <CreateAgentForm
                lang={lang}
                t={t}
                mode={createAgentMode}
                tab={createAgentTab}
                draft={createAgentDraft}
                error={createAgentError}
                onTabChange={setCreateAgentTab}
                onFieldChange={handleCreateAgentField}
                onFileChange={handleCreateAgentFile}
                onKnowledgeFileChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  readFileAsText(file).then((content) => {
                    handleCreateAgentField('knowledgeFileName', file.name);
                    handleCreateAgentField('knowledgeFileContent', content);
                    event.target.value = '';
                  });
                }}
                onSubmit={handleSaveCreatedAgent}
                onCancel={closeCreateAgent}
              />
            </Window>
          ) : null}

          {accountWindow.open ? (
            <Window
              id="account"
              title="Cuenta"
              icon={KeyRound}
              accent="violet"
              position={accountWindow.position}
              size={accountWindow.size}
              zIndex={accountWindow.zIndex ?? 33}
              minimized={accountWindow.minimized}
              maximized={accountWindow.maximized}
              onUpdate={(_, patch) => setAccountWindow((current) => ({ ...current, ...patch }))}
              onClose={() => setAccountWindow((current) => ({ ...current, open: false, minimized: false }))}
              onMinimize={() => setAccountWindow((current) => ({ ...current, minimized: !current.minimized }))}
              onToggleMaximize={() =>
                setAccountWindow((current) => ({
                  ...current,
                  maximized: !current.maximized,
                  zIndex: getNextWindowZ(),
                }))
              }
              onFocus={focusAccount}
            >
              <AccountWindowContent
                session={session}
                account={account}
                labels={t.account}
                onLogin={() => signIn('google')}
                onLogout={() => signOut({ callbackUrl: '/' })}
                onUpdateApiKey={updateAccountApiKey}
                onUpdateSetting={updateAccountSetting}
                onUpdateSheetSetting={updateAccountSheetSetting}
              />
            </Window>
          ) : null}

          {openAgentWindows.map((agent) => {
            const windowState = chatWindows[agent.id];
            const palette = getColorOption(agent.colorKey);

            return (
              <Window
                key={agent.id}
                id={agent.id}
                title={`${agent.name} · ${agent.role}`}
                icon={Bot}
                accent={palette.accent}
                position={windowState.position}
                size={windowState.size}
                zIndex={windowState.zIndex ?? 30}
                minimized={windowState.minimized}
                maximized={windowState.maximized}
                onUpdate={updateChatWindow}
                onClose={() => {
                  setChatWindows((current) => ({
                    ...current,
                    [agent.id]: {
                      ...(current[agent.id] ?? INITIAL_CHAT),
                      open: false,
                      minimized: false,
                    },
                  }));
                }}
                onMinimize={() => {
                  setChatWindows((current) => ({
                    ...current,
                    [agent.id]: {
                      ...(current[agent.id] ?? INITIAL_CHAT),
                      minimized: !current[agent.id]?.minimized,
                    },
                  }));
                }}
                onToggleMaximize={() => toggleChatMaximize(agent.id)}
                onFocus={() => focusAgentWindow(agent.id)}
              >
                <ChatWindowContent
                  agent={agent}
                  lang={lang}
                  messages={conversationsByAgentId[agent.id] ?? []}
                  draft={draftsByAgent[agent.id] ?? ''}
                  isSending={sendingAgentId === agent.id}
                  onDraftChange={(value) => {
                    setDraftsByAgent((current) => ({ ...current, [agent.id]: value }));
                  }}
                  onSubmit={(event) => handleChatSubmit(event, agent.id)}
                  placeholder={t.agents.chatPlaceholder.replace('{agent}', agent.name)}
                  onOpenMenuAction={(action) => {
                    if (action === 'edit') openEditAgent(agent, 'profile');
                    if (action === 'ai') openEditAgent(agent, 'ai');
                    if (action === 'model') openEditAgent(agent, 'ai');
                    if (action === 'prompt') openEditAgent(agent, 'ai');
                    if (action === 'knowledge') openEditAgent(agent, 'ai');
                    if (action === 'export') exportConversation(agent);
                    if (action === 'delete') setDeleteConfirmAgentId(agent.id);
                  }}
                  menuLabels={t.agents.chatMenu}
                />
              </Window>
            );
          })}

          {terminal.open ? (
            <Window
              id="terminal"
              title={t.terminal.title}
              icon={TerminalSquare}
              accent="emerald"
              position={terminal.position}
              size={terminal.size}
              zIndex={terminalZ}
              minimized={terminal.minimized}
              maximized={terminal.maximized}
              onUpdate={updateTerminal}
              onClose={() => setTerminal((current) => ({ ...current, open: false, minimized: false }))}
              onMinimize={() => setTerminal((current) => ({ ...current, minimized: !current.minimized }))}
              onToggleMaximize={toggleTerminalMaximize}
              onFocus={focusTerminal}
            >
              <TerminalWidget lang={lang} t={t} />
            </Window>
          ) : null}
        </main>
      </div>

      <Dock
        items={dockItems}
        onOpen={(id) => {
          if (id === 'agents') {
            setLauncherVisible((current) => !current);
            closeInlineEditors();
            return;
          }
          if (id === 'account') {
            openAccountWindow();
            return;
          }
          setTerminal((current) => ({ ...current, open: true, minimized: false }));
          focusTerminal();
        }}
        lang={lang}
        setLang={setLang}
        openIds={openIds}
        minimizedIds={minimizedIds}
      />

      {contextMenu ? (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setContextMenu(null)}
          onContextMenu={(event) => {
            event.preventDefault();
            setContextMenu(null);
          }}
        >
          <div
            className="absolute min-w-[180px] rounded-2xl border border-white/10 bg-slate-950/94 p-2 shadow-[0_18px_60px_-24px_rgba(0,0,0,0.8)] backdrop-blur-xl"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                const target = agentsById.get(contextMenu.agentId);
                if (target) openRename(target, 'name');
                setContextMenu(null);
              }}
              className="flex w-full items-center rounded-xl px-3 py-2 text-left text-[13px] text-white/82 hover:bg-white/[0.06]"
            >
              {t.agents.contextRename}
            </button>
            <button
              type="button"
              onClick={() => {
                setDeleteConfirmAgentId(contextMenu.agentId);
                setContextMenu(null);
              }}
              className="mt-1 flex w-full items-center rounded-xl px-3 py-2 text-left text-[13px] text-rose-200 hover:bg-rose-400/[0.08]"
            >
              {t.agents.contextDelete}
            </button>
          </div>
        </div>
      ) : null}

      {deleteConfirmAgentId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-[360px] rounded-[28px] border border-white/10 bg-slate-950/94 p-6 shadow-[0_18px_70px_-24px_rgba(0,0,0,0.85)]">
            <p className="text-[16px] font-medium text-white">{t.agents.deleteConfirm}</p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmAgentId(null)}
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[13px] text-white/65"
              >
                {t.agents.deleteCancel}
              </button>
              <button
                type="button"
                onClick={() => deleteAgent(deleteConfirmAgentId)}
                className="rounded-full bg-rose-500 px-4 py-2.5 text-[13px] font-medium text-white"
              >
                {t.agents.deleteAccept}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <AnimatePresence>
        {toast ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-28 left-1/2 z-[70] w-full max-w-[540px] -translate-x-1/2 px-4"
          >
            <div className="rounded-full border border-white/10 bg-slate-950/90 px-4 py-3 text-center text-[13px] text-white/82 shadow-[0_18px_60px_-24px_rgba(0,0,0,0.85)] backdrop-blur-xl">
              {toast}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function AgentVisual({ agent, className = '', emojiClassName = '' }) {
  const palette = getColorOption(agent.colorKey);

  return (
    <div
      className={[
        'relative flex items-center justify-center rounded-full border border-white/70 bg-white/5',
        palette.glow,
        className,
      ].join(' ')}
    >
      <div className={`absolute inset-[10px] rounded-full bg-gradient-to-br ${palette.gradient} opacity-95`} />
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.34),transparent_42%)]" />
      {agent.avatarType === 'image' ? (
        <img
          src={agent.avatarValue}
          alt={agent.name}
          className="relative z-10 h-[72px] w-[72px] rounded-full object-cover"
        />
      ) : (
        <span className={`relative z-10 text-[42px] drop-shadow-[0_0_12px_rgba(255,255,255,0.38)] ${emojiClassName}`}>
          {agent.avatarValue || pickRandomEmoji()}
        </span>
      )}
    </div>
  );
}

function AgentAvatar({
  agent,
  lang,
  t,
  roleOptions,
  renameState,
  renameDraft,
  avatarEditor,
  agentEditor,
  onClick,
  onOpenRename,
  onRenameDraftChange,
  onRenameSave,
  onRenameCancel,
  onOpenAvatarEditor,
  onAvatarEditorChange,
  onAvatarEditorFile,
  onAvatarEditorSave,
  onAvatarEditorCancel,
  onRoleChange,
  onOpenEditor,
  onEditorTabChange,
  onEditorFieldChange,
  onEditorFileChange,
  onEditorClose,
  onOpenContextMenu,
}) {
  const isEditingName = renameState?.agentId === agent.id && renameState?.field === 'name';
  const isEditingAvatar = avatarEditor?.agentId === agent.id;
  const isEditingAgent = agentEditor?.agentId === agent.id;
  const avatarFileRef = useRef(null);

  return (
    <div className="relative flex w-[154px] flex-col items-center text-center">
      <button
        type="button"
        onClick={onClick}
        onContextMenu={(event) => {
          event.preventDefault();
          onOpenContextMenu(event);
        }}
        onDoubleClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onOpenRename(agent, 'name');
        }}
        className="group flex w-full flex-col items-center text-center"
      >
        <AgentVisual
          agent={agent}
          className="h-[82px] w-[82px] transition-transform duration-300 group-hover:scale-[1.04]"
        />
        <span
          onDoubleClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onOpenRename(agent, 'name');
          }}
          className="mt-3 cursor-text text-[17px] font-semibold text-white"
        >
          {agent.name}
        </span>
      </button>

      <div className="mt-2 flex w-full items-center justify-center gap-2">
        <select
          value={agent.roleType}
          onChange={(event) => onRoleChange(event.target.value)}
          onClick={(event) => event.stopPropagation()}
          className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[12px] text-white/78 focus:outline-none"
        >
          {roleOptions.map((option) => (
            <option key={option.value} value={option.value} className="bg-slate-950 text-white">
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onOpenEditor('profile');
          }}
          className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[12px] text-white/78"
        >
          {t.agents.edit}
        </button>
      </div>

      <AnimatePresence>
        {isEditingName ? (
          <FloatingRenameTag
            key={`${agent.id}-${renameState?.field}`}
            lang={lang}
            value={renameDraft}
            field={renameState?.field}
            onChange={onRenameDraftChange}
            onSave={onRenameSave}
            onCancel={onRenameCancel}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isEditingAvatar ? (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            className="absolute left-1/2 top-0 z-30 w-[240px] -translate-x-1/2 rounded-[24px] border border-white/10 bg-slate-950/90 p-4 text-left shadow-[0_18px_60px_-24px_rgba(0,0,0,0.75)] backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-300/85">
                  Cambiar avatar
                </p>
                <p className="mt-1 text-[12px] text-white/50">
                  Sube una imagen o elige un emoji.
                </p>
              </div>
              <button
                type="button"
                onClick={onAvatarEditorCancel}
                className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/60"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <AgentVisual
                agent={{ ...agent, avatarType: avatarEditor.avatarType, avatarValue: avatarEditor.avatarValue }}
                className="h-16 w-16"
                emojiClassName="text-[26px]"
              />
              <div className="flex-1">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => avatarFileRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-[12px] text-white/75"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Subir archivo
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onAvatarEditorChange((current) =>
                        current?.agentId === agent.id
                          ? { ...current, avatarType: 'emoji', avatarValue: pickRandomEmoji(), error: '' }
                          : current,
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-[12px] text-white/75"
                  >
                    <Shuffle className="h-3.5 w-3.5" />
                    {lang === 'es' ? 'Emoji' : 'Emoji'}
                  </button>
                </div>
                <input
                  value={avatarEditor.avatarType === 'emoji' ? avatarEditor.avatarValue : ''}
                  onChange={(event) =>
                    onAvatarEditorChange((current) =>
                      current?.agentId === agent.id
                        ? { ...current, avatarType: 'emoji', avatarValue: event.target.value, error: '' }
                        : current,
                    )
                  }
                  placeholder="Escribe un emoji"
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[13px] text-white placeholder:text-white/35 focus:outline-none"
                />
              </div>
            </div>

            {avatarEditor.error ? (
              <p className="mt-3 text-[12px] text-rose-300">{avatarEditor.error}</p>
            ) : null}

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onAvatarEditorCancel}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[12px] text-white/60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onAvatarEditorSave}
                className="rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 px-3 py-2 text-[12px] font-medium text-slate-950"
              >
                Guardar avatar
              </button>
            </div>

            <input
              ref={avatarFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => onAvatarEditorFile(event, agent.id)}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isEditingAgent ? (
          <AgentSettingsPopover
            agent={agent}
            t={t}
            roleOptions={roleOptions}
            editorState={agentEditor}
            onTabChange={onEditorTabChange}
            onFieldChange={onEditorFieldChange}
            onFileChange={onEditorFileChange}
            onAvatarEdit={() => onOpenAvatarEditor(agent)}
            onClose={onEditorClose}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function AgentSettingsPopover({
  agent,
  t,
  roleOptions,
  editorState,
  onTabChange,
  onFieldChange,
  onFileChange,
  onAvatarEdit,
  onClose,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.97 }}
      className="absolute left-1/2 top-[144px] z-30 w-[290px] -translate-x-1/2 rounded-[24px] border border-white/10 bg-slate-950/92 p-4 text-left shadow-[0_18px_60px_-24px_rgba(0,0,0,0.75)] backdrop-blur-2xl"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-300/85">{t.agents.edit}</p>
          <p className="mt-1 text-[12px] text-white/50">{agent.name}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/60"
        >
          Cerrar
        </button>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => onTabChange('profile')}
          className={`rounded-full px-3 py-1.5 text-[12px] ${
            editorState?.tab === 'profile'
              ? 'bg-white/[0.12] text-white'
              : 'border border-white/10 bg-white/[0.04] text-white/65'
          }`}
        >
          {t.agents.profile}
        </button>
        <button
          type="button"
          onClick={() => onTabChange('ai')}
          className={`rounded-full px-3 py-1.5 text-[12px] ${
            editorState?.tab === 'ai'
              ? 'bg-white/[0.12] text-white'
              : 'border border-white/10 bg-white/[0.04] text-white/65'
          }`}
        >
          {t.agents.aiConfig}
        </button>
      </div>

      {editorState?.tab === 'ai' ? (
        <div className="mt-4 space-y-4">
          <div>
            <p className="mb-2 text-[13px] font-medium text-white/82">{t.agents.behaviorPrompt}</p>
            <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-[12px] text-white/75">
              <span>{t.agents.uploadBehavior}</span>
              <Upload className="h-3.5 w-3.5" />
              <input
                type="file"
                accept=".md,text/markdown"
                className="hidden"
                onChange={(event) => onFileChange(event, agent.id, 'behavior')}
              />
            </label>
            <p className="mt-2 text-[12px] text-white/45">
              {agent.behaviorFileName || t.agents.create.behaviorPlaceholder}
            </p>
          </div>

          <div>
            <p className="mb-2 text-[13px] font-medium text-white/82">{t.agents.knowledgeBase}</p>
            <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-[12px] text-white/75">
              <span>{t.agents.uploadKnowledge}</span>
              <Upload className="h-3.5 w-3.5" />
              <input
                type="file"
                accept=".md,.txt,text/plain,text/markdown"
                className="hidden"
                onChange={(event) => onFileChange(event, agent.id, 'knowledge')}
              />
            </label>
            <p className="mt-2 text-[12px] text-white/45">
              {agent.knowledgeFileName || t.agents.create.knowledgePlaceholder}
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-300/14 bg-cyan-400/[0.07] px-3 py-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/85">{t.agents.memory}</p>
            <p className="mt-1 text-[13px] text-white">{t.agents.memoryProvider}</p>
            <p className="mt-1 text-[12px] text-cyan-100/80">{t.agents.memoryPending}</p>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <label className="block">
            <p className="mb-2 text-[13px] font-medium text-white/82">{t.agents.nameLabel}</p>
            <input
              value={agent.name}
              onChange={(event) => onFieldChange('name', event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[13px] text-white placeholder:text-white/35 focus:outline-none"
            />
          </label>

          <label className="block">
            <p className="mb-2 text-[13px] font-medium text-white/82">{t.agents.roleLabel}</p>
            <select
              value={agent.roleType}
              onChange={(event) => onFieldChange('roleType', event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[13px] text-white focus:outline-none"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-slate-950 text-white">
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div>
            <p className="mb-2 text-[13px] font-medium text-white/82">{t.agents.avatarLabel}</p>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3">
              <AgentVisual agent={agent} className="h-12 w-12 border-white/12" emojiClassName="text-[18px]" />
              <button
                type="button"
                onClick={onAvatarEdit}
                className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-[12px] text-white/75"
              >
                {t.agents.edit}
              </button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-[13px] font-medium text-white/82">{t.agents.colorLabel}</p>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => onFieldChange('colorKey', option.key)}
                  className={`rounded-full border px-3 py-2 text-[12px] ${
                    agent.colorKey === option.key
                      ? 'border-white/60 bg-white/[0.12] text-white'
                      : 'border-white/10 bg-white/[0.04] text-white/65'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full bg-gradient-to-br ${option.gradient}`} />
                    {option.key}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {editorState?.error ? <p className="mt-4 text-[12px] text-rose-300">{editorState.error}</p> : null}
    </motion.div>
  );
}

function FloatingRenameTag({ lang, value, field, onChange, onSave, onCancel }) {
  return (
    <motion.form
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.97 }}
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
      className="absolute left-1/2 top-[104px] z-30 w-[220px] -translate-x-1/2 rounded-[22px] border border-white/10 bg-slate-950/92 p-4 text-left shadow-[0_18px_60px_-24px_rgba(0,0,0,0.75)] backdrop-blur-2xl"
    >
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.05]">
          <Pencil className="h-3.5 w-3.5 text-cyan-300" />
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-300/85">Renombrar</p>
          <p className="text-[12px] text-white/50">
            {field === 'name' ? 'Nombre' : 'Rol'}
          </p>
        </div>
      </div>

      <input
        autoFocus
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-3 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[13px] text-white placeholder:text-white/35 focus:outline-none"
      />

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[12px] text-white/60"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 px-3 py-2 text-[12px] font-medium text-slate-950"
        >
          Guardar
        </button>
      </div>
    </motion.form>
  );
}

function CreateAgentAvatar({ lang, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-[118px] flex-col items-center text-center"
      aria-label="Crear agente"
    >
      <div className="relative flex h-[82px] w-[82px] items-center justify-center rounded-full border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(229,231,235,0.94))] shadow-[0_0_28px_rgba(255,255,255,0.18)] transition-transform duration-300 group-hover:scale-[1.04]">
        <Plus className="h-10 w-10 text-slate-700" />
      </div>
      <span className="mt-3 text-[17px] font-semibold text-white">
        Crear agente
      </span>
    </button>
  );
}

function SidebarActionButton({ icon: Icon, label, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left text-[13px] transition ${
        active
          ? 'border-cyan-300/25 bg-cyan-400/[0.12] text-white'
          : 'border-white/10 bg-white/[0.04] text-white/74 hover:bg-white/[0.08]'
      }`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/20">
        <Icon className="h-4 w-4" />
      </span>
      <span>{label}</span>
    </button>
  );
}

function SidebarPanel({
  panel,
  t,
  agents,
  rolesPanelTab,
  onRolesTabChange,
  account,
  session,
  onClose,
  onLogin,
  onOpenAgentEdit,
  onSheetSettingChange,
  onConnectSheets,
}) {
  const panelTitle =
    panel === 'roles'
      ? t.agents.sidebar.roles
      : panel === 'memory'
        ? t.agents.sidebar.memory
        : t.agents.sidebar.knowledge;

  return (
    <motion.div
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      className="w-[340px] rounded-[28px] border border-white/10 bg-slate-950/92 p-4 shadow-[0_22px_90px_-36px_rgba(0,0,0,0.92)] backdrop-blur-2xl"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-300/85">{panelTitle}</p>
          <p className="mt-1 text-[13px] text-white/52">
            {panel === 'roles'
              ? 'Organiza el comportamiento base de los agentes.'
              : panel === 'memory'
                ? 'Configura Google Sheets para guardar memoria y creditos.'
                : 'Gestiona los archivos locales de conocimiento por agente.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12px] text-white/60"
        >
          Cerrar
        </button>
      </div>

      {panel === 'roles' ? (
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'roles', label: t.agents.sidebar.roles },
              { key: 'create', label: t.agents.sidebar.createRole },
              { key: 'mine', label: t.agents.sidebar.myRoles },
              { key: 'explore', label: t.agents.sidebar.explore },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => onRolesTabChange(item.key)}
                className={`rounded-full px-3 py-1.5 text-[12px] ${
                  rolesPanelTab === item.key
                    ? 'bg-white/[0.12] text-white'
                    : 'border border-white/10 bg-white/[0.04] text-white/60'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
            {rolesPanelTab === 'roles' || rolesPanelTab === 'mine' ? (
              <div className="space-y-3">
                {ROLE_OPTIONS.map((roleOption) => (
                  <div
                    key={roleOption.value}
                    className="rounded-2xl border border-white/8 bg-black/15 px-4 py-3 text-[13px] text-white/76"
                  >
                    <p className="font-medium text-white">{roleOption.label}</p>
                    <p className="mt-1 text-[12px] text-white/48">
                      {agents.filter((agent) => agent.roleType === roleOption.value).length} agentes usando este rol
                    </p>
                  </div>
                ))}
              </div>
            ) : rolesPanelTab === 'create' ? (
              <p className="text-[13px] leading-6 text-white/64">
                Crear roles personalizados llegara despues. De momento puedes trabajar con Atencion al cliente y Asistente.
              </p>
            ) : (
              <p className="text-[13px] leading-6 text-white/64">
                Explorar roles queda preparado para una futura biblioteca compartida.
              </p>
            )}
          </div>
        </div>
      ) : null}

      {panel === 'memory' ? (
        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="mb-2 block text-[13px] text-white/78">{t.account.sheetId}</span>
            <input
              value={account.settings.sheets.sheetId}
              onChange={(event) => onSheetSettingChange('sheetId', event.target.value)}
              placeholder="1AbC..."
              className="w-full rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-[13px] text-white placeholder:text-white/35 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[13px] text-white/78">{t.account.sheetTab}</span>
            <input
              value={account.settings.sheets.sheetTab}
              onChange={(event) => onSheetSettingChange('sheetTab', event.target.value)}
              placeholder="Historial"
              className="w-full rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-[13px] text-white placeholder:text-white/35 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[13px] text-white/78">{t.account.connectionMethod}</span>
            <input
              value={account.settings.sheets.connectionMethod}
              readOnly
              className="w-full rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-[13px] text-white/60 focus:outline-none"
            />
          </label>
          <div className="rounded-[24px] border border-cyan-300/14 bg-cyan-400/[0.07] px-4 py-4 text-[13px] text-white/82">
            {session?.user?.hasSheetsAccess
              ? 'Permisos de Google Sheets concedidos. Los mensajes pueden guardarse en memoria.'
              : 'Aun faltan permisos de Google Sheets. Te los pediremos en el primer guardado o puedes conectarlos ya.'}
          </div>
          <button
            type="button"
            onClick={session?.user ? onConnectSheets : onLogin}
            className="w-full rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 px-4 py-3 text-[13px] font-medium text-slate-950"
          >
            {session?.user ? 'Conectar Google Sheets' : 'Iniciar sesion con Google'}
          </button>
        </div>
      ) : null}

      {panel === 'knowledge' ? (
        <div className="mt-4 space-y-3">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[14px] font-medium text-white">{agent.name}</p>
                  <p className="mt-1 text-[12px] text-white/52">
                    {agent.knowledgeFileName || 'Sin base de conocimiento local'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenAgentEdit(agent, 'ai')}
                  className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-[12px] text-white/74"
                >
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </motion.div>
  );
}

function CreateAgentForm({
  lang,
  t,
  mode,
  tab,
  draft,
  error,
  onTabChange,
  onFieldChange,
  onFileChange,
  onKnowledgeFileChange,
  onSubmit,
  onCancel,
}) {
  const palette = getColorOption(draft.colorKey);
  const providerOptions = getProviderOptions();
  const modelOptions = getModelOptions(draft.provider);

  return (
    <div className="h-full bg-[linear-gradient(180deg,rgba(10,14,25,0.98),rgba(7,9,16,1))] text-white">
      <form onSubmit={onSubmit} className="mx-auto flex min-h-full max-w-[540px] flex-col px-6 py-6 pb-12">
        <div className="flex items-start gap-4">
          <AgentVisual
            agent={{
              id: 'preview',
              name: draft.name || 'Agent',
              role: draft.role || 'Role',
              avatarType: draft.avatarType,
              avatarValue: draft.avatarValue,
              colorKey: draft.colorKey,
            }}
            className="h-16 w-16"
            emojiClassName="text-[28px]"
          />
          <div>
            <h2 className="text-[24px] font-semibold text-white">
              {mode === 'edit' ? t.agents.create.editTitle : t.agents.create.title}
            </h2>
            <p className="mt-1 text-[14px] leading-6 text-white/62">
              Configura el perfil del agente y deja preparada su configuración IA local.
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={() => onTabChange('profile')}
            className={`rounded-full px-4 py-2 text-[13px] ${
              tab === 'profile'
                ? 'bg-white/[0.12] text-white'
                : 'border border-white/10 bg-white/[0.04] text-white/65'
            }`}
          >
            {t.agents.create.tabProfile}
          </button>
          <button
            type="button"
            onClick={() => onTabChange('ai')}
            className={`rounded-full px-4 py-2 text-[13px] ${
              tab === 'ai'
                ? 'bg-white/[0.12] text-white'
                : 'border border-white/10 bg-white/[0.04] text-white/65'
            }`}
          >
            {t.agents.create.tabAI}
          </button>
        </div>

        <div className="mt-6 space-y-5">
          {tab === 'profile' ? (
            <>
              <FieldBlock
                label="Nombre"
                value={draft.name}
                onChange={(value) => onFieldChange('name', value)}
                placeholder="Ej. Maia"
              />
              <FieldBlock
                label="Rol / subtítulo"
                value={draft.role}
                onChange={(value) => onFieldChange('role', value)}
                placeholder="Ej. Estratega Creativa"
              />

              <div>
                <p className="mb-2 text-[13px] font-medium text-white/82">Avatar</p>
                <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        onFieldChange('avatarType', 'emoji');
                        onFieldChange('avatarValue', pickRandomEmoji());
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-[13px] text-white/75"
                    >
                      <Shuffle className="h-3.5 w-3.5" />
                      Emoji aleatorio
                    </button>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-[13px] text-white/75">
                      <Upload className="h-3.5 w-3.5" />
                      Subir archivo
                      <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
                    </label>
                  </div>
                  <input
                    value={draft.avatarType === 'emoji' ? draft.avatarValue : ''}
                    onChange={(event) => {
                      onFieldChange('avatarType', 'emoji');
                      onFieldChange('avatarValue', event.target.value);
                    }}
                    placeholder="Escribe un emoji si quieres uno manual"
                    className="mt-3 w-full rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-[14px] text-white placeholder:text-white/35 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <p className="mb-2 text-[13px] font-medium text-white/82">Color / acento</p>
                <div className="flex flex-wrap gap-3 rounded-[26px] border border-white/10 bg-white/[0.04] p-4">
                  {COLOR_OPTIONS.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => onFieldChange('colorKey', option.key)}
                      className={`rounded-full border px-3 py-2 text-[12px] transition ${
                        draft.colorKey === option.key
                          ? 'border-white/60 bg-white/[0.12] text-white'
                          : 'border-white/10 bg-white/[0.04] text-white/65'
                      }`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <span className={`h-3 w-3 rounded-full bg-gradient-to-br ${option.gradient}`} />
                        {option.key}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <SelectBlock
                label="Provider"
                value={draft.provider}
                onChange={(value) => onFieldChange('provider', value)}
                options={providerOptions}
                placeholder="Selecciona un provider"
              />
              <SelectBlock
                label="Modelo"
                value={draft.model}
                onChange={(value) => onFieldChange('model', value)}
                options={modelOptions.map((option) => ({ value: option, label: option }))}
                placeholder="Selecciona un modelo"
              />
              {draft.provider === 'starxia-openai' ? (
                <div className="rounded-2xl border border-cyan-300/16 bg-cyan-400/[0.07] px-4 py-3 text-[12px] leading-6 text-cyan-100">
                  Crédito visible del usuario: regalo inicial de $0.50 USD. Se descuenta localmente cuando este agente usa Starxia OpenAI.
                </div>
              ) : null}
              <label className="block">
                <p className="mb-2 text-[13px] font-medium text-white/82">System prompt / behavior prompt</p>
                <textarea
                  value={draft.systemPrompt}
                  onChange={(event) => onFieldChange('systemPrompt', event.target.value)}
                  rows={6}
                  className="w-full rounded-[26px] border border-white/10 bg-white/[0.04] px-4 py-3 text-[14px] text-white placeholder:text-white/35 focus:outline-none"
                  placeholder="Placeholder local. Aún no conecta con ninguna IA real."
                />
              </label>
              <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-4">
                <p className="mb-3 text-[13px] font-medium text-white/82">Archivo de conocimiento</p>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-[13px] text-white/75">
                  <Upload className="h-3.5 w-3.5" />
                  Subir .md o .txt
                  <input type="file" accept=".md,.txt,text/plain,text/markdown" className="hidden" onChange={onKnowledgeFileChange} />
                </label>
                <p className="mt-3 text-[12px] text-white/48">
                  {draft.knowledgeFileName || t.agents.create.knowledgePlaceholder}
                </p>
              </div>
            </>
          )}
        </div>

        {error ? (
          <p className="mt-5 rounded-2xl border border-rose-300/18 bg-rose-400/[0.08] px-4 py-3 text-[13px] text-rose-200">
            {error}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-3 pt-8">
          <div className="text-[12px] text-white/42">Vista previa con acento {palette.key}.</div>
          <div className="flex items-center gap-2 pb-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[13px] text-white/65"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 px-4 py-2.5 text-[13px] font-medium text-slate-950"
            >
              {mode === 'edit' ? 'Guardar cambios' : 'Guardar agente'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function FieldBlock({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <p className="mb-2 text-[13px] font-medium text-white/82">{label}</p>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-[26px] border border-white/10 bg-white/[0.04] px-4 py-3 text-[14px] text-white placeholder:text-white/35 focus:outline-none"
      />
    </label>
  );
}

function SelectBlock({ label, value, onChange, options, placeholder }) {
  return (
    <label className="block">
      <p className="mb-2 text-[13px] font-medium text-white/82">{label}</p>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-[26px] border border-white/10 bg-white/[0.04] px-4 py-3 text-[14px] text-white focus:outline-none"
      >
        <option value="" className="bg-slate-950 text-white/70">
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-slate-950 text-white">
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function HeroComposer({ value, onChange, onSubmit, placeholder }) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex h-[74px] items-center gap-4 rounded-[18px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.08))] px-5 text-white shadow-[0_18px_48px_-24px_rgba(0,0,0,0.65)] backdrop-blur-xl"
    >
      <SendHorizontal className="h-7 w-7 shrink-0 text-white/80" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-[18px] text-white placeholder:text-white/62 focus:outline-none"
      />
    </form>
  );
}

function ChatWindowContent({
  agent,
  lang,
  messages,
  draft,
  onDraftChange,
  onSubmit,
  placeholder,
  onOpenMenuAction,
  menuLabels,
  isSending = false,
}) {
  const palette = getColorOption(agent.colorKey);
  const attachmentLabel = 'Adjuntar archivo';
  const voiceLabel = 'Hablar por micrófono';

  return (
    <div className="flex h-full flex-col bg-[#05070d] text-white">
      <div className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(9,12,20,0.98),rgba(7,10,16,0.94))] px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AgentVisual agent={agent} className="h-11 w-11 border-white/15" emojiClassName="text-[18px]" />
            <div>
              <p className="text-[13px] font-semibold text-white">{agent.name}</p>
              <p className="text-[13px] text-white/62">{agent.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/85">AI Agent</p>
              <p className="text-[12px] text-white/45">{isSending ? 'Respondiendo...' : 'Chat listo'}</p>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((current) => !current)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/68 transition hover:bg-white/[0.08] hover:text-white"
                aria-label="Abrir menu del agente"
              >
                <Ellipsis className="h-4 w-4" />
              </button>
              <AnimatePresence>
                {menuOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    className="absolute right-0 top-12 z-30 min-w-[220px] rounded-[22px] border border-white/10 bg-slate-950/96 p-2 shadow-[0_18px_60px_-24px_rgba(0,0,0,0.78)] backdrop-blur-xl"
                  >
                    {[
                      ['edit', menuLabels?.editAgent],
                      ['ai', menuLabels?.aiConfig],
                      ['model', menuLabels?.model],
                      ['prompt', menuLabels?.prompt],
                      ['knowledge', menuLabels?.knowledge],
                      ['export', menuLabels?.export],
                      ['delete', menuLabels?.delete],
                    ].map(([action, label]) => (
                      <button
                        key={action}
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          onOpenMenuAction?.(action);
                        }}
                        className={`flex w-full items-center rounded-xl px-3 py-2 text-left text-[13px] ${
                          action === 'delete'
                            ? 'text-rose-200 hover:bg-rose-400/[0.08]'
                            : 'text-white/82 hover:bg-white/[0.06]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className="custom-scroll flex-1 overflow-auto bg-[radial-gradient(circle_at_top,rgba(20,33,61,0.18),transparent_32%),linear-gradient(180deg,#070a12_0%,#05070d_100%)] px-6 py-6">
        <div className="mx-auto flex w-full max-w-[760px] flex-col gap-5">
          <div className="self-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[12px] text-white/45 backdrop-blur-md">
            Conversación independiente por agente
          </div>

          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} agent={agent} lang={lang} />
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit} className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(8,11,18,0.98),rgba(6,8,14,1))] px-5 py-4">
        <div className="mx-auto flex w-full max-w-[780px] items-end gap-3 rounded-[26px] border border-white/10 bg-white/[0.05] px-3 py-3 shadow-[0_14px_36px_-22px_rgba(0,0,0,0.9)] backdrop-blur-xl">
          <button
            type="button"
            aria-label={attachmentLabel}
            title={attachmentLabel}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/65 transition hover:bg-white/[0.09] hover:text-white"
          >
            <Paperclip className="h-4.5 w-4.5" />
          </button>

          <div className="flex-1 rounded-[22px] bg-black/20 px-4 py-3">
            <textarea
              value={draft}
              onChange={(event) => onDraftChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              placeholder={placeholder}
              rows={1}
              className="max-h-32 min-h-[28px] w-full resize-none bg-transparent text-[15px] leading-6 text-white placeholder:text-white/38 focus:outline-none"
            />
          </div>

          <button
            type="button"
            aria-label={voiceLabel}
            title={voiceLabel}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/65 transition hover:bg-white/[0.09] hover:text-white"
          >
            <Mic className="h-4.5 w-4.5" />
          </button>

          <button
            type="submit"
            aria-label="Enviar mensaje"
            disabled={isSending}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${palette.gradient} text-slate-950 transition hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-70`}
          >
            <ArrowUp className="h-4.5 w-4.5" />
          </button>
        </div>
      </form>
    </div>
  );
}

function ChatBubble({ message, agent, lang }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="flex max-w-[72%] flex-col items-end gap-2">
          <span className="px-1 text-[11px] uppercase tracking-[0.18em] text-cyan-300/85">
            Tú
          </span>
          <div className="rounded-[24px] rounded-br-[8px] border border-cyan-300/20 bg-gradient-to-br from-cyan-400 to-blue-500 px-5 py-4 text-[15px] leading-7 text-slate-950 shadow-[0_18px_40px_-24px_rgba(56,189,248,0.55)]">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <AgentVisual agent={agent} className="mt-1 h-10 w-10 border-white/12" emojiClassName="text-[17px]" />
      <div className="flex max-w-[74%] flex-col gap-2">
        <span className="px-1 text-[11px] uppercase tracking-[0.18em] text-white/42">{agent.name}</span>
        <div className="rounded-[24px] rounded-bl-[8px] border border-white/10 bg-white/[0.05] px-5 py-4 text-[15px] leading-7 text-white/86 backdrop-blur-xl">
          <p className="mb-2 text-[12px] text-white/42">{agent.role}</p>
          <p className="whitespace-pre-line">{message.content}</p>
        </div>
      </div>
    </div>
  );
}

function MobileAgentsView({
  lang,
  setLang,
  t,
  activeAgent,
  showCreateAgent,
  agents,
  messages,
  heroDraft,
  chatDraft,
  renameState,
  renameDraft,
  avatarEditor,
  createAgentDraft,
  createAgentError,
  createAgentMode,
  createAgentTab,
  setHeroDraft,
  setChatDraft,
  onHeroSubmit,
  onChatSubmit,
  onActivateAgent,
  onOpenCreateAgent,
  onCloseCreateAgent,
  onCloseChat,
  onCreateAgentField,
  onCreateAgentFile,
  onSaveCreateAgent,
  onCreateAgentTabChange,
  onOpenRename,
  onRenameDraftChange,
  onRenameSave,
  onRenameCancel,
  onOpenAvatarEditor,
  onAvatarEditorChange,
  onAvatarEditorFile,
  onAvatarEditorSave,
  onAvatarEditorCancel,
}) {
  const isChatMode = Boolean(activeAgent);
  const isCreateAgentMode = showCreateAgent && !isChatMode;

  return (
    <div className="relative min-h-screen text-white">
      <TechBackground />

      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-white/10 bg-slate-950/45 px-4 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          {isChatMode || isCreateAgentMode ? (
            <button
              onClick={isChatMode ? onCloseChat : onCloseCreateAgent}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/75"
              aria-label="Back"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          ) : null}
          <span className="text-sm font-semibold text-white/90">TechOps</span>
          <span className="text-white/35">•</span>
          <span className="text-sm text-white/60">
            {isChatMode ? activeAgent.name : isCreateAgentMode ? t.agents.create.title : t.agents.modeTitle}
          </span>
        </div>
        <button
          onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
          className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold"
        >
          {lang.toUpperCase()}
        </button>
      </header>

      <main className="relative z-10 px-5 pb-28 pt-20">
        <AnimatePresence mode="wait">
          {isChatMode ? (
            <motion.div
              key={`mobile-chat-${activeAgent.id}`}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.24 }}
              className="pb-24"
            >
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/90">
                <ChatWindowContent
                  agent={activeAgent}
                  lang={lang}
                  messages={messages}
                  draft={chatDraft}
                  onDraftChange={setChatDraft}
                  onSubmit={onChatSubmit}
                  placeholder={t.agents.chatPlaceholder.replace('{agent}', activeAgent.name)}
                />
              </div>
            </motion.div>
          ) : isCreateAgentMode ? (
            <motion.div
              key="mobile-create-agent"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.24 }}
              className="pb-12"
            >
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/90">
                <CreateAgentForm
                  lang={lang}
                  t={t}
                  mode={createAgentMode}
                  tab={createAgentTab}
                  draft={createAgentDraft}
                  error={createAgentError}
                  onTabChange={onCreateAgentTabChange}
                  onFieldChange={onCreateAgentField}
                  onFileChange={onCreateAgentFile}
                  onKnowledgeFileChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    readFileAsText(file).then((content) => {
                      onCreateAgentField('knowledgeFileName', file.name);
                      onCreateAgentField('knowledgeFileContent', content);
                      event.target.value = '';
                    });
                  }}
                  onSubmit={onSaveCreateAgent}
                  onCancel={onCloseCreateAgent}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="mobile-hero"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.24 }}
              className="pt-10"
            >
              <div className="text-center">
                <p className="text-[14px] font-medium text-white/75">{t.agents.modeTitle}</p>
                <h1 className="mt-10 text-[38px] font-semibold leading-[1.05] tracking-[-0.03em] text-white">
                  {t.agents.greeting}
                </h1>
                <p className="mt-2 text-[34px] font-semibold leading-[1.08] tracking-[-0.03em] text-white">
                  {t.agents.question}
                </p>
              </div>

              <div className="mt-9">
                <HeroComposer
                  value={heroDraft}
                  onChange={setHeroDraft}
                  onSubmit={onHeroSubmit}
                  placeholder={t.agents.intentPlaceholder}
                />
              </div>

              <div className="mt-12 grid grid-cols-2 gap-y-10">
                {agents.map((agent) => (
                  <div key={agent.id} className="flex justify-center">
                    <AgentAvatar
                      agent={agent}
                      lang={lang}
                      t={t}
                      renameState={renameState}
                      renameDraft={renameDraft}
                      avatarEditor={avatarEditor}
                      onClick={() => onActivateAgent(agent)}
                      onOpenEdit={() => onOpenRename(agent, 'name')}
                      onOpenRename={onOpenRename}
                      onRenameDraftChange={onRenameDraftChange}
                      onRenameSave={onRenameSave}
                      onRenameCancel={onRenameCancel}
                      onOpenAvatarEditor={onOpenAvatarEditor}
                      onAvatarEditorChange={onAvatarEditorChange}
                      onAvatarEditorFile={onAvatarEditorFile}
                      onAvatarEditorSave={onAvatarEditorSave}
                      onAvatarEditorCancel={onAvatarEditorCancel}
                      onOpenContextMenu={() => {}}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-12 flex justify-center">
                <CreateAgentAvatar lang={lang} onClick={onOpenCreateAgent} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

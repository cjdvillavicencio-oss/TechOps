# 🤖 AGENTS SYSTEM

## Overview

Agents are the **core functional units** of the application.

Each agent behaves like an **application inside the desktop**, represented visually as a circular avatar.

Agents are NOT buttons.  
Agents are NOT UI elements.  

👉 Agents must feel like **independent intelligent entities**.

---

## 🎯 Purpose

The goal of the agents system is to:

- Allow users to interact with specialized AI entities
- Organize AI usage into roles instead of generic chats
- Replace the traditional “single chatbot” model

---

## 🧠 Core Concept

Each agent represents:

- a role
- a purpose
- a way of thinking

Examples:

- Vega → Coach de Alto Rendimiento  
- Lía → Psicóloga & Bienestar  
- Atlas → Estratega Personal  
- Nova → Asistente Inteligente  

---

## 🧩 Agent Structure

Each agent must include:

- id
- name
- role (short subtitle)
- avatar (visual/icon)
- system_prompt (DO NOT implement yet)
- model_config (DO NOT implement yet)

---

## ⚠️ Implementation Rules (VERY IMPORTANT)

- DO NOT implement system_prompt logic yet
- DO NOT implement per-agent model configuration
- Use a single default AI model for all agents
- Agents differ ONLY in:
  - name
  - role
  - visual representation

---

## 💬 Conversation Model

- Each agent has its own conversation
- Conversations are independent between agents
- Messages are stored sequentially

Future (DO NOT implement yet):
- conversation persistence across sessions
- conversation history UI
- multiple conversations per agent

---

## 🔁 Interaction Model

Users can interact with agents in two ways:

### 1. Direct Interaction
- User clicks on an agent
- Opens agent context (chat in future)

### 2. Intent Input (Central Input)

- User writes a message in the central input field
- System analyzes intent
- System routes to the most relevant agent

---

## ⚠️ Routing Logic

Routing system:

- NOT implemented yet
- For now:
  - user interaction is manual (click agent)

Future:
- AI-based intent classification
- automatic agent selection

---

## 🖥️ UI Representation

Agents must:

- be displayed as circular avatars
- have:
  - icon inside
  - name below
  - role below

Rules:

- NO cards
- NO containers
- NO boxed layouts
- clean and minimal

---

## 📱 Mobile Behavior

- Same agents system
- Display in:
  - vertical layout OR 2-column grid
- One interaction focus at a time
- No desktop-like window behavior

---

## ➕ Create Agent

There must be a:

👉 “Create Agent” button

- circular
- with "+" icon
- visually consistent with agents

Functionality:

- placeholder only for now
- DO NOT implement full creation logic yet

---

## 🧠 Future Capabilities (DO NOT IMPLEMENT YET)

- Custom prompts per agent
- Model selection per agent
- API key per agent
- Agent memory
- Agent personality tuning

---

## 🔐 Constraints

- No API keys in frontend
- AI calls must go through backend
- Agents must be linked to user (future)

---

## 🎯 UX Principles

- Agents feel alive
- Interaction > decoration
- Minimal UI
- Clear purpose per agent
- No dashboard patterns

---

## ⚡ AI Assistant Instructions

When working on agents:

- Do NOT assume missing features
- Do NOT implement future capabilities
- Ask questions if unclear
- Keep implementation simple and modular
- Follow PROJECT_CONTEXT.md at all times

# 🤖 AGENTS SYSTEM

## Overview

Agents are the **core functional units** of the application.

Each agent behaves like an **application inside the desktop**, represented visually as a circular avatar.

Agents are NOT buttons.  
Agents are NOT UI elements.  

👉 Agents must feel like **independent intelligent entities**.

---

## 🎯 Purpose

The goal of the agents system is to:

- Allow users to interact with specialized AI entities
- Organize AI usage into roles instead of generic chats
- Replace the traditional “single chatbot” model

---

## 🧠 Core Concept

Each agent represents:

- a role
- a purpose
- a way of thinking

Examples:

- Vega → Coach de Alto Rendimiento  
- Lía → Psicóloga & Bienestar  
- Atlas → Estratega Personal  
- Nova → Asistente Inteligente  

---

## 🧩 Agent Structure

Each agent must include:

- id
- name
- role (short subtitle)
- avatar (visual/icon)
- system_prompt (DO NOT implement yet)
- model_config (DO NOT implement yet)

---

## ⚠️ Implementation Rules (VERY IMPORTANT)

- DO NOT implement system_prompt logic yet
- DO NOT implement per-agent model configuration
- Use a single default AI model for all agents
- Agents differ ONLY in:
  - name
  - role
  - visual representation

---

## 💬 Conversation Model

- Each agent has its own conversation
- Conversations are independent between agents
- Messages are stored sequentially

Future (DO NOT implement yet):
- conversation persistence across sessions
- conversation history UI
- multiple conversations per agent

---

## 🔁 Interaction Model

Users can interact with agents in two ways:

### 1. Direct Interaction
- User clicks on an agent
- Opens agent context (chat in future)

### 2. Intent Input (Central Input)

- User writes a message in the central input field
- System analyzes intent
- System routes to the most relevant agent

---

## ⚠️ Routing Logic

Routing system:

- NOT implemented yet
- For now:
  - user interaction is manual (click agent)

Future:
- AI-based intent classification
- automatic agent selection

---

## 🖥️ UI Representation

Agents must:

- be displayed as circular avatars
- have:
  - icon inside
  - name below
  - role below

Rules:

- NO cards
- NO containers
- NO boxed layouts
- clean and minimal

---

## 📱 Mobile Behavior

- Same agents system
- Display in:
  - vertical layout OR 2-column grid
- One interaction focus at a time
- No desktop-like window behavior

---

## ➕ Create Agent

There must be a:

👉 “Create Agent” button

- circular
- with "+" icon
- visually consistent with agents

Functionality:

- placeholder only for now
- DO NOT implement full creation logic yet

---

## 🧠 Future Capabilities (DO NOT IMPLEMENT YET)

- Custom prompts per agent
- Model selection per agent
- API key per agent
- Agent memory
- Agent personality tuning

---

## 🔐 Constraints

- No API keys in frontend
- AI calls must go through backend
- Agents must be linked to user (future)

---

## 🎯 UX Principles

- Agents feel alive
- Interaction > decoration
- Minimal UI
- Clear purpose per agent
- No dashboard patterns

---

## ⚡ AI Assistant Instructions

When working on agents:

- Do NOT assume missing features
- Do NOT implement future capabilities
- Ask questions if unclear
- Keep implementation simple and modular
- Follow PROJECT_CONTEXT.md at all times
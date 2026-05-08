# PROJECT CONTEXT

## 🧠 Project Overview

This project is a **desktop-style web application (OS-like UI)** built in the browser.

Originally created as a personal technical support portfolio, it is now evolving into a:

👉 **AI Workspace Operating System**

A modular environment where the user interacts with different "views" (desktops), that works like changing to a different desktop but it's actually a dektop mode each one with different unique functionalities, each designed for a specific purpose.

---

## 🎯 Core Concept

The app is NOT just a UI.

It is a **multi-mode workspace system**, where each mode represents a different mental context:

- Productivity
- AI interaction
- Relaxation
- Creativity

Each mode is visually and functionally distinct but shares the same core system.

---

## 👤 Target User

- People already using AI tools (ChatGPT, etc.)
- Freelancers, creators, entrepreneurs
- Users who need structure and organization

---

## 💥 Problem

Current AI usage is unstructured:
- one chat for everything
- context mixing
- no separation of roles

---

## ✅ Solution

Provide a system where:
- each AI agent has a role
- conversations are separated
- users interact in a structured way

---

## 🎯 Value

- clarity
- organization
- better results from AI
- more control

## 🧩 Main Architecture

### Core Elements

- Desktop system (main container)
- Window system (draggable, resizable)
- Window manager (state control)
- Widgets / Apps (modular components)
- Global state (active mode, windows, user config)

---

## 🖥️ MODES SYSTEM (VERY IMPORTANT)

The application is built around **multiple modes (desktops/views)**.

Each mode represents a different experience layer.

For now, ALL modes must share:
- the same animated background
- the same color palette
- the same visual style
- the same window system (draggable + resizable on desktop)
- the same interaction model

Mobile behavior must also remain consistent across modes:
- no dragging
- single active view at a time

Modes differ only in:
→ purpose and content, NOT in core UI behavior (for now)

### 1. 🤖 Agents Mode (MAIN / DEFAULT)

This is the primary and central experience of the product.

Users interact with **AI agents as applications**, represented visually as circular avatars.

---

### 🧠 Core Interaction

- A large centered hero message:
  → “Hola, [UserName], ¿con quién quieres hablar hoy?”

- A central input field below the message:
  → user writes intent
  → system will route to the most relevant agent (future)

- Users can:
  - click an agent directly
  - or type in the input

---

### 🎨 UI Structure

- Full-screen desktop with animated background
- NO cards, NO containers, NO boxed layouts

Agents are displayed as:
- circular avatars (buttons)
- icon or visual inside
- name below
- subtitle (role) below

Example:
- Vega — Coach de Alto Rendimiento  
- Lía — Psicóloga & Bienestar  
- Atlas — Estratega Personal  
- Nova — Asistente Inteligente  

+ “Crear agente” as a circular button with a "+" icon

---

### 🖥️ Desktop Layout

- Agents are horizontally aligned and centered under the input
- Even spacing between agents
- Visual balance and symmetry is important
- All elements are centered in the hero section

---

### 📱 Mobile Layout

- Same structure but vertically stacked
- Agents displayed in 2-column grid or vertical flow
- “Crear agente” appears as a larger button at the bottom
- One clear focus per screen (no clutter)

---

### ⚙️ Agent Structure (Logical)

Each agent has:
- name
- role (subtitle)
- prompt (DO NOT implement yet — placeholder only)
- model configuration (DO NOT implement yet — use a single default model for all agents)

Each agent will have its own conversation context.

---

### 🚨 Important Rules

- Agents must feel like entities, not UI elements
- Avoid dashboard-style layouts
- Avoid cards or boxed components
- Keep interface minimal and focused on interaction

---

👉 This is the **core monetizable feature of the product**
### 2. 🌙 Relax Mode (do not implement yet)

A calm, non-productive environment.

Purpose:
- reduce stress
- ambient experience

Features:
- clocks (multiple timezones)
- floating soft animations
- customizable ambient elements
- minimal or no interaction

👉 This mode is about **feeling**, not productivity

---

### 3. 🎨 Creative Mode (Future)

A flexible creative workspace.

Purpose:
- thinking
- organizing ideas
- visual exploration

Features:
- freeform board
- draggable elements
- notes, links, ideas
- visual composition

👉 Think: lightweight creative canvas / board

---

## ⚙️ Tech Stack

- Frontend: Next.js
- Styling: Tailwind CSS
- Animations: Framer Motion
- Backend: Next.js API routes (initially)
- Database: Supabase (PostgreSQL)
- AI: OpenRouter (free models initially)

---

## 📦 Data Model (High Level)

- users
- agents
- conversations
- messages
- user_settings
- modes_config

---

## 📏 Core Rules

- DO NOT rebuild from scratch
- Reuse existing desktop/window system
- Keep OS-like metaphor
- Prioritize modularity
- Everything should be scalable to support agents

---

## 🚫 What NOT to do (for now)

- Do not overengineer
- Do not add unnecessary animations
- Do not implement all modes yet
- Do not add complex integrations

---

## 🚀 Current Goal (Phase 1)

- Refactor and stabilize desktop + window system
- Prepare architecture for:
  - agent windows
  - mode switching
- Clean UI (remove old portfolio elements)

---

## 🔮 Future Phases

Phase 2:
- Authentication (Google)
- User system

Phase 3:
- AI agents system
- Chat per agent

Phase 4:
- Monetization
- Limits & plans

Phase 5:
- Additional modes (Relax, Creative)

---

## 🧠 UX Philosophy

- Minimal but powerful
- Visual but not overwhelming
- Functional first, aesthetic second
- Each mode = different mental state

---

## ⚠️ Important Instruction for AI

Before making changes:
- Understand this context
- Do NOT assume missing features
- Ask if something is unclear
- Extend, do not replace existing structure

## 📱 Cross-Platform Strategy (Future)

The application is primarily a web app.

Future goal:
- Make it installable as a mobile app (Android and iOS)

Approach (preferred):
- Progressive Web App (PWA)
- OR lightweight native wrapper (e.g. Capacitor)

---

## ⚠️ Important

- Do NOT implement mobile app packaging yet
- Do NOT change architecture for native apps
- Focus on web-first development

Mobile app support must come later without breaking the web architecture

## 📄 Related Modules

- agents.md → defines agent system and behavior

All agent-related logic must follow agents.md

## 🎨 Visual Reference Rule

UI screenshots provided in prompts must be treated as the primary visual reference.

- Do NOT reinterpret the design
- Do NOT introduce new UI patterns
- Match layout, spacing, and hierarchy as closely as possible

IMPORTANT:

Do NOT delete or fully rewrite core files (like Desktop.jsx).

Do NOT perform large refactors.

Make only small, incremental changes.

Preserve all existing working UI and behavior.

If a refactor is needed:
- explain it first
- wait for confirmation before proceeding


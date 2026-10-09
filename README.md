# 🗜️ Scrunch Chat

**Conquer the Unread Problem — locally, privately, intelligently.**

Scrunch Chat is an AI-powered desktop app that summarizes, extracts, prioritizes, and highlights important information from overwhelming chat conversations. All processing happens on your device — **no data ever leaves your machine**.

![Scrunch Chat Logo](./assets/logo.png)

---

## ✨ Features

- **🧠 AI Summarization** — Condense long chat threads into crisp, readable summaries using on-device AI (Transformers.js / ONNX Runtime)
- **📋 Action Item Extraction** — Automatically find TODOs, assignments, and follow-ups
- **⚡ Smart Prioritization** — Rank items by urgency, deadline proximity, and relevance
- **🔔 Highlight Detection** — Surface @mentions, deadlines, and key decisions you might have missed
- **🔒 Privacy by Design** — 100% local processing. Zero cloud. Zero telemetry. Your chats never leave your hardware.

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ installed
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/scrunch-chat.git
cd scrunch-chat

# Install dependencies
npm install

# Start in development mode
npm run dev
```

### Build for Production

```bash
# Build the app
npm run build

# Package for distribution (Windows)
npm run package
```

---

## 📥 Supported Import Formats

| Platform | Format |
|---|---|
| **Slack** | JSON export |
| **Discord** | JSON data package |
| **WhatsApp** | TXT export |
| **Microsoft Teams** | JSON export |
| **Generic CSV** | `timestamp, sender, message` columns |
| **Plain Text** | `sender: message` format |

Simply drag & drop your exported chat file into Scrunch Chat, and the app auto-detects the format.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Desktop Shell | Electron |
| Frontend | React 18 + TypeScript |
| Styling | Tailwind CSS |
| State | Zustand |
| Local AI | Transformers.js (ONNX Runtime) |
| Database | Dexie.js (IndexedDB) |
| Build | Vite |

---

## 📁 Project Structure

```
src/
├── electron/          # Main process (window management, IPC)
│   ├── main.ts
│   └── preload.ts
├── core/              # Business logic
│   ├── ai/
│   │   ├── types.ts       # Type definitions
│   │   ├── pipeline.ts    # AI orchestration
│   │   └── extractors.ts  # NLP extraction
│   └── storage/
│       ├── database.ts    # IndexedDB schema
│       ├── repository.ts  # Data access layer
│       └── importers.ts   # Chat format parsers
└── renderer/          # React frontend
    ├── main.tsx
    ├── App.tsx
    ├── store/
    │   └── appStore.ts
    ├── styles/
    │   └── globals.css
    └── components/
        ├── Titlebar.tsx
        ├── Sidebar.tsx
        ├── Dashboard.tsx
        ├── ConversationView.tsx
        ├── ImportModal.tsx
        ├── ActionItemCard.tsx
        ├── ProcessingOverlay.tsx
        └── Settings.tsx
```

---

## 🔐 Privacy Guarantee

> **Your data never leaves your device. Period.**

- AI models run locally via ONNX Runtime — no API calls
- All data stored in browser-sandboxed IndexedDB
- No analytics, no telemetry, no cloud sync
- Electron `contextIsolation` + CSP headers block data exfiltration
- One-click "Clear All Data" in Settings

---

## 📜 License

MIT © Scrunch Chat

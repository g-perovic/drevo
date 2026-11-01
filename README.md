# Drevo 🌳
> A simple, intuitive, and modern family tree application.

Drevo (*"Tree"*) makes creating and exploring family heritage effortless for everyone. Built with a focus on simplicity, fluid interactive editing, cross-platform desktop execution, and high-quality PDF exports.

## ✨ Features
- **Effortless Family Tree Creation**: One-click quick actions to add parents, children, spouses, and siblings.
- **Dynamic Auto-Layout**: Automatic generational layout with optional freehand drag & snap-to-grid.
- **Multi-Language Support**:
  - English (`en`)
  - Slovenian (`sl`)
  - Debug Pseudo-Localization (`debug`) for missing translation detection.
- **Native Project Files**: Save and load `.drevo` JSON-based project files.
- **Print-Ready PDF & Image Export**: High-resolution vector PDF export with page size controls (A4, A3, Poster).
- **Lightweight Desktop App**: Built with Tauri for a tiny (~3–5 MB) Windows installer and offline capability.

## 🛠️ Tech Stack
- **Desktop Shell**: [Tauri](https://tauri.app/) (Rust + WebView2)
- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Canvas / Visualizer**: [@xyflow/react](https://reactflow.dev/) (React Flow)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Internationalization**: [i18next](https://www.i18next.com/)
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF)

---
Licensed under MIT.

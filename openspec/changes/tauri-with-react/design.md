## Context

Greenfield project — no existing codebase. Building a desktop MIDI utility using Tauri v2 (Rust backend + WebView frontend). The Web MIDI API is unavailable in macOS WKWebView, so MIDI I/O must be handled in the Rust layer via `midir`. The frontend (React) handles UI only.

## Goals / Non-Goals

**Goals:**
- Working Tauri v2 app with React frontend that builds and runs on macOS
- List available MIDI outputs and allow user selection
- Register a global hotkey that sends a MIDI CC message to the selected output
- Toggle CC 102 value between 0 and 127 on each keypress

**Non-Goals:**
- MIDI input / listening
- Hot-plug device detection (manual refresh only)
- Multiple hotkey bindings
- Configurable CC number or channel
- System tray / menu bar mode
- Persistence of settings between sessions

## Decisions

### 1. MIDI via Rust (`midir`) instead of Web MIDI API
**Choice**: Use the `midir` crate in the Rust backend, exposed via Tauri commands.
**Why**: Web MIDI API is not supported in WKWebView (macOS) or WebKitGTK (Linux). Only WebView2 on Windows supports it. Using `midir` gives cross-platform MIDI support.
**Alternative**: WebMidi.js — rejected because it wraps Web MIDI API and inherits the same platform limitations.

### 2. Tauri v2 with React
**Choice**: Tauri v2 for the app shell, React for the frontend.
**Why**: Tauri v2 provides global shortcut plugins and Rust backend for native MIDI. React is the user's preferred frontend framework.
**Alternative**: Electron — heavier runtime, unnecessary for this scope.

### 3. App state in Rust
**Choice**: Store toggle state, selected port, and MIDI connection in Rust `AppState` behind `Mutex`.
**Why**: The global hotkey handler fires in the Rust layer. It needs direct access to the MIDI connection and toggle state without roundtripping to the frontend.

### 4. Frontend ↔ Backend communication
**Choice**: Tauri commands for actions (list outputs, select output), Tauri events for notifications (midi-fired).
**Why**: Commands are request/response (frontend asks, backend answers). Events are push notifications (backend tells frontend something happened). This matches the interaction pattern.

### 5. Global hotkey: `CmdOrCtrl+Shift+M`
**Choice**: Hardcoded single shortcut registered at app startup.
**Why**: POC scope — no need for configurability.

## Risks / Trade-offs

- **macOS accessibility permissions** → Tauri's global-shortcut plugin requires accessibility permissions on macOS. The app will prompt the user on first run. No mitigation needed beyond clear UX messaging.
- **MIDI port names may change** → USB devices can appear with different names across reboots. For POC, user re-selects on each launch. Acceptable for now.
- **Mutex contention** → Hotkey handler and frontend commands both access `AppState`. At POC scale (single user, infrequent access), contention is negligible.

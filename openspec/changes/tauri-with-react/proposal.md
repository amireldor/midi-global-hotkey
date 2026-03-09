## Why

We need a desktop application that sends MIDI CC messages via a global hotkey, enabling hands-free MIDI control without switching away from other applications. Tauri v2 with React provides a lightweight, cross-platform shell while Rust handles MIDI I/O natively (since the Web MIDI API is not supported in macOS WKWebView).

## What Changes

- Scaffold a Tauri v2 application with a React frontend
- Implement MIDI output enumeration and connection via the `midir` Rust crate
- Register a global hotkey (`CmdOrCtrl+Shift+M`) using Tauri's `plugin-global-shortcut`
- On hotkey press, toggle and send CC 102 (value 0 or 127) to the selected MIDI output
- Frontend displays a device picker dropdown, refresh button, and toggle state indicator

## Capabilities

### New Capabilities
- `app-scaffold`: Tauri v2 project structure with React frontend and Rust backend
- `midi-output`: MIDI output enumeration, selection, connection, and CC message sending via `midir`
- `global-hotkey`: System-wide hotkey registration and toggle-based MIDI triggering

### Modified Capabilities
<!-- None — greenfield project -->

## Impact

- **Dependencies**: Tauri v2, `midir` crate, `tauri-plugin-global-shortcut`, React
- **Platform**: macOS primary (CoreMIDI via midir), cross-platform capable
- **System access**: Requires accessibility permissions for global hotkey capture on macOS

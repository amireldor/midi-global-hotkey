## 1. Project Scaffold

- [x] 1.1 Initialize Tauri v2 project with React (TypeScript) frontend
- [x] 1.2 Verify the app builds and opens a window with the default React template

## 2. Rust Backend — MIDI

- [x] 2.1 Add `midir` crate dependency
- [x] 2.2 Define `AppState` struct with `Mutex` (selected port, connection, toggle state)
- [x] 2.3 Implement `list_outputs` Tauri command (enumerate MIDI output ports via midir)
- [x] 2.4 Implement `select_output` Tauri command (open connection, store in app state)

## 3. Rust Backend — Global Hotkey

- [x] 3.1 Add `tauri-plugin-global-shortcut` dependency
- [x] 3.2 Register `CmdOrCtrl+Shift+M` global hotkey at app startup
- [x] 3.3 Implement hotkey handler: toggle state, send CC 102 (0/127), emit `midi-fired` event
- [x] 3.4 Handle case where no output is selected (no-op, no crash)

## 4. React Frontend

- [x] 4.1 Create dropdown component to display MIDI outputs (calls `list_outputs` on mount)
- [x] 4.2 Add output selection handler (calls `select_output` on change)
- [x] 4.3 Add Refresh button to re-enumerate MIDI outputs
- [x] 4.4 Add status indicator showing current toggle value (listens to `midi-fired` event)
- [x] 4.5 Display the hotkey hint (`⌘⇧M`)

## 5. Integration Verification

- [x] 5.1 Verify end-to-end: select output → press hotkey → MIDI CC sent → UI updates

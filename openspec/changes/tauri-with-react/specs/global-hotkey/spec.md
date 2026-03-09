## ADDED Requirements

### Requirement: Global hotkey registration
The application SHALL register `CmdOrCtrl+Shift+M` as a global hotkey at startup using Tauri's `plugin-global-shortcut`.

#### Scenario: Hotkey is registered on launch
- **WHEN** the application starts
- **THEN** the global hotkey `CmdOrCtrl+Shift+M` SHALL be registered and active system-wide

### Requirement: Toggle CC value on hotkey press
The application SHALL toggle the CC value between 0 and 127 on each hotkey press and send the toggled value to the selected MIDI output.

#### Scenario: First hotkey press sends value 127
- **WHEN** the user presses the hotkey for the first time (initial state is 0)
- **THEN** the application SHALL send CC 102 with value 127 to the selected output

#### Scenario: Second hotkey press sends value 0
- **WHEN** the user presses the hotkey again (state is 127)
- **THEN** the application SHALL send CC 102 with value 0 to the selected output

#### Scenario: Hotkey pressed with no output selected
- **WHEN** the user presses the hotkey and no MIDI output is connected
- **THEN** the application SHALL do nothing (no error, no crash)

### Requirement: Frontend receives toggle events
The application SHALL emit a Tauri event to the frontend after each hotkey-triggered MIDI send, including the new toggle value.

#### Scenario: Frontend updates on hotkey press
- **WHEN** a MIDI CC message is sent via hotkey
- **THEN** the frontend SHALL receive a `midi-fired` event with the current value (0 or 127) and update the status indicator

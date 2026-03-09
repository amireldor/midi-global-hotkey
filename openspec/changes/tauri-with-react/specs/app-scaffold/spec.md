## ADDED Requirements

### Requirement: Tauri v2 project with React frontend
The project SHALL be a Tauri v2 application with a React (TypeScript) frontend and Rust backend.

#### Scenario: Project builds successfully
- **WHEN** the user runs the Tauri dev command
- **THEN** the application compiles and opens a desktop window with the React UI

### Requirement: Rust backend with app state
The Rust backend SHALL maintain an `AppState` struct containing the MIDI connection, selected port, and toggle state, protected by a `Mutex`.

#### Scenario: App state is initialized
- **WHEN** the application starts
- **THEN** the app state is initialized with no selected port, no connection, and toggle value 0

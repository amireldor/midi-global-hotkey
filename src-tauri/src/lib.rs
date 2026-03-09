use midir::{MidiOutput, MidiOutputConnection};
use std::sync::Mutex;
use tauri::{Emitter, Manager};

struct AppState {
    midi_out: Option<MidiOutputConnection>,
    toggle: bool,
    selected_port: Option<String>,
    current_shortcut: String,
    paused: bool,
}

#[tauri::command]
fn list_outputs() -> Result<Vec<String>, String> {
    let midi_out = MidiOutput::new("midi-global-hotkey").map_err(|e| e.to_string())?;
    let ports = midi_out.ports();
    let names: Vec<String> = ports
        .iter()
        .filter_map(|p| midi_out.port_name(p).ok())
        .collect();
    Ok(names)
}

#[tauri::command]
fn select_output(name: String, state: tauri::State<'_, Mutex<AppState>>) -> Result<(), String> {
    let midi_out = MidiOutput::new("midi-global-hotkey").map_err(|e| e.to_string())?;
    let ports = midi_out.ports();
    let port = ports
        .iter()
        .find(|p| midi_out.port_name(p).ok().as_deref() == Some(&name))
        .ok_or_else(|| format!("Port '{}' not found", name))?
        .clone();

    let conn = midi_out
        .connect(&port, "midi-global-hotkey-out")
        .map_err(|e| e.to_string())?;

    let mut app_state = state.lock().map_err(|e| e.to_string())?;
    app_state.midi_out = Some(conn);
    app_state.selected_port = Some(name);
    app_state.toggle = false;
    Ok(())
}

#[tauri::command]
fn change_shortcut(
    shortcut_str: String,
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, Mutex<AppState>>,
) -> Result<(), String> {
    use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut};

    let new_shortcut = shortcut_str.parse::<Shortcut>().map_err(|e| format!("{e:?}"))?;

    let mut app_state = state.lock().map_err(|e| e.to_string())?;
    let old_shortcut = app_state.current_shortcut.parse::<Shortcut>().map_err(|e| format!("{e:?}"))?;

    app_handle
        .global_shortcut()
        .unregister(old_shortcut)
        .map_err(|e| e.to_string())?;

    let handle = app_handle.clone();
    app_handle
        .global_shortcut()
        .on_shortcut(new_shortcut, move |_app, _shortcut, event| {
            if event.state != tauri_plugin_global_shortcut::ShortcutState::Pressed {
                return;
            }
            let state = handle.state::<Mutex<AppState>>();
            let mut app_state = state.lock().unwrap();
            if let Some(value) = send_midi_cc(&mut app_state) {
                let _ = handle.emit("midi-fired", value);
            }
        })
        .map_err(|e| e.to_string())?;

    app_state.current_shortcut = shortcut_str;
    Ok(())
}

#[tauri::command]
fn set_paused(paused: bool, state: tauri::State<'_, Mutex<AppState>>) -> Result<(), String> {
    state.lock().map_err(|e| e.to_string())?.paused = paused;
    Ok(())
}

fn send_midi_cc(state: &mut AppState) -> Option<u8> {
    if state.paused {
        return None;
    }
    if let Some(ref mut conn) = state.midi_out {
        state.toggle = !state.toggle;
        let value = if state.toggle { 127 } else { 0 };
        // CC message: status 0xB0 (channel 1), controller 102, value
        let _ = conn.send(&[0xB0, 102, value]);
        Some(value)
    } else {
        None
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .manage(Mutex::new(AppState {
            midi_out: None,
            toggle: false,
            selected_port: None,
            current_shortcut: "CmdOrCtrl+Shift+M".to_string(),
            paused: false,
        }))
        .invoke_handler(tauri::generate_handler![list_outputs, select_output, change_shortcut, set_paused])
        .setup(|app| {
            use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut};

            let shortcut: Shortcut = "CmdOrCtrl+Shift+M".parse().expect("invalid shortcut");
            let handle = app.handle().clone();

            app.global_shortcut().on_shortcut(shortcut, move |_app, _shortcut, event| {
                if event.state != tauri_plugin_global_shortcut::ShortcutState::Pressed {
                    return;
                }
                let state = handle.state::<Mutex<AppState>>();
                let mut app_state = state.lock().unwrap();
                if let Some(value) = send_midi_cc(&mut app_state) {
                    let _ = handle.emit("midi-fired", value);
                }
            })?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

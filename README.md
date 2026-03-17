# MIDI Global Hotkey

A tiny experimental app that sends a MIDI CC toggle on a global hotkey — works even when your DAW has focus.

## The Problem

[MetricAB](https://adptraudio.com/product/metric-ab/) is a VST that lets you A/B compare your mix against reference tracks. Its toggle button is inside Cubase, meaning you can't bind it to a system-wide hotkey. Every time you want to switch reference tracks mid-session you have to click into the plugin. This app solves that by sending a MIDI CC message that MetricAB (or any VST) can map to a parameter.

It's worth noting that this is not required for Ableton Live which has awesome keyboard binding support.

## How It Works

1. The app registers a **global hotkey** that fires system-wide, even when Cubase is in focus.
2. On each press it toggles a **MIDI CC message** (channel 1, CC 102, value `127`/`0`) to a virtual MIDI port.
3. Cubase picks that up via a Remote Control Surface and forwards it to MetricAB.

## Setup

### Virtual MIDI Port

You need a virtual MIDI port for the app to send messages through.

- **macOS:** Enable the built-in **IAC Driver** in Audio MIDI Setup → MIDI Studio.
- **Windows:** [loopMIDI](https://www.tobias-erichsen.de/software/loopmidi.html) is a free option.
- **Linux:** Use a virtual ALSA or JACK port.

### DAW Setup (Cubase + MetricAB)

1. In the app, select your virtual MIDI port as the output.
2. In Cubase, create a **Remote Control Surface** (Studio → Studio Setup → Remote Devices) pointing at the same virtual port.
3. Map CC 102 on the surface to MetricAB's A/B toggle via MIDI learn.

### Other DAWs

🤷🏻

## Usage

- **Default hotkey:** `Cmd+Shift+M` (Mac) / `Ctrl+Shift+M` (Windows/Linux)
- Click the hotkey badge in the UI to rebind it — press your new combo, then `Enter` to confirm or `Esc` to cancel.
- Select your MIDI output from the dropdown. Settings are saved across restarts.

## Building from Source

Requires Rust + Cargo and Node.js.

```sh
npm install
npm run tauri build
```

For development with hot reload:

```sh
npm run tauri dev
```

## Tech Stack

- [Tauri 2](https://tauri.app/) — native app shell (Rust backend)
- [React](https://react.dev/) + TypeScript — UI
- [midir](https://github.com/Boddlnagg/midir) — MIDI output
- `tauri-plugin-global-shortcut` — system-wide hotkey registration
- `tauri-plugin-store` — persistent settings

## License

MPL-2.0

import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

const isMac = navigator.platform.includes("Mac");

function keyEventToShortcut(e: KeyboardEvent): { tauri: string; display: string } | null {
  const modifiers: string[] = [];
  const displayMods: string[] = [];

  if (e.metaKey || e.ctrlKey) {
    modifiers.push("CmdOrCtrl");
    displayMods.push(isMac ? "⌘" : "Ctrl+");
  }
  if (e.shiftKey) {
    modifiers.push("Shift");
    displayMods.push(isMac ? "⇧" : "Shift+");
  }
  if (e.altKey) {
    modifiers.push("Alt");
    displayMods.push(isMac ? "⌥" : "Alt+");
  }

  if (modifiers.length === 0) return null;

  const ignoredKeys = ["Meta", "Control", "Shift", "Alt"];
  if (ignoredKeys.includes(e.key)) return null;

  const keyMap: Record<string, string> = {
    " ": "Space",
    ArrowUp: "Up",
    ArrowDown: "Down",
    ArrowLeft: "Left",
    ArrowRight: "Right",
  };

  const key = keyMap[e.key] || e.key.toUpperCase();
  const displayKey = keyMap[e.key] || e.key.toUpperCase();

  return {
    tauri: [...modifiers, key].join("+"),
    display: displayMods.join("") + displayKey,
  };
}

function App() {
  const [outputs, setOutputs] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [connected, setConnected] = useState(false);
  const [lastValue, setLastValue] = useState<number | null>(null);
  const [error, setError] = useState<string>("");
  const [rebinding, setRebinding] = useState(false);
  const [hotkeyDisplay, setHotkeyDisplay] = useState(isMac ? "⌘⇧M" : "Ctrl+Shift+M");
  const [pendingKeys, setPendingKeys] = useState<{ tauri: string; display: string } | null>(null);
  const [_hotkeyTauri, setHotkeyTauri] = useState("CmdOrCtrl+Shift+M");

  const loadOutputs = async () => {
    try {
      const list = await invoke<string[]>("list_outputs");
      setOutputs(list);
      setError("");
    } catch (e) {
      setError(String(e));
    }
  };

  useEffect(() => {
    loadOutputs();

    const unlisten = listen<number>("midi-fired", (event) => {
      setLastValue(event.payload);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  useEffect(() => {
    if (!rebinding) return;

    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.key === "Escape") {
        invoke("set_paused", { paused: false });
        setRebinding(false);
        setPendingKeys(null);
        return;
      }

      if (e.key === "Enter" && pendingKeys) {
        invoke("change_shortcut", { shortcutStr: pendingKeys.tauri })
          .then(() => {
            invoke("set_paused", { paused: false });
            setHotkeyDisplay(pendingKeys.display);
            setHotkeyTauri(pendingKeys.tauri);
            setRebinding(false);
            setPendingKeys(null);
            setError("");
          })
          .catch((err) => {
            setError(String(err));
          });
        return;
      }

      const result = keyEventToShortcut(e);
      if (result) {
        setPendingKeys(result);
      }
    };

    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [rebinding, pendingKeys]);

  const handleSelect = async (name: string) => {
    setSelected(name);
    if (!name) return;
    try {
      await invoke("select_output", { name });
      setConnected(true);
      setLastValue(null);
      setError("");
    } catch (e) {
      setConnected(false);
      setError(String(e));
    }
  };

  return (
    <main style={{ padding: "1.5rem", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: "1.2rem", margin: "0 0 1rem" }}>
        MIDI Global Hotkey
      </h1>

      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="output-select" style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.85rem" }}>
          MIDI Output
        </label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <select
            id="output-select"
            value={selected}
            onChange={(e) => handleSelect(e.target.value)}
            style={{ flex: 1 }}
          >
            <option value="">-- Select output --</option>
            {outputs.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <button onClick={loadOutputs}>Refresh</button>
        </div>
        {outputs.length === 0 && (
          <p style={{ fontSize: "0.8rem", color: "#888", margin: "0.25rem 0 0" }}>
            No MIDI devices found
          </p>
        )}
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <p style={{ fontSize: "0.85rem", margin: "0 0 0.25rem" }}>
          Hotkey:{" "}
          {rebinding ? (
            <span>
              <kbd
                style={{
                  padding: "0.1rem 0.4rem",
                  border: "1px solid #f0a020",
                  borderRadius: "3px",
                  background: "#fff8e0",
                }}
              >
                {pendingKeys ? pendingKeys.display : "Press a key combo..."}
              </kbd>
              <span style={{ fontSize: "0.75rem", color: "#888", marginLeft: "0.5rem" }}>
                Enter to confirm, Esc to cancel
              </span>
            </span>
          ) : (
            <kbd
              onClick={() => { invoke("set_paused", { paused: true }); setRebinding(true); }}
              style={{
                padding: "0.1rem 0.4rem",
                border: "1px solid #ccc",
                borderRadius: "3px",
                cursor: "pointer",
              }}
              title="Click to rebind"
            >
              {hotkeyDisplay}
            </kbd>
          )}
        </p>
      </div>

      <div>
        <p style={{ fontSize: "0.85rem", margin: 0 }}>
          Status:{" "}
          {connected ? (
            <span>
              Connected
              {lastValue !== null && (
                <span> &mdash; last sent: <strong>{lastValue}</strong></span>
              )}
            </span>
          ) : (
            <span style={{ color: "#888" }}>Not connected</span>
          )}
        </p>
      </div>

      {error && (
        <p style={{ color: "red", fontSize: "0.8rem", marginTop: "0.5rem" }}>
          {error}
        </p>
      )}
    </main>
  );
}

export default App;

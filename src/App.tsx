import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

function App() {
  const [outputs, setOutputs] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [connected, setConnected] = useState(false);
  const [lastValue, setLastValue] = useState<number | null>(null);
  const [error, setError] = useState<string>("");

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
          Hotkey: <kbd style={{ padding: "0.1rem 0.4rem", border: "1px solid #ccc", borderRadius: "3px" }}>
            {navigator.platform.includes("Mac") ? "⌘⇧M" : "Ctrl+Shift+M"}
          </kbd>
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

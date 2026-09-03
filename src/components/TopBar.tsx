import {
  Box, Save, Undo2, Redo2, Download, UserRound, Moon, Sun, FolderOpen,
  Plus, Upload, Maximize2
} from "lucide-react";
import IconButton from "./IconButton";

export default function TopBar({
  mapName, setMapName, saveState, onSave, onUndo, onRedo,
  canUndo, canRedo, onExport, onNew, onLoad, onAssets,
  dark, setDark, onFullscreen
}: {
  mapName: string;
  setMapName: (s: string) => void;
  saveState: "saved" | "saving" | "unsaved";
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onExport: () => void;
  onNew: () => void;
  onLoad: () => void;
  onAssets: () => void;
  dark: boolean;
  setDark: (b: boolean) => void;
  onFullscreen: () => void;
}) {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark"><Box size={19}/></div>
        <strong>WorldForge</strong>
      </div>
      <div className="map-title">
        <input value={mapName} onChange={e => setMapName(e.target.value)} aria-label="Map name" />
        <span className={`save-dot ${saveState}`}></span>
        <span>{saveState === "saved" ? "Saved" : saveState === "saving" ? "Saving…" : "Unsaved"}</span>
      </div>
      <div className="top-actions">
        <IconButton title="New map" onClick={onNew}><Plus size={18}/></IconButton>
        <IconButton title="Load map" onClick={onLoad}><FolderOpen size={18}/></IconButton>
        <IconButton title="Import / export project JSON" onClick={onAssets}><Upload size={18}/></IconButton>
        <IconButton title="Undo (Ctrl+Z)" onClick={onUndo} disabled={!canUndo}><Undo2 size={18}/></IconButton>
        <IconButton title="Redo (Ctrl+Y)" onClick={onRedo} disabled={!canRedo}><Redo2 size={18}/></IconButton>
        <IconButton title="Save (Ctrl+S)" onClick={onSave}><Save size={18}/></IconButton>
        <button className="export-button" onClick={onExport}><Download size={17}/> Export PNG</button>
        <IconButton title="Fullscreen" onClick={onFullscreen}><Maximize2 size={18}/></IconButton>
        <IconButton title={dark ? "Light mode" : "Dark mode"} onClick={() => setDark(!dark)}>
          {dark ? <Sun size={18}/> : <Moon size={18}/>}
        </IconButton>
        <IconButton title="Account" onClick={() => alert("Account mode is available when Supabase is configured. Local/offline saving works now.")}>
          <UserRound size={18}/>
        </IconButton>
      </div>
    </header>
  );
}
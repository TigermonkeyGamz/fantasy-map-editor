import { Eye, EyeOff, Lock, Unlock, Plus, Trash2 } from "lucide-react";
import { Layer } from "../types";
import IconButton from "./IconButton";

export default function LayersPanel({
  layers, setLayers, selectedLayerId, setSelectedLayerId
}: {
  layers: Layer[];
  setLayers: (layers: Layer[]) => void;
  selectedLayerId: string;
  setSelectedLayerId: (id: string) => void;
}) {
  function addLayer() {
    const id = crypto.randomUUID();
    setLayers([...layers, { id, name: `Layer ${layers.length + 1}`, visible: true, locked: false }]);
    setSelectedLayerId(id);
  }
  return (
    <section className="panel-section">
      <div className="panel-heading">
        <span>Layers</span>
        <IconButton title="Add layer" onClick={addLayer}><Plus size={15}/></IconButton>
      </div>
      <div className="layer-list">
        {[...layers].reverse().map(layer => (
          <div key={layer.id} className={`layer-row ${selectedLayerId === layer.id ? "selected" : ""}`} onClick={() => setSelectedLayerId(layer.id)}>
            <button className="plain-icon" onClick={e => {e.stopPropagation(); setLayers(layers.map(l => l.id === layer.id ? {...l, visible: !l.visible} : l))}}>
              {layer.visible ? <Eye size={15}/> : <EyeOff size={15}/>}
            </button>
            <span className="layer-name">{layer.name}</span>
            <button className="plain-icon" onClick={e => {e.stopPropagation(); setLayers(layers.map(l => l.id === layer.id ? {...l, locked: !l.locked} : l))}}>
              {layer.locked ? <Lock size={14}/> : <Unlock size={14}/>}
            </button>
            {layers.length > 1 && <button className="plain-icon danger" onClick={e => {e.stopPropagation(); setLayers(layers.filter(l => l.id !== layer.id))}}>
              <Trash2 size={14}/>
            </button>}
          </div>
        ))}
      </div>
    </section>
  );
}
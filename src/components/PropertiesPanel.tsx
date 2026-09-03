import { MapObject } from "../types";

export default function PropertiesPanel({
  selected, update
}: {
  selected: MapObject | null;
  update: (patch: Partial<MapObject>) => void;
}) {
  if (!selected) return (
    <section className="panel-section">
      <div className="panel-heading">Properties</div>
      <div className="empty-properties">Select an object to edit its transform and appearance.</div>
    </section>
  );

  return (
    <section className="panel-section">
      <div className="panel-heading">Properties</div>
      <div className="field-grid">
        <label>X<input type="number" value={Math.round(selected.x)} onChange={e => update({x: +e.target.value})}/></label>
        <label>Y<input type="number" value={Math.round(selected.y)} onChange={e => update({y: +e.target.value})}/></label>
        <label>Width<input type="number" min="1" value={Math.round(selected.width)} onChange={e => update({width: Math.max(1,+e.target.value)})}/></label>
        <label>Height<input type="number" min="1" value={Math.round(selected.height)} onChange={e => update({height: Math.max(1,+e.target.value)})}/></label>
        <label>Rotation<input type="number" value={Math.round(selected.rotation)} onChange={e => update({rotation: +e.target.value})}/></label>
        <label>Opacity<input type="number" min="0" max="1" step="0.05" value={selected.opacity} onChange={e => update({opacity: Math.max(0, Math.min(1,+e.target.value))})}/></label>
      </div>
      <label className="wide-field">Layer<input value={selected.layerId} readOnly /></label>
      {selected.type === "text" && <>
        <label className="wide-field">Text<input value={selected.text ?? ""} onChange={e => update({text:e.target.value})}/></label>
        <label className="wide-field">Font Size<input type="number" min="8" value={selected.fontSize ?? 28} onChange={e => update({fontSize:+e.target.value})}/></label>
      </>}
    </section>
  );
}
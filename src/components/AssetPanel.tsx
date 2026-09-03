import { useRef } from "react";
import { Upload, Search, Image as ImageIcon } from "lucide-react";
import { Asset } from "../types";
import { uid } from "../lib/id";

export default function AssetPanel({
  assets, onAdd
}: {
  assets: Asset[];
  onAdd: (asset: Asset) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  function importFiles(files: FileList | null) {
    if (!files) return;
    [...files].forEach(file => {
      if (!/^image\\/(png|jpeg|webp|svg\\+xml)$/.test(file.type)) return;
      const src = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        onAdd({ id: uid("asset"), name: file.name.replace(/\\.[^.]+$/, ""), category: "Custom", src, width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = src;
    });
  }

  return (
    <section className="panel-section asset-section">
      <div className="panel-heading"><span>Assets</span><button className="mini-action" onClick={() => ref.current?.click()}><Upload size={14}/> Import</button></div>
      <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" multiple hidden onChange={e => importFiles(e.target.files)} />
      <div className="asset-search"><Search size={14}/><input placeholder="Search assets"/></div>
      <div className="asset-grid">
        {assets.length === 0 && <div className="empty-state"><ImageIcon size={20}/><span>Import PNG, JPG, WEBP or SVG assets.</span></div>}
        {assets.map(a => (
          <button key={a.id} className="asset-card" title={`${a.name} — drag onto canvas`} onClick={() => onAdd({...a, id: uid("asset-copy")})}>
            <img src={a.src} alt="" />
            <span>{a.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
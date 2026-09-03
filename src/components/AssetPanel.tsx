import { useRef } from "react";
import { Upload, Search, Image as ImageIcon } from "lucide-react";
import { Asset } from "../types";
import { uid } from "../lib/id";

interface AssetPanelProps {
  assets: Asset[];
  onAdd: (asset: Asset) => void;
}

export default function AssetPanel({
  assets,
  onAdd,
}: AssetPanelProps) {
  const ref = useRef<HTMLInputElement>(null);

  function importFiles(files: FileList | null) {
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (
        file.type !== "image/png" &&
        file.type !== "image/jpeg" &&
        file.type !== "image/webp" &&
        file.type !== "image/svg+xml"
      ) {
        return;
      }

      const src = URL.createObjectURL(file);
      const img = new Image();

      img.onload = () => {
        onAdd({
          id: uid("asset"),
          name: file.name.replace(/\.[^.]+$/, ""),
          category: "Custom",
          src,
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };

      img.src = src;
    });
  }

  return (
    <section className="panel-section asset-section">
      <div className="panel-heading">
        <span>Assets</span>

        <button
          className="mini-action"
          onClick={() => ref.current?.click()}
          type="button"
        >
          <Upload size={14} />
          Import
        </button>
      </div>

      <input
        ref={ref}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        multiple
        hidden
        onChange={(event) => importFiles(event.target.files)}
      />

      <div className="asset-search">
        <Search size={14} />
        <input
          type="text"
          placeholder="Search assets"
        />
      </div>

      <div className="asset-grid">
        {assets.length === 0 && (
          <div className="empty-state">
            <ImageIcon size={20} />
            <span>
              Import PNG, JPG, WEBP or SVG assets.
            </span>
          </div>
        )}

        {assets.map((asset) => (
          <button
            key={asset.id}
            className="asset-card"
            title={`${asset.name} - drag onto canvas`}
            type="button"
            onClick={() =>
              onAdd({
                ...asset,
                id: uid("asset-copy"),
              })
            }
          >
            <img src={asset.src} alt="" />
            <span>{asset.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

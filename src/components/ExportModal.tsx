import { useEffect, useState } from "react";

export default function ExportModal({
  mapWidth, mapHeight, crop, setCrop, onDownload, onClose
}: {
  mapWidth: number;
  mapHeight: number;
  crop: {x:number;y:number;width:number;height:number};
  setCrop: (c: {x:number;y:number;width:number;height:number}) => void;
  onDownload: (scale:number) => void;
  onClose: () => void;
}) {
  const [scale,setScale]=useState(1);
  const previewW = 620;
  const previewH = Math.min(420, previewW * mapHeight / mapWidth);
  const sx = previewW / mapWidth;
  const sy = previewH / mapHeight;

  useEffect(() => {
    setCrop({
      x: Math.max(0, Math.min(crop.x, mapWidth - crop.width)),
      y: Math.max(0, Math.min(crop.y, mapHeight - crop.height)),
      width: crop.width,
      height: crop.height
    });
  }, [mapWidth,mapHeight]);

  function dragCrop(e: React.PointerEvent<HTMLDivElement>) {
    const el=e.currentTarget;
    el.setPointerCapture(e.pointerId);
    const startX=e.clientX,startY=e.clientY;
    const ox=crop.x,oy=crop.y;
    const move=(ev:PointerEvent)=>{
      const dx=(ev.clientX-startX)/sx,dy=(ev.clientY-startY)/sy;
      setCrop({...crop,x:Math.max(0,Math.min(mapWidth-crop.width,ox+dx)),y:Math.max(0,Math.min(mapHeight-crop.height,oy+dy))});
    };
    const up=()=>{window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",up)};
    window.addEventListener("pointermove",move);window.addEventListener("pointerup",up);
  }

  return <div className="modal-backdrop">
    <div className="modal export-modal">
      <div className="modal-header"><h2>Export PNG</h2><button className="close" onClick={onClose}>×</button></div>
      <div className="export-preview-wrap">
        <div className="export-preview" style={{width:previewW,height:previewH}}>
          <div className="preview-map-grid"/>
          <div className="crop-box" style={{left:crop.x*sx,top:crop.y*sy,width:crop.width*sx,height:crop.height*sy}} onPointerDown={dragCrop}>
            <span>{Math.round(crop.width)} × {Math.round(crop.height)}</span>
          </div>
        </div>
      </div>
      <div className="export-controls">
        <label>Export scale<select value={scale} onChange={e=>setScale(+e.target.value)}><option value="1">1×</option><option value="2">2×</option><option value="4">4×</option></select></label>
        <div className="crop-size">
          <label>Width<input type="number" value={Math.round(crop.width)} onChange={e=>setCrop({...crop,width:Math.max(20,Math.min(mapWidth,+e.target.value))})}/></label>
          <label>Height<input type="number" value={Math.round(crop.height)} onChange={e=>setCrop({...crop,height:Math.max(20,Math.min(mapHeight,+e.target.value))})}/></label>
        </div>
      </div>
      <button className="primary wide" onClick={()=>onDownload(scale)}>Download PNG</button>
    </div>
  </div>;
}
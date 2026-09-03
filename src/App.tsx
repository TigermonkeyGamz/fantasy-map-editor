import { useEffect, useMemo, useRef, useState } from "react";
import Konva from "konva";
import TopBar from "./components/TopBar";
import Toolbar from "./components/Toolbar";
import LayersPanel from "./components/LayersPanel";
import AssetPanel from "./components/AssetPanel";
import PropertiesPanel from "./components/PropertiesPanel";
import EditorCanvas from "./components/EditorCanvas";
import ExportModal from "./components/ExportModal";
import { Asset, HistoryState, MapData, MapObject, Tool } from "./types";
import { newMap } from "./lib/defaultMap";
import { uid } from "./lib/id";
import { loadMaps, saveMaps } from "./lib/storage";

const historyClone = (m: MapData): HistoryState => JSON.parse(JSON.stringify({
  layers:m.layers,objects:m.objects,paths:m.paths,fences:m.fences,terrains:m.terrains,contours:m.contours
}));

export default function App() {
  const [map,setMap] = useState<MapData>(()=>loadMaps()[0] ?? newMap());
  const [tool,setTool] = useState<Tool>("select");
  const [selectedId,setSelectedId] = useState<string|null>(null);
  const [selectedLayerId,setSelectedLayerId] = useState("");
  const [saveState,setSaveState] = useState<"saved"|"saving"|"unsaved">("saved");
  const [maps,setMaps] = useState<MapData[]>(()=>loadMaps());
  const [dark,setDark] = useState(false);
  const [exportOpen,setExportOpen] = useState(false);
  const [crop,setCrop] = useState({x:200,y:150,width:1600,height:1000});
  const [history,setHistory]=useState<HistoryState[]>([]);
  const [redo,setRedo]=useState<HistoryState[]>([]);
  const importRef=useRef<HTMLInputElement>(null);

  useEffect(()=>{if(!selectedLayerId) setSelectedLayerId(map.layers[0]?.id ?? "")},[map.layers,selectedLayerId]);

  function mutate(patch:Partial<MapData>, record=true) {
    if(record) setHistory(h=>[...h,historyClone(map)].slice(-60));
    if(record) setRedo([]);
    setMap(m=>({...m,...patch,modifiedAt:new Date().toISOString()}));
    if(record)setSaveState("unsaved");
  }
  function undo(){const prev=history.at(-1);if(!prev)return;setRedo(r=>[...r,historyClone(map)]);setHistory(h=>h.slice(0,-1));setMap(m=>({...m,...prev}));setSaveState("unsaved")}
  function redoAction(){const next=redo.at(-1);if(!next)return;setHistory(h=>[...h,historyClone(map)]);setRedo(r=>r.slice(0,-1));setMap(m=>({...m,...next}));setSaveState("unsaved")}

  function addAsset(asset:Asset){
    mutate({assets:map.assets.some(a=>a.id===asset.id)?map.assets:[...map.assets,asset]}, false);
    if(asset.id.startsWith("asset-copy")){
      const size=Math.min(320,asset.width,asset.height);
      const obj:MapObject={id:uid("obj"),type:"image",layerId:selectedLayerId,x:400,y:280,width:size,height:size*asset.height/asset.width,rotation:0,scaleX:1,scaleY:1,opacity:1,visible:true,locked:false,imageSrc:asset.src};
      mutate({objects:[...map.objects,obj]});
      setSelectedId(obj.id);
    }
  }

  function addText(x:number,y:number){
    const obj:MapObject={id:uid("text"),type:"text",layerId:selectedLayerId,x,y,width:220,height:50,rotation:0,scaleX:1,scaleY:1,opacity:1,visible:true,locked:false,text:"New Label",fontSize:32,fontFamily:"Inter",fill:dark?"#ffffff":"#18212a"};
    mutate({objects:[...map.objects,obj]});setSelectedId(obj.id);
  }

  function addPath(points:number[]){
    if(points.length<4)return;
    mutate({paths:[...map.paths,{id:uid("path"),type:"path",layerId:selectedLayerId,points,stroke:"#6f6252",strokeWidth:24,opacity:.95,tension:.25,lineCap:"round",lineJoin:"round"}]});
  }

  function addFence(a:{x:number;y:number},b:{x:number;y:number}){
    mutate({fences:[...map.fences,{id:uid("fence"),type:"fence",layerId:selectedLayerId,ax:a.x,ay:a.y,bx:b.x,by:b.y,width:7,postSpacing:34,postSize:13,color:"#4b4f49",opacity:.95}]});
  }

  function addTerrain(points:number[],delta:number){mutate({terrains:[...map.terrains,{id:uid("terrain"),type:"terrain",layerId:selectedLayerId,points,radius:55,delta}]})}
  function addContour(points:number[],elevation:number){mutate({contours:[...map.contours,{id:uid("contour"),type:"contour",layerId:selectedLayerId,points,elevation}]})}

  function save(){
    setSaveState("saving");
    const next=[...maps.filter(m=>m.id!==map.id),map];
    setMaps(next);saveMaps(next);
    setTimeout(()=>setSaveState("saved"),250);
  }

  useEffect(()=>{
    const t=setInterval(()=>{if(saveState==="unsaved") save()},7000);return()=>clearInterval(t);
  },[map,saveState,maps]);

  useEffect(()=>{
    const key=(e:KeyboardEvent)=>{
      const meta=e.ctrlKey||e.metaKey;
      if(meta&&e.key.toLowerCase()==="z"){e.preventDefault();undo()}
      if(meta&&(e.key.toLowerCase()==="y"|| (e.shiftKey&&e.key.toLowerCase()==="z"))){e.preventDefault();redoAction()}
      if(meta&&e.key.toLowerCase()==="s"){e.preventDefault();save()}
      if(e.key==="Delete"&&selectedId){mutate({objects:map.objects.filter(o=>o.id!==selectedId)});setSelectedId(null)}
      if(e.key==="Escape"){setSelectedId(null)}
      if(e.key==="Enter" && (tool==="fence" || tool==="path")){setTool("select")}
    };window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key);
  },[map,selectedId,tool,history,redo]);

  function newMapAction(){
    const m=newMap(`World ${maps.length+1}`);
    setMaps(prev=>[...prev.filter(x=>x.id!==m.id),m]);setMap(m);setSelectedId(null);setHistory([]);setRedo([]);
  }
  function loadMapAction(){
    if(!maps.length){alert("No saved maps yet.");return}
    const menu=maps.map((m,i)=>`${i+1}. ${m.name}`).join("\\n");
    const choice=prompt(`Open map:\\n${menu}\\n\\nEnter a number:`);
    const i=Number(choice)-1;if(Number.isInteger(i)&&maps[i]){setMap(maps[i]);setHistory([]);setRedo([]);setSelectedId(null)}
  }

  function exportJson(){
    const blob=new Blob([JSON.stringify(map,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`${map.name.replace(/\\W+/g,"_")}.worldforge.json`;a.click();URL.revokeObjectURL(url);
  }

  async function exportPng(scale:number){
    // This uses an off-screen render rather than screen capture so export includes the complete map.
    const canvas=document.createElement("canvas");canvas.width=map.width*scale;canvas.height=map.height*scale;
    const ctx=canvas.getContext("2d")!;
    ctx.fillStyle=map.background;ctx.fillRect(0,0,canvas.width,canvas.height);
    const factor=scale;ctx.scale(factor,factor);
    if(map.gridVisible){ctx.strokeStyle="#00000012";ctx.lineWidth=1;for(let x=0;x<=map.width;x+=map.gridSize){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,map.height);ctx.stroke()}for(let y=0;y<=map.height;y+=map.gridSize){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(map.width,y);ctx.stroke()}}
    for(const t of map.paths){ctx.strokeStyle=t.stroke;ctx.globalAlpha=t.opacity;ctx.lineWidth=t.strokeWidth;ctx.lineCap=t.lineCap;ctx.beginPath();for(let i=0;i<t.points.length;i+=2){i?ctx.lineTo(t.points[i],t.points[i+1]):ctx.moveTo(t.points[i],t.points[i+1])}ctx.stroke()}
    for(const f of map.fences){ctx.strokeStyle=f.color;ctx.globalAlpha=f.opacity;ctx.lineWidth=f.width;ctx.beginPath();ctx.moveTo(f.ax,f.ay);ctx.lineTo(f.bx,f.by);ctx.stroke();ctx.fillStyle=f.color;const dx=f.bx-f.ax,dy=f.by-f.ay,len=Math.hypot(dx,dy),ux=dx/Math.max(len,1),uy=dy/Math.max(len,1);for(let d=0;d<=len;d+=f.postSpacing){ctx.fillRect(f.ax+ux*d-f.postSize/2,f.ay+uy*d-f.postSize/2,f.postSize,f.postSize)}}
    ctx.globalAlpha=1;
    for(const o of map.objects){if(!o.visible)continue;ctx.save();ctx.translate(o.x,o.y);ctx.rotate(o.rotation*Math.PI/180);ctx.globalAlpha=o.opacity;if(o.type==="text"){ctx.fillStyle=o.fill??"#18212a";ctx.font=`${o.fontStyle??""} ${o.fontSize??28}px ${o.fontFamily??"Inter"}`;ctx.fillText(o.text??"",0,0)} else if(o.imageSrc){const im=await new Promise<HTMLImageElement>(res=>{const i=new Image();i.onload=()=>res(i);i.src=o.imageSrc!});ctx.drawImage(im,0,0,o.width,o.height)}ctx.restore()}
    const full=document.createElement("canvas");full.width=crop.width*scale;full.height=crop.height*scale;full.getContext("2d")!.drawImage(canvas,crop.x*scale,crop.y*scale,crop.width*scale,crop.height*scale,0,0,crop.width*scale,crop.height*scale);
    const a=document.createElement("a");a.href=full.toDataURL("image/png");a.download=`${map.name.replace(/\\W+/g,"_")}.png`;a.click();setExportOpen(false);
  }

  const selected=map.objects.find(o=>o.id===selectedId)??null;

  return <div className={dark?"app dark":"app"}>
    <TopBar mapName={map.name} setMapName={name=>mutate({name})} saveState={saveState} onSave={save} onUndo={undo} onRedo={redoAction}
      canUndo={history.length>0} canRedo={redo.length>0} onExport={()=>setExportOpen(true)} onNew={newMapAction} onLoad={loadMapAction} onAssets={()=>importRef.current?.click()} dark={dark} setDark={setDark}
      onFullscreen={()=>document.documentElement.requestFullscreen?.()}/>
    <div className="workspace">
      <Toolbar tool={tool} setTool={setTool} gridVisible={map.gridVisible} setGridVisible={v=>mutate({gridVisible:v})}/>
      <main className="editor-main">
        <EditorCanvas map={map} tool={tool} selectedId={selectedId} onSelect={setSelectedId} onChange={mutate} addPath={addPath} addFence={addFence}
          addTerrain={addTerrain} addContour={addContour} addText={addText} selectedLayerId={selectedLayerId} snap={true}/>
      </main>
      <aside className="right-sidebar">
        <PropertiesPanel selected={selected} update={patch=>selected&&mutate({objects:map.objects.map(o=>o.id===selected.id?{...o,...patch}:o)})}/>
        <AssetPanel assets={map.assets} onAdd={addAsset}/>
        <LayersPanel layers={map.layers} setLayers={layers=>mutate({layers})} selectedLayerId={selectedLayerId} setSelectedLayerId={setSelectedLayerId}/>
        <section className="panel-section map-settings">
          <div className="panel-heading">Map settings</div>
          <label className="wide-field">Description<textarea value={map.description} onChange={e=>mutate({description:e.target.value})}/></label>
          <div className="field-grid"><label>Width<input type="number" value={map.width} onChange={e=>mutate({width:+e.target.value})}/></label><label>Height<input type="number" value={map.height} onChange={e=>mutate({height:+e.target.value})}/></label><label>Grid / m<input type="number" value={map.scaleMetersPerGrid} onChange={e=>mutate({scaleMetersPerGrid:+e.target.value})}/></label><label>Grid size<input type="number" value={map.gridSize} onChange={e=>mutate({gridSize:+e.target.value})}/></label></div>
          <button className="secondary wide" onClick={exportJson}>Export project JSON</button>
        </section>
      </aside>
    </div>
    <input ref={importRef} type="file" hidden accept=".json" onChange={async e=>{const f=e.target.files?.[0];if(!f)return;try{const parsed=JSON.parse(await f.text());setMap(parsed);setSaveState("unsaved");}catch{alert("Invalid WorldForge JSON file.")}}}/>
    {exportOpen && <ExportModal mapWidth={map.width} mapHeight={map.height} crop={crop} setCrop={setCrop} onDownload={exportPng} onClose={()=>setExportOpen(false)}/>}
  </div>;
}
import { useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer as KLayer, Rect, Line, Image as KImage, Text, Circle, Group, Transformer } from "react-konva";
import Konva from "konva";
import { Asset, FenceSegment, MapData, MapObject, PathObject, Tool, TerrainStroke, Contour } from "../types";

function AssetImage({obj,onSelect,onDragEnd}: {obj:MapObject;onSelect:()=>void;onDragEnd:(x:number,y:number)=>void}) {
  const [image,setImage]=useState<HTMLImageElement>();
  useEffect(()=>{
    const src=obj.imageSrc;
    if(!src)return;
    const img=new Image();
    img.onload=()=>setImage(img);
    img.src=src;
    return()=>{ img.onload=null; };
  },[obj.imageSrc]);
  return <KImage image={image} x={obj.x} y={obj.y} width={obj.width} height={obj.height} rotation={obj.rotation}
    scaleX={obj.scaleX} scaleY={obj.scaleY} opacity={obj.opacity} draggable={!obj.locked} onClick={onSelect} onTap={onSelect}
    onDragEnd={e=>onDragEnd(e.target.x(),e.target.y())}/>;
}

function gridLines(map:MapData) {
  const out: React.ReactNode[]=[];
  if(!map.gridVisible) return out;
  for(let x=0;x<=map.width;x+=map.gridSize) out.push(<Line key={`gx${x}`} points={[x,0,x,map.height]} stroke="#00000012" strokeWidth={1}/>);
  for(let y=0;y<=map.height;y+=map.gridSize) out.push(<Line key={`gy${y}`} points={[0,y,map.width,y]} stroke="#00000012" strokeWidth={1}/>);
  return out;
}

function drawFence(f:FenceSegment) {
  const dx=f.bx-f.ax,dy=f.by-f.ay,len=Math.hypot(dx,dy),ux=dx/Math.max(len,1),uy=dy/Math.max(len,1),nx=-uy,ny=ux;
  const posts=[];
  for(let d=0;d<=len;d+=Math.max(8,f.postSpacing)){
    const x=f.ax+ux*d,y=f.ay+uy*d;
    posts.push(<Rect key={d} x={x-f.postSize/2} y={y-f.postSize/2} width={f.postSize} height={f.postSize} fill={f.color} opacity={f.opacity}/>);
  }
  return <Group key={f.id}><Line points={[f.ax,f.ay,f.bx,f.by]} stroke={f.color} strokeWidth={f.width} opacity={f.opacity} lineCap="round" lineJoin="round"/>{posts}</Group>;
}

export default function EditorCanvas({
  map, tool, selectedId, onSelect, onChange, addPath, addFence, addTerrain, addContour, addText, selectedLayerId, snap
}: {
  map:MapData; tool:Tool; selectedId:string|null; onSelect:(id:string|null)=>void; onChange:(p:Partial<MapData>)=>void;
  addPath:(p:number[])=>void; addFence:(a:{x:number;y:number},b:{x:number;y:number})=>void;
  addTerrain:(p:number[],delta:number)=>void; addContour:(p:number[],e:number)=>void; addText:(x:number,y:number)=>void;
  selectedLayerId:string; snap:boolean;
}) {
  const stageRef=useRef<Konva.Stage>(null);
  const wrapRef=useRef<HTMLDivElement>(null);
  const [scale,setScale]=useState(.75),[pos,setPos]=useState({x:40,y:40});
  const [draft,setDraft]=useState<number[]>([]),[fenceStart,setFenceStart]=useState<{x:number;y:number}|null>(null);
  const [terrainDraft,setTerrainDraft]=useState<number[]>([]);
  const [cursor,setCursor]=useState({x:0,y:0});

  useEffect(()=>{function key(e:KeyboardEvent){
    if(e.key==="Escape"){setDraft([]);setFenceStart(null);setTerrainDraft([])}
  } window.addEventListener("keydown",key); return()=>window.removeEventListener("keydown",key)},[]);

  function pointerPos(e:Konva.KonvaEventObject<PointerEvent>) {
    const p=e.target.getStage()!.getPointerPosition()!;
    const x=(p.x-pos.x)/scale,y=(p.y-pos.y)/scale;
    if(snap){return {x:Math.round(x/map.gridSize)*map.gridSize,y:Math.round(y/map.gridSize)*map.gridSize};}
    return {x,y};
  }

  function handleDown(e:Konva.KonvaEventObject<PointerEvent>) {
    const p=pointerPos(e); setCursor(p);
    if(tool==="select" && e.target===e.target.getStage()) onSelect(null);
    if(tool==="path"){ if(draft.length>=4 && (e.evt.detail>=2)){addPath(draft);setDraft([])} else setDraft([...draft,p.x,p.y]); }
    if(tool==="fence"){ if(!fenceStart)setFenceStart(p); else {addFence(fenceStart,p);setFenceStart(p)}}
    if(tool==="terrain"){setTerrainDraft([p.x,p.y])}
    if(tool==="contour"){ if(terrainDraft.length>=4 && e.evt.detail>=2){addContour(terrainDraft,Math.round(p.y/10)*10);setTerrainDraft([])} else setTerrainDraft([...terrainDraft,p.x,p.y]);}
    if(tool==="text") addText(p.x,p.y);
    if(tool==="measure") setMeasureStart(p);
  }

  function handleMove(e:Konva.KonvaEventObject<MouseEvent>) {
    const p=pointerPos(e); setCursor(p);
    if(tool==="terrain" && (e.evt.buttons&1)===1){
      setTerrainDraft(d=>[...d.slice(-2),p.x,p.y]);
    }
  }

  function handleUp(){ if(tool==="terrain" && terrainDraft.length>=4){addTerrain(terrainDraft,.25);setTerrainDraft([])}}

  const [measureStart,setMeasureStart]=useState<{x:number;y:number}|null>(null);
  const measureEnd=measureStart?cursor:null;
  const selected=map.objects.find(o=>o.id===selectedId);

  useEffect(()=>{
    const el=wrapRef.current;if(!el)return;
    const wheel=(ev:WheelEvent)=>{
      ev.preventDefault();
      const factor=ev.deltaY<0?1.08:.92;
      setScale(s=>Math.max(.2,Math.min(3,s*factor)));
    };
    el.addEventListener("wheel",wheel,{passive:false});return()=>el.removeEventListener("wheel",wheel);
  },[]);

  return <div className="canvas-wrap" ref={wrapRef}>
    <div className="canvas-hint">{tool==="fence" ? (fenceStart ? "Click to place next fence segment • Enter finishes" : "Click Point A • Click again to place B") : tool==="path" ? (draft.length ? "Click points • Double-click or Enter to finish" : "Click to start a path") : "Space + drag or middle mouse to pan • Wheel to zoom"}</div>
    <Stage ref={stageRef} width={window.innerWidth} height={window.innerHeight} scaleX={scale} scaleY={scale} x={pos.x} y={pos.y}
      onPointerDown={handleDown} onPointerMove={handleMove} onPointerUp={handleUp}>
      <KLayer>
        <Rect x={0} y={0} width={map.width} height={map.height} fill={map.background}/>
        {gridLines(map)}
        {map.terrains.map((t:TerrainStroke)=><Line key={t.id} points={t.points} stroke="#6aa45b30" strokeWidth={t.radius} lineCap="round" lineJoin="round"/>)}
        {map.contours.map((c:Contour)=><Line key={c.id} points={c.points} stroke="#7d6d4d" strokeWidth={1.5} lineCap="round" lineJoin="round"/>)}
        {map.paths.map((p:PathObject)=><Line key={p.id} points={p.points} stroke={p.stroke} strokeWidth={p.strokeWidth} opacity={p.opacity} tension={p.tension} lineCap={p.lineCap} lineJoin={p.lineJoin}/>)}
        {map.fences.map(drawFence)}
        {map.layers.filter(l=>l.visible).flatMap(l=>map.objects.filter(o=>o.layerId===l.id && o.visible).map(o=>o.type==="image"
          ? <AssetImage key={o.id} obj={o} onSelect={()=>onSelect(o.id)} onDragEnd={(x,y)=>onChange({objects:map.objects.map(q=>q.id===o.id?{...q,x,y}:q)})}/>
          : <Text key={o.id} x={o.x} y={o.y} text={o.text??""} fontSize={o.fontSize??28} fontFamily={o.fontFamily??"Inter"} fontStyle={o.fontStyle??"normal"} fill={o.fill??"#18212a"} opacity={o.opacity} rotation={o.rotation} draggable={!o.locked} onClick={()=>onSelect(o.id)} onDragEnd={e=>onChange({objects:map.objects.map(q=>q.id===o.id?{...q,x:e.target.x(),y:e.target.y()}:q)})}/>
        ))}
        {draft.length>=2 && <Line points={[...draft,cursor.x,cursor.y]} stroke="#4d78ff" strokeWidth={6} opacity={.8} dash={[10,8]} lineCap="round" lineJoin="round"/>}
        {fenceStart && <Group><Line points={[fenceStart.x,fenceStart.y,cursor.x,cursor.y]} stroke="#33404b" strokeWidth={6} opacity={.85} dash={[8,8]} lineCap="round"/><Text x={cursor.x+12} y={cursor.y+12} text={`${(Math.hypot(cursor.x-fenceStart.x,cursor.y-fenceStart.y)/map.gridSize*map.scaleMetersPerGrid).toFixed(1)} m`} fontSize={18} fill="#33404b"/></Group>}
        {terrainDraft.length>=2 && <Line points={terrainDraft} stroke="#6aa45b" strokeWidth={20} opacity={.3} lineCap="round"/>}
        {measureStart && measureEnd && <Group><Line points={[measureStart.x,measureStart.y,measureEnd.x,measureEnd.y]} stroke="#9c4cff" strokeWidth={3} dash={[6,6]}/><Circle x={measureStart.x} y={measureStart.y} radius={5} fill="#9c4cff"/><Circle x={measureEnd.x} y={measureEnd.y} radius={5} fill="#9c4cff"/><Text x={measureEnd.x+12} y={measureEnd.y+12} text={`${(Math.hypot(measureEnd.x-measureStart.x,measureEnd.y-measureStart.y)/map.gridSize*map.scaleMetersPerGrid).toFixed(1)} m`} fontSize={18} fill="#5f298e"/></Group>}
      </KLayer>
      {selected && selected.type==="image" && <KLayer><Transformer /></KLayer>}
    </Stage>
    <div className="coord-readout">{Math.round(cursor.x)}, {Math.round(cursor.y)} px</div>
  </div>;
}
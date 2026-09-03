import {
  MousePointer2, ImagePlus, Route, Fence, Mountain, Waves,
  Type, Ruler, Hand, Grid3X3
} from "lucide-react";
import { Tool } from "../types";
import IconButton from "./IconButton";

const tools: { id: Tool; label: string; icon: React.ReactNode }[] = [
  { id: "select", label: "Select", icon: <MousePointer2 size={18}/> },
  { id: "object", label: "Object / Building", icon: <ImagePlus size={18}/> },
  { id: "path", label: "Path / Road", icon: <Route size={18}/> },
  { id: "fence", label: "Fence / Wall", icon: <Fence size={18}/> },
  { id: "terrain", label: "Terrain brush", icon: <Mountain size={18}/> },
  { id: "contour", label: "Contour line", icon: <Waves size={18}/> },
  { id: "text", label: "Text / Label", icon: <Type size={18}/> },
  { id: "measure", label: "Measure", icon: <Ruler size={18}/> },
  { id: "hand", label: "Pan", icon: <Hand size={18}/> }
];

export default function Toolbar({
  tool,
  setTool,
  gridVisible,
  setGridVisible
}: {
  tool: Tool;
  setTool: (t: Tool) => void;
  gridVisible: boolean;
  setGridVisible: (v: boolean) => void;
}) {
  return (
    <div className="left-toolbar">
      {tools.map((t) => (
        <IconButton key={t.id} title={t.label} active={tool === t.id} onClick={() => setTool(t.id)}>
          {t.icon}
        </IconButton>
      ))}
      <div className="toolbar-divider" />
      <IconButton title={gridVisible ? "Hide grid" : "Show grid"} active={gridVisible} onClick={() => setGridVisible(!gridVisible)}>
        <Grid3X3 size={18}/>
      </IconButton>
    </div>
  );
}
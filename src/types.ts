export type Tool =
  | "select"
  | "object"
  | "path"
  | "fence"
  | "terrain"
  | "contour"
  | "text"
  | "measure"
  | "hand";

export type Layer = {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
};

export type Asset = {
  id: string;
  name: string;
  category: string;
  src: string;
  width: number;
  height: number;
};

export type MapObject = {
  id: string;
  type: "image" | "text";
  layerId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  imageSrc?: string;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: string;
  fill?: string;
};

export type PathObject = {
  id: string;
  type: "path";
  layerId: string;
  points: number[];
  stroke: string;
  strokeWidth: number;
  opacity: number;
  tension: number;
  lineCap: "butt" | "round" | "square";
  lineJoin: "miter" | "round" | "bevel";
};

export type FenceSegment = {
  id: string;
  type: "fence";
  layerId: string;
  ax: number;
  ay: number;
  bx: number;
  by: number;
  width: number;
  postSpacing: number;
  postSize: number;
  color: string;
  opacity: number;
};

export type TerrainStroke = {
  id: string;
  type: "terrain";
  layerId: string;
  points: number[];
  radius: number;
  delta: number;
};

export type Contour = {
  id: string;
  type: "contour";
  layerId: string;
  points: number[];
  elevation: number;
};

export type MapData = {
  id: string;
  name: string;
  description: string;
  width: number;
  height: number;
  background: string;
  gridVisible: boolean;
  gridSize: number;
  scaleMetersPerGrid: number;
  layers: Layer[];
  objects: MapObject[];
  paths: PathObject[];
  fences: FenceSegment[];
  terrains: TerrainStroke[];
  contours: Contour[];
  assets: Asset[];
  modifiedAt: string;
};

export type HistoryState = Pick<
  MapData,
  "layers" | "objects" | "paths" | "fences" | "terrains" | "contours"
>;
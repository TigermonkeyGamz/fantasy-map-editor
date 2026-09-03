import { MapData } from "../types";
import { uid } from "./id";

export function newMap(name = "Untitled World"): MapData {
  const terrainId = uid("layer");
  const roadsId = uid("layer");
  const buildingsId = uid("layer");
  const labelsId = uid("layer");

  return {
    id: uid("map"),
    name,
    description: "A new world layout.",
    width: 2400,
    height: 1600,
    background: "#dfe9d2",
    gridVisible: true,
    gridSize: 40,
    scaleMetersPerGrid: 10,
    layers: [
      { id: terrainId, name: "Terrain", visible: true, locked: false },
      { id: roadsId, name: "Roads", visible: true, locked: false },
      { id: buildingsId, name: "Buildings", visible: true, locked: false },
      { id: labelsId, name: "Labels", visible: true, locked: false }
    ],
    objects: [],
    paths: [],
    fences: [],
    terrains: [],
    contours: [],
    assets: [],
    modifiedAt: new Date().toISOString()
  };
}
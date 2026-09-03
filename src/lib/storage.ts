import { MapData } from "../types";

const MAP_KEY = "worldforge.maps.v1";
const ASSET_KEY = "worldforge.assets.v1";

export function loadMaps(): MapData[] {
  try {
    return JSON.parse(localStorage.getItem(MAP_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveMaps(maps: MapData[]) {
  localStorage.setItem(MAP_KEY, JSON.stringify(maps));
}

export function loadSharedAssets() {
  try {
    return JSON.parse(localStorage.getItem(ASSET_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveSharedAssets(assets: unknown[]) {
  localStorage.setItem(ASSET_KEY, JSON.stringify(assets));
}
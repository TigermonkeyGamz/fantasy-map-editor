import Konva from "konva";

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

export function exportStageCrop(
  stage: Konva.Stage,
  crop: { x: number; y: number; width: number; height: number },
  pixelRatio: number
) {
  const uri = stage.toDataURL({
    x: crop.x,
    y: crop.y,
    width: crop.width,
    height: crop.height,
    pixelRatio,
    mimeType: "image/png"
  });
  return uri;
}
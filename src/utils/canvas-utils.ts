export const createCheckerboardPattern = (
  cellSize = 10,
  lightColor = "#ffffff",
  darkColor = "#eeeeee"
): HTMLImageElement => {
  const patternCanvas = document.createElement("canvas");
  const size = cellSize * 2;
  patternCanvas.width = size;
  patternCanvas.height = size;
  
  const ctx = patternCanvas.getContext("2d");
  
  if (ctx) {
    ctx.fillStyle = lightColor;
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = darkColor;
    ctx.fillRect(0, 0, cellSize, cellSize);
    ctx.fillRect(cellSize, cellSize, cellSize, cellSize);
  }
  
  const img = new Image();
  img.src = patternCanvas.toDataURL();
  
  return img;
};

export const calculateCanvasSize = () => {
  return {
    width: window.innerWidth - 60,
    height: window.innerHeight - 120,
  };
};

export const calculateEffectiveEraserSize = (size: number, hardness: number): number => {
  const minEffectiveRatio = 0.6;
  const hardnessRatio = hardness / 100;
  
  return size * (minEffectiveRatio + (1 - minEffectiveRatio) * hardnessRatio);
};

export const calculateEraserPressure = (hardness: number): number => {
  const minPressure = 0.2;
  const hardnessRatio = hardness / 100;
  
  return minPressure + (1 - minPressure) * hardnessRatio;
}; 
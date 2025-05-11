/**
 * Создает изображение с шахматным узором для фона холста
 * @param cellSize размер ячейки шахматного узора
 * @param lightColor цвет светлой ячейки
 * @param darkColor цвет темной ячейки
 * @returns HTMLImageElement с шахматным узором
 */
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
    // Заливка светлым фоном
    ctx.fillStyle = lightColor;
    ctx.fillRect(0, 0, size, size);
    
    // Заливка темных ячеек
    ctx.fillStyle = darkColor;
    ctx.fillRect(0, 0, cellSize, cellSize);
    ctx.fillRect(cellSize, cellSize, cellSize, cellSize);
  }
  
  const img = new Image();
  img.src = patternCanvas.toDataURL();
  
  return img;
};

/**
 * Рассчитывает размеры холста на основе размера окна
 * @returns объект с шириной и высотой холста
 */
export const calculateCanvasSize = () => {
  return {
    width: window.innerWidth - 60,
    height: window.innerHeight - 120,
  };
};

/**
 * Рассчитывает эффективный размер ластика на основе его размера и жесткости
 * @param size размер ластика
 * @param hardness жесткость ластика (0-100)
 * @returns эффективный размер ластика
 */
export const calculateEffectiveEraserSize = (size: number, hardness: number): number => {
  // При 100% жесткости размер равен указанному размеру
  // При 0% жесткости размер уменьшается до 60% от указанного
  const minEffectiveRatio = 0.6;
  const hardnessRatio = hardness / 100;
  
  return size * (minEffectiveRatio + (1 - minEffectiveRatio) * hardnessRatio);
};

/**
 * Рассчитывает давление ластика на основе его жесткости
 * @param hardness жесткость ластика (0-100)
 * @returns давление ластика (0-1)
 */
export const calculateEraserPressure = (hardness: number): number => {
  // При 100% жесткости давление максимальное (1)
  // При 0% жесткости давление минимальное (0.2)
  const minPressure = 0.2;
  const hardnessRatio = hardness / 100;
  
  return minPressure + (1 - minPressure) * hardnessRatio;
}; 
export const roundToTwoDecimals = (value: number): number => {
  return Math.round(value * 100) / 100;
};

export const formatDimensionDisplay = (value: number): string => {
  const rounded = roundToTwoDecimals(value);
  if (Math.floor(rounded) === rounded) {
    return rounded.toString();
  }
  return rounded.toFixed(2);
}; 
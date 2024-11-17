// Predefined colors for laps visualization
const LAP_COLORS = [
  '#2196f3', // Blue
  '#4caf50', // Green
  '#f44336', // Red
  '#ff9800', // Orange
  '#9c27b0', // Purple
  '#00bcd4', // Cyan
  '#795548', // Brown
  '#009688', // Teal
];

/**
 * Gets a color for a lap based on its index in the selected laps array
 * @param index The index of the lap in the selected laps array
 * @returns A color string from the predefined palette
 */
export const getLapColor = (index: number): string => {
  return LAP_COLORS[index % LAP_COLORS.length];
};

// Utility functions for handling Google Fonts

// Default system fonts that don't need to be loaded from Google Fonts
const SYSTEM_FONTS = new Set([
  "Arial", "Times New Roman", "Courier New",
  "Georgia", "Comic Sans MS",
  "Tahoma", "Trebuchet MS", "Arial Black", "Lucida Sans",
  "Ubuntu", "Open Sans", "Roboto", "Lato", // These last ones might be available as web fonts
  "serif", "sans-serif", "monospace", "cursive", "fantasy"
]);

/**
 * Check if a font is a Google Font (not a system font)
 */
export const isGoogleFont = (fontFamily: string): boolean => {
  return !SYSTEM_FONTS.has(fontFamily);
};

/**
 * Load a single Google Font
 */
export const loadGoogleFont = (fontFamily: string): void => {
  if (!isGoogleFont(fontFamily)) return;
  
  // Check if font is already loaded
  const existingLink = document.querySelector(`link[href*="${fontFamily.replace(/\s+/g, '+')}"]`);
  if (existingLink) return;

  const link = document.createElement('link');
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@400;700&display=swap`;
  link.rel = 'stylesheet';
  document.head.appendChild(link);
};

/**
 * Load multiple Google Fonts
 */
export const loadGoogleFonts = (fontFamilies: string[]): void => {
  const uniqueFonts = [...new Set(fontFamilies)];
  uniqueFonts.forEach(font => loadGoogleFont(font));
};

/**
 * Extract all unique font families from renderable objects
 */
export const extractFontsFromRenderableObjects = (renderableObjects: any[]): string[] => {
  const fonts = new Set<string>();
  
  renderableObjects.forEach(obj => {
    // Check if it's a text element
    if (obj.type === 'text' && obj.fontFamily) {
      fonts.add(obj.fontFamily);
    }
  });
  
  return Array.from(fonts);
};

/**
 * Load all Google Fonts used in renderable objects
 */
export const loadProjectFonts = (renderableObjects: any[]): void => {
  const usedFonts = extractFontsFromRenderableObjects(renderableObjects);
  const googleFonts = usedFonts.filter(isGoogleFont);
  
  if (googleFonts.length > 0) {
    console.log('Loading Google Fonts for project:', googleFonts);
    loadGoogleFonts(googleFonts);
  }
}; 
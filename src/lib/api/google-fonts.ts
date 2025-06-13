import axios from 'axios';

// Google Font interface
export interface GoogleFont {
  family: string;
  variants: string[];
  subsets: string[];
  version: string;
  lastModified: string;
  files: { [key: string]: string };
  category: string;
  kind: string;
  menu: string;
}

export interface GoogleFontsResponse {
  kind: string;
  items: GoogleFont[];
}

// Create axios instance for Google Fonts API
const googleFontsApiClient = axios.create({
  baseURL: 'https://www.googleapis.com/webfonts/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Load Google Fonts from API
 * @returns Promise with fonts response
 */
export const loadGoogleFonts = async (): Promise<GoogleFont[]> => {
  // Get API key from environment variables
  const apiKey = import.meta.env.VITE_GOOGLE_FONTS_API_KEY;
  
  if (!apiKey) {
    console.warn('Google Fonts API key not configured. Using empty fonts list.');
    return [];
  }

  try {
    const response = await googleFontsApiClient.get<GoogleFontsResponse>(
      `/webfonts?key=${apiKey}&sort=popularity`
    );

    return response.data.items || [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        if (error.response.status === 403) {
          throw new Error('Invalid Google Fonts API key. Please check your VITE_GOOGLE_FONTS_API_KEY in .env.local file.');
        }
        throw new Error(`Google Fonts API Error: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.request) {
        throw new Error('Network error: No response from Google Fonts API');
      } else {
        throw new Error(`Request setup error: ${error.message}`);
      }
    } else {
      throw new Error(`Unexpected error: ${error}`);
    }
  }
}; 
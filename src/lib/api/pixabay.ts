import axios from 'axios';

// Pixabay image interface
export interface PixabayImage {
  id: number;
  webformatURL: string;
  previewURL: string;
  tags: string;
  user: string;
  views: number;
  downloads: number;
  likes: number;
  webformatWidth: number;
  webformatHeight: number;
}

export interface PixabayResponse {
  total: number;
  totalHits: number;
  hits: PixabayImage[];
}

export interface PixabaySearchParams {
  query: string;
  color?: string;
  orientation?: string;
  perPage?: number;
}

// Create axios instance for Pixabay API
const pixabayApiClient = axios.create({
  baseURL: 'https://pixabay.com/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Search images on Pixabay
 * @param params - Search parameters
 * @returns Promise with search response
 */
export const searchPixabayImages = async (params: PixabaySearchParams): Promise<PixabayResponse> => {
  const apiKey = import.meta.env.VITE_PIXABAY_API_KEY;
  
  const searchParams = new URLSearchParams();
  searchParams.append('key', apiKey);
  searchParams.append('q', params.query.trim());
  searchParams.append('image_type', 'all');
  searchParams.append('per_page', (params.perPage || 200).toString());
  searchParams.append('safesearch', 'true');
  searchParams.append('order', 'popular');

  // Add optional filters
  if (params.color) {
    searchParams.append('colors', params.color);
  }

  if (params.orientation) {
    searchParams.append('orientation', params.orientation);
  }

  try {
    const response = await pixabayApiClient.get<PixabayResponse>(`/?${searchParams.toString()}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(`Pixabay API Error: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.request) {
        throw new Error('Network error: No response from Pixabay API');
      } else {
        throw new Error(`Request setup error: ${error.message}`);
      }
    } else {
      throw new Error(`Unexpected error: ${error}`);
    }
  }
}; 
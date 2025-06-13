import axios from 'axios';

// Unsplash image interface
export interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string;
  user: {
    name: string;
  };
  likes: number;
  width: number;
  height: number;
}

export interface UnsplashResponse {
  total: number;
  total_pages: number;
  results: UnsplashImage[];
}

export interface UnsplashSearchParams {
  query: string;
  color?: string;
  orientation?: string;
  perPage?: number;
}

// Create axios instance for Unsplash API
const unsplashApiClient = axios.create({
  baseURL: 'https://api.unsplash.com',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Check if Unsplash API key is configured
 */
export const isUnsplashConfigured = (): boolean => {
  const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
  return accessKey && accessKey !== 'your_unsplash_access_key_here';
};

/**
 * Search images on Unsplash
 * @param params - Search parameters
 * @returns Promise with search response
 */
export const searchUnsplashImages = async (params: UnsplashSearchParams): Promise<UnsplashResponse> => {
  const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
  
  if (!accessKey || accessKey === 'your_unsplash_access_key_here') {
    throw new Error('Unsplash API key not configured. Please add VITE_UNSPLASH_ACCESS_KEY to your .env.local file. Get your free API key from https://unsplash.com/developers');
  }

  const searchParams = new URLSearchParams();
  searchParams.append('query', params.query.trim());
  searchParams.append('per_page', (params.perPage || 30).toString());
  searchParams.append('order_by', 'popular');

  // Add optional filters
  if (params.color) {
    searchParams.append('color', params.color);
  }

  if (params.orientation) {
    searchParams.append('orientation', params.orientation);
  }

  try {
    const response = await unsplashApiClient.get<UnsplashResponse>(
      `/search/photos?${searchParams.toString()}`,
      {
        headers: {
          'Authorization': `Client-ID ${accessKey}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error('Invalid Unsplash API key. Please check your VITE_UNSPLASH_ACCESS_KEY in .env.local file.');
        }
        throw new Error(`Unsplash API Error: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.request) {
        throw new Error('Network error: No response from Unsplash API');
      } else {
        throw new Error(`Request setup error: ${error.message}`);
      }
    } else {
      throw new Error(`Unexpected error: ${error}`);
    }
  }
}; 
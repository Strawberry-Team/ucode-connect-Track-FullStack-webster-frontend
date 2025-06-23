import axios from 'axios';
import type { CsrfTokenResponse } from '@/types/auth';
import Cookies from 'js-cookie'; 

// Define the environment
const isProduction = import.meta.env.NODE_ENV === 'production';

// Configure the API URL based on the environment
const API_BASE_URL = isProduction 
  ? '/api' // For production, use relative path
  : `${import.meta.env.VITE_API_BASE_URL}/api`; // For development

const ACCESS_TOKEN_KEY = 'accessToken'; 

let csrfTokenCache: string | null = null;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const fetchCsrfTokenInternal = async (): Promise<string> => {
  try {
    // Form the URL for fetching the CSRF token based on the environment
    const csrfUrl = isProduction 
      ? '/api/auth/csrf-token' 
      : `${import.meta.env.VITE_API_BASE_URL}/api/auth/csrf-token`;
      
    const response = await axios.get<CsrfTokenResponse>(csrfUrl, { withCredentials: true });
    console.log('CSRF token fetched internally (axios-instance):', response.data.csrfToken);
    return response.data.csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token internally (axios-instance):', error);
    throw new Error('Could not fetch CSRF token internally. Please try again.');
  }
};

export const fetchAndCacheCsrfToken = async (): Promise<string> => {
  try {
    const token = await fetchCsrfTokenInternal();
    csrfTokenCache = token;
    return token;
  } catch (error) {
    throw error; 
  }
};

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const accessToken = Cookies.get(ACCESS_TOKEN_KEY);
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      console.log('Interceptor (axios-instance): Authorization header added.');
    }

    if (config.method && !['get', 'head', 'options'].includes(config.method.toLowerCase())) {
      if (!csrfTokenCache) {
        try {
          console.log('Interceptor (axios-instance): CSRF token not in cache, fetching...');
          await fetchAndCacheCsrfToken(); 
        } catch (error) {
          console.error('Interceptor (axios-instance): Failed to fetch CSRF token:', error);
        }
      }
      if (csrfTokenCache) {
        config.headers['X-CSRF-Token'] = csrfTokenCache;
        console.log('Interceptor (axios-instance): X-CSRF-Token added.');
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('Interceptor (axios-instance): Received 401');

      if (originalRequest.method && !['get', 'head', 'options'].includes(originalRequest.method.toLowerCase())) {
        console.log('Interceptor (axios-instance): Attempting to re-fetch CSRF token for non-GET request...');
        try {
          const newCsrfToken = await fetchAndCacheCsrfToken(); 
          if (newCsrfToken) {
            originalRequest.headers['X-CSRF-Token'] = newCsrfToken;
            const currentAccessToken = Cookies.get(ACCESS_TOKEN_KEY);
            if (currentAccessToken) {
              originalRequest.headers.Authorization = `Bearer ${currentAccessToken}`;
            }
            return apiClient(originalRequest);
          }
        } catch (csrfError) {
          console.error('Interceptor (axios-instance): Failed to re-fetch CSRF token after 401:', csrfError);
        }
      }
      
    }
    return Promise.reject(error);
  }
);

export const initializeCsrfTokenOnAppLoad = async () => {
  try {
    await fetchAndCacheCsrfToken();
    console.log('CSRF token initialized and cached via initializeCsrfTokenOnAppLoad (axios-instance).');
  } catch (error) {
    console.error('Failed to initialize CSRF token on app load (axios-instance):', error);
  }
};

export default apiClient; 
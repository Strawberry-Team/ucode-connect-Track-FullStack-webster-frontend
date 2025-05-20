import apiClient from '@/lib/axios-instance';
import type { LoginCredentials, LoginResponse } from '@/types/auth';
import axios from 'axios'; // Остается нужным для проверки axios.isAxiosError

export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Login error in api/auth.ts:', error);
    if (axios.isAxiosError(error) && error.response) {
      const backendMessage = error.response.data?.message || error.response.data?.error || 'Login failed. Please check your credentials.';
      throw new Error(backendMessage);
    } else {
      throw new Error('Login failed due to a network or server issue.');
    }
  }
};

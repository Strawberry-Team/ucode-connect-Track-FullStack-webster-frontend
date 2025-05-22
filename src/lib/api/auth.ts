import apiClient from '@/lib/axios-instance';
import type { LoginCredentials, LoginResponse, RegisterCredentials, RegisterResponse } from '@/types/auth';
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

export const registerUser = async (credentials: RegisterCredentials): Promise<RegisterResponse> => {
  try {
    const response = await apiClient.post<RegisterResponse>('/auth/register', credentials);
    return response.data;
  } catch (error) {
    console.error('Registration error in api/auth.ts:', error);
    if (axios.isAxiosError(error) && error.response) {
      const backendMessage = error.response.data?.message || error.response.data?.error || 'Registration failed. Please try again.';
      throw new Error(backendMessage);
    } else {
      throw new Error('Registration failed due to a network or server issue.');
    }
  }
};

export const confirmEmail = async (token: string): Promise<void> => {
  try {
    await apiClient.post(`/auth/confirm-email/${token}`);
  } catch (error) {
    console.error('Email confirmation error in api/auth.ts:', error);
    if (axios.isAxiosError(error) && error.response) {
      const backendMessage = error.response.data?.message || error.response.data?.error || 'Email confirmation failed.';
      throw new Error(backendMessage);
    } else {
      throw new Error('Email confirmation failed due to a network or server issue.');
    }
  }
};

import apiClient from '@/lib/axios-instance';
import type { User } from '@/types/auth';

export const fetchUserProfile = async (): Promise<User> => {
  try {
    const response = await apiClient.get<User>('/users/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw new Error('Failed to fetch user profile. You may not be authenticated.');
  }
}; 
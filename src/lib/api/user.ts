import apiClient from '@/lib/axios-instance';
import type { User } from '@/types/auth';
import type { UpdateUserData, UpdateUserResponse, UploadAvatarResponse } from '@/types/user';
import axios from 'axios';

export const fetchUserProfile = async (): Promise<User> => {
  try {
    const response = await apiClient.get<User>('/users/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw new Error('Failed to fetch user profile. You may not be authenticated.');
  }
}; 

export const updateUserProfile = async (userId: number, userData: UpdateUserData): Promise<UpdateUserResponse> => {
  try {
    const response = await apiClient.patch<User>(`/users/${userId}`, userData);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    if (axios.isAxiosError(error) && error.response) {
      const backendMessage = error.response.data?.message || error.response.data?.error || 'Failed to update profile.';
      return {
        success: false,
        errors: [backendMessage]
      };
    } else {
      return {
        success: false,
        errors: ['Failed to update profile due to a network or server issue.']
      };
    }
  }
};

export const uploadUserAvatar = async (userId: number, file: File): Promise<UploadAvatarResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
console.log("apiClient " + apiClient);


    const response = await apiClient.post<{ server_filename: string }>(
      `/users/${userId}/upload-avatar`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    console.log("response " + response);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error uploading user avatar:', error);
    if (axios.isAxiosError(error) && error.response) {
      const backendMessage = error.response.data?.message || error.response.data?.error || 'Failed to upload avatar.';
      return {
        success: false,
        errors: [backendMessage]
      };
    } else {
      return {
        success: false,
        errors: ['Failed to upload avatar due to a network or server issue.']
      };
    }
  }
}; 
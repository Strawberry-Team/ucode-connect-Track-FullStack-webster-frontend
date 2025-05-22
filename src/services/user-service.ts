import { fetchUserProfile, updateUserProfile as apiUpdateUserProfile, uploadUserAvatar as apiUploadUserAvatar } from '@/lib/api/user';
import type { User } from '@/types/auth';
import { getAccessToken } from '@/services/auth-service'; 
import type { UpdateUserData, UpdateUserResponse, UploadAvatarResponse } from '@/types/user';


export const getCurrentAuthenticatedUser = async (): Promise<User | null> => {
  const accessToken = getAccessToken();

  if (!accessToken) {
    console.log('No access token found, user is not authenticated.');
    return null;
  }

  try {
    const user = await fetchUserProfile();
    return user;
  } catch (error) {
    console.log('Failed to get current authenticated user from service.');
    return null;
  }
}; 

export const updateUserProfile = async (userId: number, userData: UpdateUserData): Promise<UpdateUserResponse> => {
  try {
    return await apiUpdateUserProfile(userId, userData);
  } catch (error) {
    console.error('User service error when updating profile:', error);
    return {
      success: false,
      errors: ['Service error: Failed to update user profile.']
    };
  }
};

export const uploadUserAvatar = async (userId: number, file: File): Promise<UploadAvatarResponse> => {
  try {
    return await apiUploadUserAvatar(userId, file);
  } catch (error) {
    console.error('User service error when uploading avatar:', error);
    return {
      success: false,
      errors: ['Service error: Failed to upload user avatar.']
    };
  }
}; 
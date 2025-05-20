import { fetchUserProfile } from '@/lib/api/user';
import type { User } from '@/types/auth';
import { getAccessToken } from '@/services/auth-service'; 


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
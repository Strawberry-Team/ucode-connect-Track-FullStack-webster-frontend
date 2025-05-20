import { loginUser } from '@/lib/api/auth';
import type { LoginCredentials, LoginResponse } from '@/types/auth';
import Cookies from 'js-cookie';
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const authenticateUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const loginData = await loginUser(credentials);
    Cookies.set(ACCESS_TOKEN_KEY, loginData.accessToken, { 
      sameSite: 'Lax' 
    });
    Cookies.set(REFRESH_TOKEN_KEY, loginData.refreshToken, { 
      sameSite: 'Lax' 
    });

    return loginData;
  } catch (error) {
    console.error('Authentication service error:', error);
    throw error; 
  }
};


export const logoutUser = () => {
  Cookies.remove(ACCESS_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
 
};


export const getAccessToken = (): string | undefined => {
  return Cookies.get(ACCESS_TOKEN_KEY);
};

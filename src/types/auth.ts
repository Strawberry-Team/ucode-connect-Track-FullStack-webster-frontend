export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profilePictureName: string;
  role: string;
  createdAt: string; // ISO date string
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CsrfTokenResponse {
  csrfToken: string;
}

export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  user: User;
} 
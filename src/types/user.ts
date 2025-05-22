export interface UpdateUserData {
  firstName: string;
  lastName: string | null;
}

export interface UpdateUserResponse {
  success: boolean;
  data?: import('@/types/auth').User;
  errors?: string[];
}

export interface UploadAvatarResponse {
  success: boolean;
  data?: {
    server_filename: string;
  };
  errors?: string[];
} 
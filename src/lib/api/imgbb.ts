import axios from 'axios';

export interface ImgBBUploadResponse {
    data: {
        id: string;
        title: string;
        url_viewer: string;
        url: string;
        display_url: string;
        width: string;
        height: string;
        size: string;
        time: string;
        expiration: string;
        image: {
            filename: string;
            name: string;
            mime: string;
            extension: string;
            url: string;
        };
        thumb: {
            filename: string;
            name: string;
            mime: string;
            extension: string;
            url: string;
        };
        medium: {
            filename: string;
            name: string;
            mime: string;
            extension: string;
            url: string;
        };
        delete_url: string;
    };
    success: boolean;
    status: number;
}

export interface ImgBBError {
    error: {
        message: string;
        code: number;
        context: string;
    };
    status: number;
}

// Create separate axios instance for external APIs
const externalApiClient = axios.create({
    timeout: 30000, // 30 seconds timeout
    headers: {
        'Content-Type': 'multipart/form-data',
    },
});

/**
 * Uploads an image to ImgBB API
 * @param base64Image - Base64 encoded image (with or without data URL prefix)
 * @param name - Optional name for the image
 * @param expiration - Optional expiration time in seconds (60-15552000)
 * @returns Promise with upload response or throws error
 */
export const uploadToImgBB = async (
    base64Image: string,
    name?: string,
    expiration?: number
): Promise<ImgBBUploadResponse> => {
    // Get API key from different sources depending on environment

    const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
    
    // Remove data URL prefix if present (data:image/png;base64,)
    const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');

    // Prepare form data
    const formData = new FormData();
    formData.append('key', apiKey);
    formData.append('image', cleanBase64);
    
    if (name) {
        formData.append('name', name);
    }
    
    if (expiration && expiration >= 60 && expiration <= 15552000) {
        formData.append('expiration', expiration.toString());
    }

    try {
        const response = await externalApiClient.post<ImgBBUploadResponse>(
            'https://api.imgbb.com/1/upload',
            formData
        );

        if (!response.data.success) {
            throw new Error(`Upload failed: ${(response.data as any).error?.message || 'Unknown error'}`);
        }

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response) {
                const errorData = error.response.data as ImgBBError;
                throw new Error(`ImgBB API Error: ${errorData.error?.message || 'Unknown error'} (Code: ${errorData.error?.code || error.response.status})`);
            } else if (error.request) {
                throw new Error('Network error: No response from ImgBB API');
            } else {
                throw new Error(`Request setup error: ${error.message}`);
            }
        } else if (error instanceof Error) {
            throw error;
        } else {
            throw new Error(`Unexpected error: ${error}`);
        }
    }
}; 
import axios from 'axios';

export const removeImageBackground = async (
  imageBlob: Blob,
  apiKey: string
): Promise<Blob> => {
  try {
    const formData = new FormData();
    formData.append('image_file', imageBlob);
    formData.append('size', 'auto'); 
    formData.append('format', 'auto'); 

    console.log('ImageAPI: Sending image to remove.bg API...');

    const response = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'multipart/form-data'
      },
      responseType: 'blob'
    });


    return new Blob([response.data], { type: response.headers['content-type'] });
  } catch (error) {
    
    // Обработка ошибок axios
    if (axios.isAxiosError(error) && error.response) {
      console.error('ImageAPI: remove.bg API error details:', {
        status: error.response.status,
        data: error.response.data
      });
      throw new Error(`Failed to remove background: ${error.response.statusText}`);
    }
    
    throw error;
  }
};


export const convertImageUrlToBlob = async (imageUrl: string): Promise<Blob> => {
  try {

    const response = await axios.get(imageUrl, {
      responseType: 'blob'
    });
    
    return new Blob([response.data], { type: response.headers['content-type'] });
  } catch (error) {
    console.error('ImageAPI: Error converting image URL to blob:', error);
    
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Failed to fetch image: ${error.response.statusText}`);
    }
    
    throw error;
  }
};


export const convertBlobToDataUrl = async (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to data URL'));
      }
    };
    reader.onerror = () => {
      reject(new Error('Error reading blob'));
    };
    reader.readAsDataURL(blob);
  });
}; 
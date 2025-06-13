// Re-export types and API function from the API module
export type { ImgBBUploadResponse, ImgBBError } from '@/lib/api/imgbb';
export { uploadToImgBB } from '@/lib/api/imgbb';

/**
 * Copies text to clipboard
 * @param text - Text to copy
 * @returns Promise that resolves when copy is complete
 */
export const copyToClipboard = async (text: string): Promise<void> => {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            // Use modern clipboard API if available
            await navigator.clipboard.writeText(text);
        } else {
            // Fallback for older browsers or non-secure contexts
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            return new Promise((resolve, reject) => {
                document.execCommand('copy') ? resolve() : reject();
                document.body.removeChild(textArea);
            });
        }
    } catch (error) {
        throw new Error(`Failed to copy to clipboard: ${error}`);
    }
};

/**
 * Generates a project name for the uploaded image based on project ID
 * @param projectId - Project ID in format "project_timestamp_uniqueId"
 * @returns Generated name for the image using unique project identifier
 */
export const generateImageName = (projectId?: string): string => {
    if (!projectId) {
        // Fallback for cases when projectId is not provided
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
        return `project_${timestamp}`;
    }
    
    // Extract unique part from project ID
    // Format: "project_timestamp_uniqueId" -> "timestamp_uniqueId"
    const match = projectId.match(/^project_(.+)$/);
    if (match && match[1]) {
        // Use unique part as file name
        return match[1];
    }
    
    // If format doesn't match expected, use the entire ID (sanitize for file name)
    return projectId.replace(/[^a-zA-Z0-9\-_]/g, '_');
}; 
// AI Image Generation interfaces
export interface GenerateImageOptions {
  prompt: string;
  backgroundType?: "none" | "white" | "black" | "gradient";
  width?: number;
  height?: number;
  noLogo?: boolean;
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
  id: string;
}

/**
 * Generate image using Pollinations AI
 * @param options - Generation options
 * @returns Promise with generated image data
 */
export const generateImage = async (options: GenerateImageOptions): Promise<GeneratedImage> => {
  const { prompt, backgroundType = "none", width = 1024, height = 1024, noLogo = true } = options;

  if (!prompt.trim()) {
    throw new Error("Please enter an image description");
  }

  let finalPrompt = prompt;

  // Add background specification if selected
  if (backgroundType !== "none") {
    if (backgroundType === "white") {
      finalPrompt += ", on pure white background";
    } else if (backgroundType === "black") {
      finalPrompt += ", on pure black background";
    } else if (backgroundType === "gradient") {
      finalPrompt += ", on colorful gradient background";
    }
  }

  const timestamp = Date.now();
  const randomSeed = Math.floor(Math.random() * 1000000);

  // Generate image URL with Pollinations API
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=${width}&height=${height}&seed=${timestamp + randomSeed}&nologo=true`;

  return {
    url: imageUrl,
    prompt: finalPrompt,
    timestamp: Date.now(),
    id: `ai-image-${timestamp}-${randomSeed}`,
  };
};

/**
 * Generate multiple images simultaneously
 * @param options - Generation options
 * @param count - Number of images to generate
 * @returns Promise array of generated images
 */
export const generateMultipleImages = async (
  options: GenerateImageOptions,
  count: number = 3
): Promise<GeneratedImage[]> => {
  if (!options.prompt.trim()) {
    throw new Error("Please enter an image description");
  }

  try {
    // Generate images simultaneously
    const imagePromises = Array.from({ length: count }, async () => {
      try {
        return await generateImage(options);
      } catch (error) {
        console.error('Error generating individual image:', error);
        return null;
      }
    });

    // Wait for all generations to complete
    const results = await Promise.allSettled(imagePromises);
    const successfulImages = results
      .filter((result): result is PromiseFulfilledResult<GeneratedImage> => 
        result.status === "fulfilled" && result.value !== null
      )
      .map(result => result.value);

    if (successfulImages.length === 0) {
      throw new Error("Failed to generate any images");
    }

    return successfulImages;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(`Unexpected error during image generation: ${error}`);
    }
  }
}; 
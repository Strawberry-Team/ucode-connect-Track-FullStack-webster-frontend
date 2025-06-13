import axios from 'axios';

export interface GenerateImageOptions {
    prompt: string
    backgroundType?: "none" | "white" | "black" | "gradient"
    width?: number
    height?: number
    noLogo?: boolean
}

export interface GeneratedImage {
    url: string
    prompt: string
    timestamp: number
    id: string
}


export const generateImage = async (options: GenerateImageOptions): Promise<GeneratedImage> => {
    const { prompt, backgroundType = "none", width = 1024, height = 1024, noLogo = true } = options

    if (!prompt.trim()) {
        throw new Error("Please enter an image description")
    }

    let finalPrompt = prompt

    // Add background specification if selected
    if (backgroundType !== "none") {
        if (backgroundType === "white") {
            finalPrompt += ", on pure white background"
        } else if (backgroundType === "black") {
            finalPrompt += ", on pure black background"
        } else if (backgroundType === "gradient") {
            finalPrompt += ", on colorful gradient background"
        }
    }

    const encodedPrompt = encodeURIComponent(finalPrompt)
    const timestamp = Date.now()
    const randomSeed = Math.floor(Math.random() * 1000000)

    // Fixed URL with correct size parameters
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${timestamp + randomSeed}&nologo=true`

    return {
        url: imageUrl,
        prompt: finalPrompt,
        timestamp: Date.now(),
        id: `ai-image-${timestamp}-${randomSeed}`,
    }
}

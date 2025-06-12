// API функции для генерации изображений

export interface GenerateImageOptions {
    prompt: string
    backgroundType?: "none" | "white" | "black" | "transparent" | "gradient"
    noLogo?: boolean
    apiType?: "pollinations" | "lexica"
  }
  
  export interface GeneratedImage {
    url: string
    prompt: string
    timestamp: number
  }
  
  export const generateImage = async (options: GenerateImageOptions): Promise<GeneratedImage> => {
    const { prompt, backgroundType = "none", noLogo = true, apiType = "pollinations" } = options
  
    if (!prompt.trim()) {
      throw new Error("Пожалуйста, введите описание изображения")
    }
  
    let finalPrompt = prompt
  
    // Добавляем указание на фон, если выбран
    if (backgroundType !== "none") {
      if (backgroundType === "white") {
        finalPrompt += ", on pure white background"
      } else if (backgroundType === "black") {
        finalPrompt += ", on pure black background"
      } else if (backgroundType === "transparent") {
        finalPrompt += ", isolated object, no background, transparent background"
      } else if (backgroundType === "gradient") {
        finalPrompt += ", on colorful gradient background"
      }
    }
  
    const encodedPrompt = encodeURIComponent(finalPrompt)
    let imageUrl = ""
  
    if (apiType === "pollinations") {
      // Pollinations.ai API
      const timestamp = Date.now()
      imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${timestamp}`
  
      // Добавляем параметр nologo=true, чтобы попытаться убрать логотип
      if (noLogo) {
        imageUrl += "&nologo=true"
      }
    } else if (apiType === "lexica") {
      // Lexica Aperture API (альтернативный бесплатный API)
      imageUrl = `https://image.lexica.art/md2/${encodedPrompt}`
    }
  
    return {
      url: imageUrl,
      prompt: finalPrompt,
      timestamp: Date.now(),
    }
  }
  
  export const downloadImage = async (imageUrl: string, filename?: string): Promise<void> => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename || `ai-generated-image-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error("Error downloading image:", err)
      throw new Error("Ошибка при скачивании изображения")
    }
  }
  
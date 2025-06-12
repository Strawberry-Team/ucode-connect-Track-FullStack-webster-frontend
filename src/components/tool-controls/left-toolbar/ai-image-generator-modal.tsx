import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Download, Sparkles, ImageIcon } from "lucide-react"
import { toast } from "sonner"

interface AIImageGeneratorModalProps {
    isOpen: boolean
    onClose: () => void
    onAddToCanvas?: (imageUrl: string, asBackground?: boolean) => void
}

// API функции для генерации изображений
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
        throw new Error("Пожалуйста, введите описание изображения")
    }

    let finalPrompt = prompt

    // Добавляем указание на фон, если выбран
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

    // Исправленный URL с правильными параметрами размера
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${timestamp + randomSeed}&nologo=true`

    return {
        url: imageUrl,
        prompt: finalPrompt,
        timestamp: Date.now(),
        id: `ai-image-${timestamp}-${randomSeed}`,
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

// Adding styles for scrollbar
const scrollbarStyles = `
  .custom-scroll::-webkit-scrollbar {
    width: 8px;
    background-color: #292C31;
  }
  .custom-scroll::-webkit-scrollbar-thumb {
    background-color: #44474A;
    border-radius: 4px;
  }
  .custom-scroll::-webkit-scrollbar-track {
    background-color: #292C31;
    border-radius: 4px;
  }
`

const AIImageGeneratorModal: React.FC<AIImageGeneratorModalProps> = ({ isOpen, onClose, onAddToCanvas }) => {
    const [prompt, setPrompt] = useState("")
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
    const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [generatingCount, setGeneratingCount] = useState(0)

    // Настройки генерации
    const [backgroundType, setBackgroundType] = useState<"none" | "white" | "black" | "gradient">("none")
    const [imageSize, setImageSize] = useState("1024x1024")
    const [setAsBackground, setSetAsBackground] = useState(false)
    
    // Состояния для отображения текущих настроек (используются только после генерации)
    const [generatedBackgroundType, setGeneratedBackgroundType] = useState<"none" | "white" | "black" | "gradient">("none")
    const [generatedImageSize, setGeneratedImageSize] = useState("1024x1024")

    // Опции фона - убрали transparent
    const backgroundOptions = [
        { value: "none", label: "Standard" },
        { value: "white", label: "White" },
        { value: "black", label: "Black" },
        { value: "gradient", label: "Gradient" },
    ]

    // Опции размера - стилизованы как в Sample Assets
    const imageSizes = [
        { value: "512x512", label: "512×512 (Square)" },
        { value: "768x768", label: "768×768 (Square)" },
        { value: "1024x1024", label: "1024×1024 (Square)" },
        { value: "1024x768", label: "1024×768 (Album)" },
        { value: "768x1024", label: "768×1024 (Portrait)" },
    ]

    const generateMultipleImages = async (count = 3) => {
        if (!prompt.trim()) {
            setError("Пожалуйста, введите описание изображения")
            return
        }

        setIsLoading(true)
        setError("")
        setGeneratedImages([])
        setSelectedImageId(null)
        setGeneratingCount(0)
        
        // Запоминаем настройки для отображения
        setGeneratedBackgroundType(backgroundType)
        setGeneratedImageSize(imageSize)

        try {
            const [width, height] = imageSize.split("x").map(Number)

            const options: GenerateImageOptions = {
                prompt,
                backgroundType,
                width,
                height,
                noLogo: true,
            }

            // Генерируем изображения одновременно
            const imagePromises = Array.from({ length: count }, async (_, index) => {
                try {
                    const result = await generateImage(options)
                    // Добавляем изображение сразу как только оно готово
                    setGeneratedImages((prev) => [...prev, result])
                    setGeneratingCount((prev) => prev + 1)
                    return result
                } catch (error) {
                    console.error(`Error generating image ${index + 1}:`, error)
                    setGeneratingCount((prev) => prev + 1)
                    return null
                }
            })

            // Ждем завершения всех генераций
            const results = await Promise.allSettled(imagePromises)
            const successCount = results.filter((result) => result.status === "fulfilled" && result.value !== null).length

            if (successCount > 0) {
                toast.success(`${successCount} images generated!`)
            } else {
                throw new Error("Не удалось сгенерировать ни одного изображения")
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Произошла ошибка при генерации изображения"
            setError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
            setGeneratingCount(0)
        }
    }

    const handleGenerate = () => {
        generateMultipleImages(3)
    }

    const handleBackgroundTypeSelect = (type: "none" | "white" | "black" | "gradient") => {
        setBackgroundType(type)
        setSelectedImageId(null) // Сбрасываем выбор при смене фона
        setSetAsBackground(false) // Сбрасываем настройку фона
    }

    const handleImageSizeSelect = (size: string) => {
        setImageSize(size)
        setSelectedImageId(null) // Сбрасываем выбор при смене размера
        setSetAsBackground(false) // Сбрасываем настройку фона
    }

    const handleImageSelect = (imageId: string) => {
        setSelectedImageId(imageId)
    }

    const handleDownload = async () => {
        const selectedImage = generatedImages.find((img) => img.id === selectedImageId)
        if (!selectedImage) return

        try {
            await downloadImage(selectedImage.url, `ai-generated-${Date.now()}.png`)
            toast.success("Изображение скачано!")
        } catch (err) {
            toast.error("Ошибка при скачивании изображения")
        }
    }

    const handleAddToCanvas = () => {
        const selectedImage = generatedImages.find((img) => img.id === selectedImageId)
        if (!selectedImage || !onAddToCanvas) return

        onAddToCanvas(selectedImage.url, setAsBackground)
        toast.success(setAsBackground ? "Изображение установлено как фон" : "Изображение добавлено на канвас")
        onClose()
    }

    const resetForm = () => {
        setPrompt("")
        setGeneratedImages([])
        setSelectedImageId(null)
        setError("")
        setBackgroundType("none")
        setImageSize("1024x1024")
        setSetAsBackground(false)
        setGeneratedBackgroundType("none")
        setGeneratedImageSize("1024x1024")
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !isLoading) {
            handleGenerate()
        }
    }

    if (!isOpen) return null

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    resetForm()
                    onClose()
                }
            }}
        >
            <DialogContent className="sm:max-w-[800px] sm:max-h-[80vh] h-full bg-[#2D2F34FF] text-gray-300 border-none p-0 flex flex-col">
                <DialogHeader className="px-6 pt-6 pb-0 w-full">
                    <DialogTitle className="m-0 text-base font-normal text-center text-gray-300 flex items-center justify-center gap-2">
                        AI Image Generator
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col p-6 pb-0 flex-1 overflow-hidden">
                    <div className="text-xs text-gray-400 text-end -mt-4.5 mb-0.5 mr-12.5 p-0">
                        Powered by{" "}
                        <a
                            href="https://pollinations.ai/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline"
                        >
                            Pollinations.ai
                        </a>
                    </div>
                    {/* Поле ввода промпта */}
                    <div className="mb-4">
                        <div className="flex gap-2 mb-3">
                            <div className="relative flex-1">
                                <Input
                                    type="text"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="beautiful sunset over mountains, digital art, high quality"
                                    className="bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 w-full"
                                    disabled={isLoading}
                                />
                            </div>
                            <Button
                                onClick={handleGenerate}
                                disabled={isLoading || !prompt.trim()}
                                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:opacity-50 text-white font-medium rounded-md transition-colors duration-200 flex items-center gap-2"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            </Button>
                        </div>

                        {/* Опции фона - стилизованы как в Sample Assets */}
                        <div className="space-y-2 mb-4">
                            <div className="flex flex-wrap gap-2">
                                {backgroundOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleBackgroundTypeSelect(option.value as any)}
                                        className={`px-2 py-0.5 text-xs rounded-full border transition-all duration-200 hover:bg-blue-500/20 hover:border-blue-500/50 hover:scale-105 focus:bg-blue-500/20 focus:border-blue-500 focus:outline-none focus:scale-105
                                            ${backgroundType === option.value
                                                ? "bg-blue-500/30 border-blue-500 text-blue-200 shadow-md"
                                                : "bg-[#3A3D44FF] border-[#4A4D54FF] text-gray-300 hover:text-gray-200"
                                            }`}
                                        disabled={isLoading}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Опции размера - стилизованы как в Sample Assets */}
                        <div className="space-y-2 mb-4">
                            <div className="flex flex-wrap gap-2">
                                {imageSizes.map((size) => (
                                    <button
                                        key={size.value}
                                        onClick={() => handleImageSizeSelect(size.value)}
                                        className={`px-2 py-0.5 text-xs rounded-full border transition-all duration-200 hover:bg-blue-500/20 hover:border-blue-500/50 hover:scale-105 focus:bg-blue-500/20 focus:border-blue-500 focus:outline-none focus:scale-105
                                            ${imageSize === size.value
                                                ? "bg-blue-500/30 border-blue-500 text-blue-200 shadow-md"
                                                : "bg-[#3A3D44FF] border-[#4A4D54FF] text-gray-300 hover:text-gray-200"
                                            }`}
                                        disabled={isLoading}
                                    >
                                        {size.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Ошибка */}
                    {error && (
                        <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-md border border-red-500/20 mb-4">
                            {error}
                        </div>
                    )}



                    {/* Результаты - сетка изображений */}
                    <div className="flex-1 pr-4">
                        {generatedImages.length > 0 && (
                            <div className="text-xs text-gray-400 mb-2 text-center">
                                Generated {generatedImages.length} images with{" "}
                                {backgroundOptions.find((opt) => opt.value === generatedBackgroundType)?.label} background
                            </div>
                        )}
                        {generatedImages.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {generatedImages.map((image) => (
                                    <Card
                                        key={image.id}
                                        onClick={() => handleImageSelect(image.id)}
                                        className={`group cursor-pointer transition-all duration-200 bg-[#3A3D44FF] border-2 rounded-lg overflow-hidden hover:bg-[#4A4D54FF] p-0 
                                            ${selectedImageId === image.id ? "border-blue-500" : "border-[#4A4D54FF] hover:border-gray-600"}`}
                                    >
                                        <CardContent className="p-0">
                                            <div className="aspect-square overflow-hidden">
                                                <img
                                                    src={image.url || "/placeholder.svg"}
                                                    alt="Generated AI image"
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                    loading="lazy"
                                                    crossOrigin="anonymous"
                                                />
                                            </div>
                                            <div className="p-2">
                                                <div className="text-xs text-gray-300 truncate" title={image.prompt}>
                                                    AI Generated
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    {`${generatedImageSize} • ${backgroundOptions.find((opt) => opt.value === generatedBackgroundType)?.label}`}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {!generatedImages.length && !isLoading && (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <ImageIcon className="w-16 h-16 text-gray-500 mb-4" />
                                <div className="text-gray-400 mb-2">Ready to generate</div>
                                <div className="text-sm text-gray-500">Enter image description and click generate</div>
                            </div>
                        )}

                        {isLoading && (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-4" />
                                <div className="text-gray-400">Generating images...</div>
                                <div className="text-sm text-gray-500 mt-2">
                                    {generatingCount > 0 ? `${generatingCount}/3 images ready` : "Starting generation..."}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end items-center gap-4 px-6 py-4 bg-[#2D2F34FF] rounded-b-lg border-t border-[#4A4D54FF]">
                    {/* Set as background checkbox */}
                    
                        <div className="flex items-center space-x-3">
                            <Checkbox
                                id="setAsBackground"
                                checked={setAsBackground}
                                className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                                />
                            <Label htmlFor="setAsBackground" className="text-sm text-gray-400 cursor-pointer">
                                Set as background
                            </Label>
                        </div>
                
                    <div className="flex gap-4">
                        
                            <Button
                                onClick={handleAddToCanvas}
                                variant="secondary"
                                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white"
                            >
                                Add to Canvas
                            </Button>
                        
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
            </DialogContent>
        </Dialog>
    )
}

export default AIImageGeneratorModal
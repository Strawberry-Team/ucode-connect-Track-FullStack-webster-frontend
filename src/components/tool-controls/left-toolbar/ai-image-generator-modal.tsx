import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Sparkles, ImageIcon, Square, RectangleVertical, Zap } from "lucide-react"
import { toast } from "sonner"
import type { ElementData } from "@/types/canvas"
import { useTool } from "@/context/tool-context"
import { generateImage, type GenerateImageOptions, type GeneratedImage } from "@/lib/api/pollinations-ai"

interface AIImageGeneratorModalProps {
    isOpen: boolean
    onClose: () => void
}

// Styles for scrollbar
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

const AIImageGeneratorModal: React.FC<AIImageGeneratorModalProps> = ({ isOpen, onClose }) => {
    const { stageSize, addRenderableObject, addHistoryEntry, renderableObjects, setRenderableObjects } = useTool()
    const [prompt, setPrompt] = useState("")
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
    const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [generatingCount, setGeneratingCount] = useState(0)

    // Generation settings
    const [backgroundType, setBackgroundType] = useState<"none" | "white" | "black" | "gradient">("none")
    const [imageSize, setImageSize] = useState("1024x1024")
    const [setAsBackground, setSetAsBackground] = useState(false)

    // States for displaying current settings (used only after generation)
    const [generatedBackgroundType, setGeneratedBackgroundType] = useState<"none" | "white" | "black" | "gradient">("none")
    const [generatedImageSize, setGeneratedImageSize] = useState("1024x1024")

    // Background options - removed transparent
    const backgroundOptions = [
        { value: "none", label: "Standard", textColor: "text-gray-300" },
        { value: "white", label: "White", textColor: "text-white" },
        { value: "black", label: "Black", textColor: "text-gray-900" },
        { value: "gradient", label: "Gradient", textColor: "bg-gradient-to-r from-yellow-400 to-blue-400 bg-clip-text text-transparent" },
    ]

    // Size options - styled like in Sample Assets
    const imageSizes = [
        { value: "512x512", label: "512×512", icon: Square },
        { value: "768x768", label: "768×768", icon: Square },
        { value: "1024x1024", label: "1024×1024", icon: Square },
        { value: "768x1024", label: "768×1024", icon: RectangleVertical },
        { value: "1024x1536", label: "1024×1536", icon: RectangleVertical },
    ]

    const generateMultipleImages = async (count = 3) => {
        if (!prompt.trim()) {
            setError("Please enter an image description")
            return
        }

        setIsLoading(true)
        setError("")
        setGeneratedImages([])
        setSelectedImageId(null)
        setGeneratingCount(0)

        // Save settings for display
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

            // Generate images simultaneously
            const imagePromises = Array.from({ length: count }, async (_, index) => {
                try {
                    const result = await generateImage(options)
                    // Add image as soon as it is ready
                    setGeneratedImages((prev) => [...prev, result])
                    setGeneratingCount((prev) => prev + 1)
                    return result
                } catch (error) {
                    console.error(`Error generating image ${index + 1}:`, error)
                    setGeneratingCount((prev) => prev + 1)
                    return null
                }
            })

            // Wait for all generations to complete
            const results = await Promise.allSettled(imagePromises)
            const successCount = results.filter((result) => result.status === "fulfilled" && result.value !== null).length

            if (successCount > 0) {
                toast.success(`${successCount} images generated!`, {
                    description: 'Please wait a few seconds for the images to be rendered.',
                    duration: 5000,
                })
            } else {
                throw new Error("Failed to generate any images")
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An error occurred while generating images"
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
        setSelectedImageId(null) // Reset selection when changing background
        setSetAsBackground(false) // Reset background setting
    }

    const handleImageSizeSelect = (size: string) => {
        setImageSize(size)
        setSelectedImageId(null) // Reset selection when changing size
        setSetAsBackground(false) // Reset background setting
    }

    const handleImageSelect = (imageId: string) => {
        setSelectedImageId(imageId)
    }

    const handleAddToCanvas = async () => {
        const selectedImage = generatedImages.find((img) => img.id === selectedImageId)
        if (!selectedImage) return

        try {
            const imageUrl = selectedImage.url
            const imageName = `ai-generated-${Date.now()}.png`
            const shouldSetAsBackground = setAsBackground

            // Create an image element to load the image and get actual dimensions
            const img = new Image()
            img.crossOrigin = "anonymous" // For external images

            img.onload = () => {
                let imageWidth = img.width
                let imageHeight = img.height
                let imageX = 0
                let imageY = 0

                // If no stage size exists, create canvas with image dimensions
                if (!stageSize) {
                    const newCanvasWidth = Math.max(img.width, 800)
                    const newCanvasHeight = Math.max(img.height, 600)
                    imageX = newCanvasWidth / 2
                    imageY = newCanvasHeight / 2
                } else {
                    // Calculate positioning and scaling for existing canvas
                    const canvasWidth = stageSize.width
                    const canvasHeight = stageSize.height

                    // Check if image is larger than canvas, scale down if needed
                    const maxSize = Math.min(canvasWidth * 0.8, canvasHeight * 0.8) // 80% of canvas size
                    if (img.width > maxSize || img.height > maxSize) {
                        const scaleX = maxSize / img.width
                        const scaleY = maxSize / img.height
                        const scale = Math.min(scaleX, scaleY)

                        imageWidth = img.width * scale
                        imageHeight = img.height * scale
                    }

                    // Center the image on canvas (using center coordinates)
                    imageX = canvasWidth / 2
                    imageY = canvasHeight / 2
                }

                // Create image element with proper structure
                const imageElement: ElementData = {
                    id: `image-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                    type: "custom-image",
                    x: imageX,
                    y: imageY,
                    width: imageWidth,
                    height: imageHeight,
                    src: imageUrl,
                    fileName: imageName,
                    borderColor: "#000000",
                    borderColorOpacity: 100,
                    borderWidth: 0,
                    borderStyle: "hidden",
                    color: "#000000",
                    opacity: 1,
                    rotation: 0,
                    scaleX: 1,
                    scaleY: 1,
                    draggable: true,
                    preserveAspectRatio: true,
                    // Default image transform properties
                    flipHorizontal: false,
                    flipVertical: false,
                    brightness: 0,
                    contrast: 0,
                }

                // Add as renderable object
                if (shouldSetAsBackground) {
                    console.log("AIImageGenerator: Adding image directly as background and fitting to canvas", {
                        imageId: imageElement.id.slice(-6),
                        imageName: imageName,
                    })

                    // Add the image directly as background (at the beginning of the array)
                    const updatedObjects = [imageElement, ...renderableObjects]
                    setRenderableObjects(updatedObjects)

                    // Add to history manually for background image
                    addHistoryEntry({
                        type: "elementAdded",
                        description: `Added AI generated image "${imageName}" as background`,
                        linesSnapshot: updatedObjects,
                    })

                    // Then fit the image to cover the entire canvas immediately
                    setTimeout(() => {
                        // First ensure the image is positioned and sized to cover the canvas
                        if (stageSize) {
                            const canvasWidth = stageSize.width
                            const canvasHeight = stageSize.height

                            // Calculate scale to cover entire canvas (like fitImageToCanvas)
                            const scaleX = canvasWidth / imageWidth
                            const scaleY = canvasHeight / imageHeight
                            const scale = Math.max(scaleX, scaleY) // Use maximum to ensure image covers entire canvas

                            const newWidth = imageWidth * scale
                            const newHeight = imageHeight * scale

                            // Center the image on canvas
                            const canvasCenterX = canvasWidth / 2
                            const canvasCenterY = canvasHeight / 2

                            // Update the image element with proper background sizing
                            const backgroundImageElement: ElementData = {
                                ...imageElement,
                                x: canvasCenterX,
                                y: canvasCenterY,
                                width: newWidth,
                                height: newHeight,
                                scaleX: 1,
                                scaleY: 1,
                                rotation: 0,
                            }

                            // Update the renderableObjects with the properly sized background image
                            const finalUpdatedObjects = [
                                backgroundImageElement,
                                ...renderableObjects.filter((obj) => obj.id !== imageElement.id),
                            ]
                            setRenderableObjects(finalUpdatedObjects)

                            console.log("AIImageGenerator: Background image fitted to canvas", {
                                originalSize: { width: imageWidth, height: imageHeight },
                                canvasSize: { width: canvasWidth, height: canvasHeight },
                                scale,
                                newSize: { width: newWidth, height: newHeight },
                                position: { x: canvasCenterX, y: canvasCenterY },
                            })
                        }
                    }, 100)
                } else {
                    // Add normally to the end (top layer)
                    addRenderableObject(imageElement)

                    // Add to history for non-background images
                    addHistoryEntry({
                        type: "elementAdded",
                        description: `Added AI generated image: ${imageName}`,
                        linesSnapshot: [...renderableObjects, imageElement], // Include the newly added element
                    })
                }

                // Wait a bit for image to render before adding to history
                setTimeout(
                    () => {
                        console.log("AIImageGenerator: Image successfully added and processed")
                    },
                    shouldSetAsBackground ? 300 : 100,
                ) // Shorter wait since we don't use addRenderableObject for background

                // Show success toast
                toast.success("Success", {
                    description: `AI generated image "${imageName}"${shouldSetAsBackground ? " set as background" : " added"} successfully`,
                    duration: 3000,
                })

                onClose()
            }

            img.onerror = () => {
                console.error("Error loading AI generated image:", imageUrl)
                toast.error("Error", {
                    description: "Failed to load the generated image. Please try again.",
                    duration: 5000,
                })
            }

            // Start loading the image
            img.src = imageUrl
        } catch (error) {
            console.error("Error adding AI generated image:", error)
            toast.error("Error", {
                description: "Error adding image to canvas: " + error,
                duration: 5000,
            })
        }
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
                        <div className="flex items-center justify-center gap-2">
                            AI-Generated Images
                            <span className="inline-flex items-center px-1 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm border border-blue-400/20 ml-auto">
                                <Zap className="w-4 h-4 !text-white" />
                            </span>
                        </div>
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

                    {/* Input field for prompt */}
                    <div>
                        <div className="flex gap-2 mb-3">
                            <div className="relative flex-1">
                                <Input
                                    type="text"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="simple aesthetic background, digital art, ui elements"
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

                        <div className="flex gap-4 mb-4">
                            {/* Background options - styled like in Sample Assets */}
                            <div className="space-y-2">
                                <div className="flex flex-wrap gap-2">
                                    {backgroundOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => handleBackgroundTypeSelect(option.value as any)}
                                            className={`px-1 py-0.5 text-xs rounded-full border transition-all duration-200 hover:bg-blue-500/20 hover:border-blue-500/50 hover:scale-105 focus:bg-blue-500/20 focus:border-blue-500 focus:outline-none focus:scale-105
                                            ${backgroundType === option.value
                                                    ? `bg-blue-500/30 border-blue-500 ${option.textColor} shadow-md`
                                                    : `bg-[#3A3D44FF] border-[#4A4D54FF] ${option.textColor}`
                                                }`}
                                            disabled={isLoading}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="h-6 border-l border-[#44474AFF]"></div>

                            {/* Size options - styled like in Sample Assets */}
                            <div className="space-y-2">
                                <div className="flex flex-wrap gap-2">
                                    {imageSizes.map((size) => {
                                        const Icon = size.icon
                                        return (
                                            <button
                                                key={size.value}
                                                onClick={() => handleImageSizeSelect(size.value)}
                                                className={`flex items-center gap-1 px-1 py-0.5 text-xs rounded-full border transition-all duration-200 hover:bg-blue-500/20 hover:border-blue-500/50 hover:scale-105 focus:bg-blue-500/20 focus:border-blue-500 focus:outline-none focus:scale-105
                                                ${imageSize === size.value
                                                        ? "bg-blue-500/30 border-blue-500 text-blue-200 shadow-md"
                                                        : "bg-[#3A3D44FF] border-[#4A4D54FF] text-gray-300 hover:text-gray-200"
                                                    }`}
                                                disabled={isLoading}
                                            >
                                                <Icon className="w-4 h-4" />
                                                {size.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="text-red-400 text-sm bg-red-500/10 px-3 rounded-md border border-red-500/20 mb-2">
                            {error}
                        </div>
                    )}

                    {/* Results - grid of images */}
                    <div className="flex-1 pr-4">
                        {generatedImages.length > 0 && (
                            <div className="text-xs text-gray-400 mb-2 text-center">
                                Generated {generatedImages.length} images with {" "}
                                <span className={backgroundOptions.find((opt) => opt.value === generatedBackgroundType)?.textColor}>
                                    {backgroundOptions.find((opt) => opt.value === generatedBackgroundType)?.label}
                                </span>{" "}
                                background color. <br />
                                <span className="text-yellow-600">Please wait a few seconds</span> for the images to be rendered.
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
                    {/* Set as background checkbox - styled like in Sample Assets */}

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="setAsBackground"
                            checked={setAsBackground}
                            onCheckedChange={(checked) => setSetAsBackground(checked as boolean)}
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
                            disabled={!selectedImageId}
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
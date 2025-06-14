import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { ShapeType, ElementData } from "@/types/canvas"
import {
  SearchIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  FolderPlusIcon as FunnelPlus,
  Square,
  RectangleHorizontal,
  RectangleVertical,
  X,
  Zap,
} from "lucide-react"
import { useTool } from "@/context/tool-context"
import { useElementsManager } from "@/context/elements-manager-context"
import { useUser } from "@/context/user-context"
import { toast } from "sonner"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
// API imports
import { searchPixabayImages, type PixabayImage, type PixabayResponse } from '@/lib/api/pixabay';
import { searchUnsplashImages, isUnsplashConfigured, type UnsplashImage, type UnsplashResponse } from '@/lib/api/unsplash';

// Template image imports
import template1 from '@/assets/project-templates/template_1_macbook.png';
import template2 from '@/assets/project-templates/template_2_ipad_vertical.png';
import template3 from '@/assets/project-templates/template_3_ipad_horizontal.png';
import template4 from '@/assets/project-templates/template_4_iphone.png';
import template5 from '@/assets/project-templates/template_5_iphone_gloss.png';
import template6 from '@/assets/project-templates/template_6_iphone_horizontal.png';
import template7 from '@/assets/project-templates/template_7_watch.png';
import template8 from '@/assets/project-templates/template_8_iphone_music.png';
import template9 from '@/assets/project-templates/template_9_iphone_instagram_story.png';
import template10 from '@/assets/project-templates/template_10_instagram_post.png';
import template11 from '@/assets/project-templates/template_11_iphone_facebook_post.png';

// Template images interface
interface ProjectTemplate {
  id: string;
  title: string;
  imagePath: string;
  width: number;
  height: number;
  dimensionsText: string;
}

// Project templates from assets folder
const projectTemplates: ProjectTemplate[] = [
  {
    id: 'macbook',
    title: 'MacBook',
    imagePath: template1,
    width: 1000,
    height: 1000,
    dimensionsText: '1000 x 1000 px'
  },
  {
    id: 'ipad-vertical',
    title: 'iPad Vertical',
    imagePath: template2,
    width: 1000,
    height: 1000,
    dimensionsText: '1000 x 1000 px'
  },
  {
    id: 'ipad-horizontal',
    title: 'iPad Horizontal',
    imagePath: template3,
    width: 1000,
    height: 1000,
    dimensionsText: '1000 x 1000 px'
  },
  {
    id: 'watch',
    title: 'Apple Watch',
    imagePath: template7,
    width: 1000,
    height: 1000,
    dimensionsText: '1000 x 1000 px'
  },
  {
    id: 'iphone-gloss',
    title: 'iPhone Vertical Gloss',
    imagePath: template5,
    width: 1000,
    height: 1000,
    dimensionsText: '1000 x 1000 px'
  },
  {
    id: 'iphone',
    title: 'iPhone Vertical',
    imagePath: template4,
    width: 1000,
    height: 1000,
    dimensionsText: '1000 x 1000 px'
  },
  {
    id: 'iphone-horizontal',
    title: 'iPhone Horizontal',
    imagePath: template6,
    width: 1000,
    height: 1000,
    dimensionsText: '1000 x 1000 px'
  },
  {
    id: 'iphone-music',
    title: 'iPhone Music',
    imagePath: template8,
    width: 1000,
    height: 1000,
    dimensionsText: '1000 x 1000 px'
  },
  {
    id: 'iphone-instagram-story',
    title: 'iPhone Instagram Story',
    imagePath: template9,
    width: 1000,
    height: 1000,
    dimensionsText: '1000 x 1000 px'
  },
  {
    id: 'instagram-post',
    title: 'Instagram Post',
    imagePath: template10,
    width: 1000,
    height: 1000,
    dimensionsText: '1000 x 1000 px'
  },
  {
    id: 'iphone-facebook-post',
    title: 'iPhone Facebook Post',
    imagePath: template11,
    width: 1000,
    height: 1000,
    dimensionsText: '1000 x 1000 px'
  },
];

interface SampleAssetsModalProps {
  isOpen: boolean
  onClose: () => void
  onAddToCanvas: (
    type: ShapeType | "text" | "custom-image",
    pos: { x: number; y: number },
    text?: string,
    settings?: Partial<ElementData>,
    onAdded?: (elementId: string) => void,
  ) => void
}

type TabType = "mockups" | "sample-images" | "sample-backgrounds"

const SampleAssetsModal: React.FC<SampleAssetsModalProps> = ({ isOpen, onClose, onAddToCanvas }) => {
  const { loggedInUser } = useUser()
  
  const tabs = [
    { id: "mockups" as TabType, label: "Mockups", disabled: false },
    { id: "sample-images" as TabType, label: "Sample Elements", disabled: !loggedInUser },
    { id: "sample-backgrounds" as TabType, label: "Sample Backgrounds", disabled: !loggedInUser },
  ]

// Adding styles for scrollbar
const scrollbarStyles = `
  ::-webkit-scrollbar {
    width: 8px;
    background-color: #292C31;
  }
  ::-webkit-scrollbar-thumb {
    background-color: #44474A;
    border-radius: 4px;
  }
  ::-webkit-scrollbar-track {
    background-color: #292C31;
    border-radius: 4px;
  }
`

  const [activeTab, setActiveTab] = useState<TabType>("mockups")
  const { stageSize, addRenderableObject, addHistoryEntry, renderableObjects, setRenderableObjects } = useTool()
  const { setImageAsBackground } = useElementsManager()

  // Template states
  const [selectedTemplateImage, setSelectedTemplateImage] = useState<ProjectTemplate | null>(null)
  const [setTemplateAsBackground, setSetTemplateAsBackground] = useState<boolean>(false)

  // Pixabay API states for sample images
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [pixabayImages, setPixabayImages] = useState<PixabayImage[]>([])
  const [selectedPixabayImageId, setSelectedPixabayImageId] = useState<number | null>(null)
  const [isLoadingImages, setIsLoadingImages] = useState<boolean>(false)
  const [searchError, setSearchError] = useState<string>("")
  const [selectedPixabayColor, setSelectedPixabayColor] = useState<string>("")
  const [selectedPixabayOrientation, setSelectedPixabayOrientation] = useState<string>("")
  const [showPixabayAdvancedFilters, setShowPixabayAdvancedFilters] = useState<boolean>(false)
  const [hasSearchedPixabay, setHasSearchedPixabay] = useState<boolean>(false)

  // Unsplash API states for sample backgrounds
  const [unsplashSearchQuery, setUnsplashSearchQuery] = useState<string>("")
  const [unsplashImages, setUnsplashImages] = useState<UnsplashImage[]>([])
  const [selectedUnsplashImageId, setSelectedUnsplashImageId] = useState<string | null>(null)
  const [isLoadingUnsplashImages, setIsLoadingUnsplashImages] = useState<boolean>(false)
  const [unsplashSearchError, setUnsplashSearchError] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [selectedOrientation, setSelectedOrientation] = useState<string>("")
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false)
  const [hasSearchedUnsplash, setHasSearchedUnsplash] = useState<boolean>(false)

  // Background checkbox states
  const [setPixabayAsBackground, setSetPixabayAsBackground] = useState<boolean>(false)
  const [setUnsplashAsBackground, setSetUnsplashAsBackground] = useState<boolean>(false)

  // Check if Unsplash API key is configured
  const isUnsplashConfigured = () => {
    const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY
    return accessKey && accessKey !== "your_unsplash_access_key_here"
  }

  // Unsplash filter options
  const colorOptions = [
    { value: "black_and_white", label: "Black & White" },
    { value: "black", label: "Black" },
    { value: "white", label: "White" },
    { value: "yellow", label: "Yellow" },
    { value: "orange", label: "Orange" },
    { value: "red", label: "Red" },
    { value: "purple", label: "Purple" },
    { value: "magenta", label: "Magenta" },
    { value: "green", label: "Green" },
    { value: "teal", label: "Teal" },
    { value: "blue", label: "Blue" },
  ]

  const orientationOptions = [
    { value: "landscape", label: "Landscape", icon: <RectangleHorizontal className="w-4 h-4" /> },
    { value: "portrait", label: "Portrait", icon: <RectangleVertical className="w-4 h-4" /> },
    { value: "squarish", label: "Square", icon: <Square className="w-4 h-4" /> },
  ]

  // Pixabay filter options
  const pixabayColorOptions = [
    { value: "grayscale", label: "Grayscale" },
    { value: "transparent", label: "Transparent" },
    { value: "red", label: "Red" },
    { value: "orange", label: "Orange" },
    { value: "yellow", label: "Yellow" },
    { value: "green", label: "Green" },
    { value: "turquoise", label: "Turquoise" },
    { value: "blue", label: "Blue" },
    { value: "lilac", label: "Lilac" },
    { value: "pink", label: "Pink" },
    { value: "white", label: "White" },
    { value: "gray", label: "Gray" },
    { value: "black", label: "Black" },
    { value: "brown", label: "Brown" },
  ]

  const pixabayOrientationOptions = [
    { value: "horizontal", label: "Horizontal", icon: <RectangleHorizontal className="w-4 h-4" /> },
    { value: "vertical", label: "Vertical", icon: <RectangleVertical className="w-4 h-4" /> },
  ]

  // Function to search Pixabay images using API module
  const searchPixabayImagesLocal = async (query: string) => {
    if (!query.trim()) {
      setPixabayImages([])
      return
    }

    setIsLoadingImages(true)
    setSearchError("")

    try {
      const data = await searchPixabayImages({
        query: query.trim(),
        color: selectedPixabayColor,
        orientation: selectedPixabayOrientation,
        perPage: 200
      });
      setPixabayImages(data.hits)
    } catch (error) {
      console.error("Error fetching Pixabay images:", error)
      setSearchError(error instanceof Error ? error.message : "Failed to fetch images. Please try again.")
      setPixabayImages([])
    } finally {
      setIsLoadingImages(false)
    }
  }

  // Function to search Unsplash images using API module
  const searchUnsplashImagesLocal = async (query: string) => {
    if (!query.trim()) {
      setUnsplashImages([])
      return
    }

    setIsLoadingUnsplashImages(true)
    setUnsplashSearchError("")

    try {
      const data = await searchUnsplashImages({
        query: query.trim(),
        color: selectedColor,
        orientation: selectedOrientation,
        perPage: 30
      });
      setUnsplashImages(data.results)
    } catch (error) {
      console.error("Error fetching Unsplash images:", error)
      if (error instanceof Error) {
        setUnsplashSearchError(error.message)
      } else {
        setUnsplashSearchError("Failed to fetch images. Please try again.")
      }
      setUnsplashImages([])
    } finally {
      setIsLoadingUnsplashImages(false)
    }
  }

  // Auto-search when tab opens
  useEffect(() => {
    if (activeTab === "sample-images" && !hasSearchedPixabay && !searchQuery && pixabayImages.length === 0) {
      setSearchQuery("button")
      searchPixabayImagesLocal("button")
      setHasSearchedPixabay(true)
    }
  }, [activeTab])

  useEffect(() => {
    if (
      activeTab === "sample-backgrounds" &&
      !hasSearchedUnsplash &&
      !unsplashSearchQuery &&
      unsplashImages.length === 0
    ) {
      if (isUnsplashConfigured()) {
        setUnsplashSearchQuery("simple")
        searchUnsplashImagesLocal("simple")
        setHasSearchedUnsplash(true)
      }
    }
  }, [activeTab])

  // Auto-search when filters change
  useEffect(() => {
    if (activeTab === "sample-backgrounds" && unsplashSearchQuery && isUnsplashConfigured()) {
      const timeoutId = setTimeout(() => {
        searchUnsplashImagesLocal(unsplashSearchQuery)
      }, 300)
      return () => clearTimeout(timeoutId)
    }
  }, [selectedColor, selectedOrientation])

  useEffect(() => {
    if (activeTab === "sample-images" && searchQuery) {
      const timeoutId = setTimeout(() => {
        searchPixabayImagesLocal(searchQuery)
      }, 300)
      return () => clearTimeout(timeoutId)
    }
  }, [selectedPixabayColor, selectedPixabayOrientation])

  const handlePixabayImageSelect = (imageId: number) => {
    setSelectedPixabayImageId(imageId)
    setSelectedUnsplashImageId(null) // Clear other selection
    setSetUnsplashAsBackground(false) // Clear other background setting
  }

  const handleUnsplashImageSelect = (imageId: string) => {
    setSelectedUnsplashImageId(imageId)
    setSelectedPixabayImageId(null) // Clear other selection
    setSetPixabayAsBackground(false) // Clear other background setting
  }

  const handleAddSelectedImage = async () => {
    try {
      let imageUrl = ""
      let imageName = ""
      let originalWidth = 0
      let originalHeight = 0
      let shouldSetAsBackground = false

      if (selectedTemplateImage) {
        imageUrl = selectedTemplateImage.imagePath
        imageName = `${selectedTemplateImage.title}.png`
        originalWidth = selectedTemplateImage.width
        originalHeight = selectedTemplateImage.height
        shouldSetAsBackground = setTemplateAsBackground
      } else if (selectedPixabayImageId) {
        const selectedImage = pixabayImages.find((img) => img.id === selectedPixabayImageId)
        if (!selectedImage) return

        imageUrl = selectedImage.webformatURL
        imageName = `${selectedImage.tags.split(",")[0].trim()}.jpg`
        originalWidth = selectedImage.webformatWidth
        originalHeight = selectedImage.webformatHeight
        shouldSetAsBackground = setPixabayAsBackground
      } else if (selectedUnsplashImageId) {
        const selectedImage = unsplashImages.find((img) => img.id === selectedUnsplashImageId)
        if (!selectedImage) return

        imageUrl = selectedImage.urls.regular
        imageName = `${selectedImage.alt_description || "unsplash-image"}.jpg`
        originalWidth = selectedImage.width
        originalHeight = selectedImage.height
        shouldSetAsBackground = setUnsplashAsBackground
      } else {
        return
      }

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
          // Note: We can't directly call setStageSize here since it's not in the hook dependencies
          // The canvas will handle this when the element is added
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

        // Create image element with proper structure similar to importFile
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
          console.log("SampleAssets: Adding image directly as background and fitting to canvas", {
            imageId: imageElement.id.slice(-6),
            imageName: imageName,
          })

          // Add the image directly as background (at the beginning of the array)
          const updatedObjects = [imageElement, ...renderableObjects]
          setRenderableObjects(updatedObjects)

          // Add to history manually for background image
          addHistoryEntry({
            type: "elementAdded",
            description: `Added sample image "${imageName}" as background`,
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

              console.log("SampleAssets: Background image fitted to canvas", {
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
        }

        // Wait a bit for image to render before adding to history
        setTimeout(
          () => {
            // Note: History is already handled by setImageAsBackground and setRenderableObjects
            // No need to manually add history entry here since those functions handle it
            console.log("SampleAssets: Image successfully added and processed")
          },
          shouldSetAsBackground ? 300 : 100,
        ) // Shorter wait since we don't use addRenderableObject for background

        // Show success toast
        toast.success("Success", {
          description: `Sample image "${imageName}"${shouldSetAsBackground ? " set as background" : " added"} successfully`,
          duration: 3000,
        })

        onClose()
      }

      img.onerror = () => {
        console.error("Error loading image:", imageUrl)
        toast.error("Error", {
          description: "Failed to load the selected image. Please try again.",
          duration: 5000,
        })
      }

      // Start loading the image
      img.src = imageUrl
    } catch (error) {
      console.error("Error adding selected image:", error)
      toast.error("Error", {
        description: "Error adding image to canvas: " + error,
        duration: 5000,
      })
    }
  }

  // Template handlers
  const handleTemplateImageSelect = (template: ProjectTemplate) => {
    setSelectedTemplateImage(template)
    setSelectedPixabayImageId(null) // Clear pixabay selection
    setSelectedUnsplashImageId(null) // Clear unsplash selection
    setSetTemplateAsBackground(false) // Reset background checkbox
    
    toast.success("Template selected", { 
      description: `${template.title} is ready to be added to canvas`,
      duration: 3000 
    })
  }

  const handleTemplateBackgroundCheckboxChange = (checked: boolean) => {
    setSetTemplateAsBackground(checked)
  }

  const handleTabClick = (tabId: TabType) => {
    setActiveTab(tabId)
    
    // Reset selections when switching tabs
    if (tabId !== 'mockups') {
      setSelectedTemplateImage(null)
      setSetTemplateAsBackground(false)
    }
    if (tabId !== 'sample-images') {
      setSelectedPixabayImageId(null)
      setSetPixabayAsBackground(false)
    }
    if (tabId !== 'sample-backgrounds') {
      setSelectedUnsplashImageId(null)
      setSetUnsplashAsBackground(false)
    }
  }

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      setSelectedPixabayImageId(null) // Clear selection when searching
      setSetPixabayAsBackground(false) // Clear background setting when searching
      searchPixabayImagesLocal(searchQuery.trim())
      setShowPixabayAdvancedFilters(false)
      setHasSearchedPixabay(true)
    }
  }

  const handleUnsplashSearchSubmit = () => {
    if (unsplashSearchQuery.trim()) {
      setSelectedUnsplashImageId(null) // Clear selection when searching
      setSetUnsplashAsBackground(false) // Clear background setting when searching
      searchUnsplashImagesLocal(unsplashSearchQuery.trim())
      setShowAdvancedFilters(false)
      setHasSearchedUnsplash(true)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchSubmit()
    }
  }

  const handleUnsplashKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleUnsplashSearchSubmit()
    }
  }

  const handleQuickSearch = (term: string) => {
    setSearchQuery(term)
    setSelectedPixabayImageId(null) // Clear selection when searching
    setSetPixabayAsBackground(false) // Clear background setting when searching
    searchPixabayImagesLocal(term)
    setHasSearchedPixabay(true)
  }

  const handleUnsplashQuickSearch = (term: string) => {
    setUnsplashSearchQuery(term)
    setSelectedUnsplashImageId(null) // Clear selection when searching
    setSetUnsplashAsBackground(false) // Clear background setting when searching
    searchUnsplashImagesLocal(term)
    setHasSearchedUnsplash(true)
  }

  // Pixabay filter functions
  const handlePixabayColorToggle = (color: string) => {
    setSelectedPixabayColor((prev) => (prev === color ? "" : color))
  }

  const handlePixabayOrientationToggle = (orientation: string) => {
    setSelectedPixabayOrientation((prev) => (prev === orientation ? "" : orientation))
  }

  const handleClearPixabayFilters = () => {
    setSelectedPixabayColor("")
    setSelectedPixabayOrientation("")
  }

  const handleRemovePixabayColorFilter = () => {
    setSelectedPixabayColor("")
  }

  const handleRemovePixabayOrientationFilter = () => {
    setSelectedPixabayOrientation("")
  }

  // Unsplash filter functions
  const handleColorToggle = (color: string) => {
    setSelectedColor((prev) => (prev === color ? "" : color))
  }

  const handleOrientationToggle = (orientation: string) => {
    setSelectedOrientation((prev) => (prev === orientation ? "" : orientation))
  }

  const handleClearFilters = () => {
    setSelectedColor("")
    setSelectedOrientation("")
  }

  const handleRemoveColorFilter = () => {
    setSelectedColor("")
  }

  const handleRemoveOrientationFilter = () => {
    setSelectedOrientation("")
  }

  // Function to get color styles
  const getColorStyle = (colorValue: string) => {
    const colorMap: Record<string, string> = {
      black_and_white: "text-gray-400",
      black: "text-gray-900",
      white: "text-gray-100",
      yellow: "text-yellow-400",
      orange: "text-orange-400",
      red: "text-red-400",
      purple: "text-purple-400",
      magenta: "text-pink-400",
      green: "text-green-400",
      teal: "text-teal-400",
      blue: "text-blue-400",
    }
    return colorMap[colorValue] || "text-gray-300"
  }

  const getPixabayColorStyle = (colorValue: string) => {
    const colorMap: Record<string, string> = {
      grayscale: "text-gray-400",
      transparent: "text-gray-300",
      red: "text-red-400",
      orange: "text-orange-400",
      yellow: "text-yellow-400",
      green: "text-green-400",
      turquoise: "text-teal-400",
      blue: "text-blue-400",
      lilac: "text-purple-400",
      pink: "text-pink-400",
      white: "text-gray-100",
      gray: "text-gray-400",
      black: "text-gray-900",
      brown: "text-amber-600",
    }
    return colorMap[colorValue] || "text-gray-300"
  }

  // Background checkbox handlers
  const handlePixabayBackgroundCheckboxChange = (checked: boolean) => {
    setSetPixabayAsBackground(checked)
  }

  const handleUnsplashBackgroundCheckboxChange = (checked: boolean) => {
    setSetUnsplashAsBackground(checked)
  }

  const resetFormStates = () => {
    setActiveTab("mockups")
    // Reset template states
    setSelectedTemplateImage(null)
    setSetTemplateAsBackground(false)
    // Reset pixabay states
    setSearchQuery("")
    setPixabayImages([])
    setSelectedPixabayImageId(null)
    setSearchError("")
    setSelectedPixabayColor("")
    setSelectedPixabayOrientation("")
    setShowPixabayAdvancedFilters(false)
    setHasSearchedPixabay(false)
    // Reset unsplash states
    setUnsplashSearchQuery("")
    setUnsplashImages([])
    setSelectedUnsplashImageId(null)
    setUnsplashSearchError("")
    setSelectedColor("")
    setSelectedOrientation("")
    setShowAdvancedFilters(false)
    setHasSearchedUnsplash(false)
    setSetPixabayAsBackground(false)
    setSetUnsplashAsBackground(false)
  }

  if (!isOpen) return null

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          resetFormStates()
          onClose()
        }
      }}
    >
      <DialogContent className="sm:max-w-[800px] sm:max-h-[80vh] h-full bg-[#2D2F34FF] text-gray-300 border-none p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-0 w-full">
          <DialogTitle className="m-0 text-base font-normal text-center text-gray-300">Sample Assets</DialogTitle>

          {/* Tabs */}
          <div className="flex border-b border-[#4A4D54FF]">
            {tabs.map((tab) => (
              <div key={tab.id} className="flex">
                {tab.disabled ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex relative">
                          <button
                            onClick={() => !tab.disabled && handleTabClick(tab.id)}
                            onKeyDown={(e) => !tab.disabled && (e.key === 'Enter' || e.key === ' ') && handleTabClick(tab.id)}
                            className={`px-4 py-3 text-sm font-medium transition-colors duration-200 border-b-2 hover:text-gray-200 focus:text-white focus:border-white focus:border-b-2 focus:bg-[#3A3D44FF] focus:rounded-t-md
                              ${activeTab === tab.id
                                ? 'text-white border-white border-b-2 bg-[#3A3D44FF] rounded-t-md'
                                : 'text-gray-400 border-transparent hover:border-gray-500'
                              }
                            ${tab.disabled ? 'opacity-50 hover:text-gray-400 hover:border-transparent' : ''}`}
                            tabIndex={tab.disabled ? -1 : 0}
                            aria-label={`Switch to ${tab.label} tab`}
                            disabled={tab.disabled}
                          >
                            <span className="flex items-center gap-2">
                              {tab.label}
                            </span>
                          </button>
                          {(tab.id === 'sample-images' || tab.id === 'sample-backgrounds') && (
                            <span className="inline-flex items-center px-1 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm border border-blue-400/20 m-auto">
                              <Zap className="w-4 h-4 !text-white" />
                            </span>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" align="center">
                        <p>Sign in to access {tab.label} tool</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <button
                    onClick={() => handleTabClick(tab.id)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleTabClick(tab.id)}
                    className={`px-4 py-3 text-sm font-medium transition-colors duration-200 border-b-2 hover:text-gray-200 focus:text-white focus:border-white focus:border-b-2 focus:bg-[#3A3D44FF] focus:rounded-t-md
                      ${activeTab === tab.id
                        ? 'text-white border-white border-b-2 bg-[#3A3D44FF] rounded-t-md'
                        : 'text-gray-400 border-transparent hover:border-gray-500'
                      }`}
                    tabIndex={0}
                    aria-label={`Switch to ${tab.label} tab`}
                  >
                    <span className="flex items-center gap-2">
                      {tab.label}
                      {(tab.id === 'sample-images' || tab.id === 'sample-backgrounds') && (
                        <span className="inline-flex items-center px-1 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm border border-blue-400/20 ml-auto">
                          <Zap className="w-4 h-4 !text-white" />
                        </span>
                      )}
                    </span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </DialogHeader>

        {/* Mockups Tab */}
        {activeTab === "mockups" && (
          <div className="flex flex-col p-6 pb-0 flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto max-h-[calc(80vh-12rem)] pr-4 custom-scroll">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {projectTemplates.map((template) => (
                  <Card
                    key={template.id}
                    onClick={() => handleTemplateImageSelect(template)}
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleTemplateImageSelect(template)}
                    className={`group cursor-pointer transition-all duration-200 bg-[#3A3D44FF] border-2 rounded-lg overflow-hidden hover:bg-[#4A4D54FF] p-0 
                               ${selectedTemplateImage?.id === template.id ? "border-blue-500" : "border-[#4A4D54FF] hover:border-gray-600"}`}
                  >
                    <CardContent className="p-0">
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={template.imagePath}
                          alt={template.title}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200 p-1"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-2">
                        <div className="text-xs text-gray-300 truncate" title={template.title}>
                          {template.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {template.dimensionsText}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sample Images Tab */}
        {activeTab === "sample-images" && (
          <div className="flex flex-col p-6 pb-0 flex-1 overflow-hidden">
            <div className="text-xs text-gray-400 text-end -mt-4.5 mb-0.5 mr-12.5 p-0">
              Powered by{" "}
              <a
                href="https://pixabay.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Pixabay
              </a>
            </div>

            {/* Search Input */}
            <div className="mb-2">
              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter keywords (e.g., buttons, icons, interface)"
                    className="bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 w-full"
                    disabled={isLoadingImages}
                  />
                </div>
                <Button
                  onClick={handleSearchSubmit}
                  disabled={isLoadingImages || !searchQuery.trim()}
                  className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:opacity-50 text-white font-medium rounded-md transition-colors duration-200 flex items-center gap-2"
                >
                  <SearchIcon className="w-4 h-4" />
                </Button>
              </div>

              {/* Quick Search Buttons */}
              <div className="space-y-0 flex items-center justify-between mb-0">
                <div className="flex flex-wrap gap-1">
                  {[
                    "button",
                    "icon",
                    "mockup",
                    "emoji",
                    "sticker",
                    "label",
                    "interface",
                    "postcard",
                    "social media",
                    "ui element",
                    "mobile",
                  ].map((term) => (
                    <button
                      key={term}
                      onClick={() => handleQuickSearch(term)}
                      className={`px-2 py-0.5 text-xs rounded-full border transition-all duration-200 hover:bg-blue-500/20 hover:border-blue-500/50 hover:scale-105 focus:bg-blue-500/20 focus:border-blue-500 focus:outline-none focus:scale-105
                        ${searchQuery === term
                          ? "bg-blue-500/30 border-blue-500 text-blue-200 shadow-md"
                          : "bg-[#3A3D44FF] border-[#4A4D54FF] text-gray-300 hover:text-gray-200"
                        }`}
                      disabled={isLoadingImages}
                    >
                      {term}
                    </button>
                  ))}
                </div>

                {/* Advanced Filters */}
                <div className="">
                  <button
                    onClick={() => setShowPixabayAdvancedFilters(!showPixabayAdvancedFilters)}
                    className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-300 transition-colors duration-200"
                  >
                    <FunnelPlus className="w-4 h-4" />
                    {showPixabayAdvancedFilters ? (
                      <ChevronUpIcon className="w-4 h-4" />
                    ) : (
                      <ChevronDownIcon className="w-4 h-4" />
                    )}
                    {(selectedPixabayColor || selectedPixabayOrientation) && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {(selectedPixabayColor ? 1 : 0) + (selectedPixabayOrientation ? 1 : 0)}
                      </span>
                    )}
                  </button>
                </div>
              </div>
              {showPixabayAdvancedFilters && (
                <div className="mt-3 p-2 bg-[#3A3D44FF] rounded-lg border border-2 border-[#4A4D54FF] space-y-4">
                  {/* Color Filters */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm text-gray-300 ml-2">Colors</label>
                      {selectedPixabayColor && (
                        <button
                          onClick={() => setSelectedPixabayColor("")}
                          className="px-2 py-0.5 bg-gray-500/50 hover:bg-gray-500 disabled:bg-gray-600 disabled:opacity-50 text-white text-xs rounded-md transition-colors duration-200"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {pixabayColorOptions.map((color) => {
                        const isSelected = selectedPixabayColor === color.value
                        const colorClass = getPixabayColorStyle(color.value)

                        return (
                          <button
                            key={color.value}
                            onClick={() => handlePixabayColorToggle(color.value)}
                            className={`px-2 py-0.5 text-xs ${colorClass} rounded-full border transition-all duration-200 hover:bg-blue-500/20 hover:border-blue-500/50 hover:scale-105 focus:bg-blue-500/20 focus:border-blue-500 focus:outline-none focus:scale-105
                                ${isSelected
                                ? "bg-blue-500/30 border-blue-500 shadow-md"
                                : "bg-[#3A3D44FF] border-[#4A4D54FF]"
                              }`}
                          >
                            {color.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Orientation Filters */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm text-gray-300 ml-2">Orientation</label>
                      {selectedPixabayOrientation && (
                        <button
                          onClick={() => setSelectedPixabayOrientation("")}
                          className="px-2 py-0.5 bg-gray-500/50 hover:bg-gray-500 disabled:bg-gray-600 disabled:opacity-50 text-white text-xs rounded-md transition-colors duration-200"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {pixabayOrientationOptions.map((orientation) => (
                        <button
                          key={orientation.value}
                          onClick={() => handlePixabayOrientationToggle(orientation.value)}
                          className={`px-2 py-0.5 text-xs rounded-full border transition-all duration-200 hover:bg-blue-500/20 hover:border-blue-500/50 hover:scale-105 focus:bg-blue-500/20 focus:border-blue-500 focus:outline-none focus:scale-105
                            flex items-center justify-center
                            ${selectedPixabayOrientation === orientation.value
                              ? "bg-blue-500/30 border-blue-500 text-blue-200 shadow-md"
                              : "bg-[#3A3D44FF] border-[#4A4D54FF] text-gray-300 hover:text-gray-200"
                            }`}
                        >
                          {orientation.icon}
                          <span className="ml-1">{orientation.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear All Filters Button */}
                  {(selectedPixabayColor || selectedPixabayOrientation) && (
                    <div className="pt-2 border-t border-[#4A4D54FF] flex justify-end">
                      <button
                        onClick={handleClearPixabayFilters}
                        className="px-2 py-0.5 bg-gray-500/50 hover:bg-gray-500 disabled:bg-gray-600 disabled:opacity-50 text-white text-xs rounded-md transition-colors duration-200"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Images Grid */}
            <div className="flex-1 overflow-y-auto pr-4 custom-scroll">
              {isLoadingImages && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-400">Loading images...</div>
                </div>
              )}

              {searchError && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-red-400">{searchError}</div>
                </div>
              )}

              {!isLoadingImages && pixabayImages.length === 0 && !searchQuery && (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="text-gray-400 mb-4">Ready to search</div>
                  <div className="text-sm text-gray-500">Use quick search buttons or enter custom keywords</div>
                </div>
              )}

              {pixabayImages.length > 0 && (
                <div className="text-xs text-gray-400 mb-2 text-center flex flex-row items-center justify-center">
                  <div className="flex flex-row items-center justify-center mb-0">
                    <span className="mr-1">
                      Found {pixabayImages.length} images for "{searchQuery}"
                    </span>
                  </div>
                  {(selectedPixabayColor || selectedPixabayOrientation) && (
                    <div className="flex flex-row items-center justify-center gap-2">
                      <span className="text-xs">with filters:</span>
                      {selectedPixabayColor && (
                        <div className="flex items-center gap-0.5 border rounded-full px-1 py-0.5 group bg-blue-500/30 border-blue-500 text-blue-200 shadow-md transition-all duration-200 hover:bg-blue-500/20 hover:border-blue-500/50 hover:scale-105 focus:bg-blue-500/20 focus:border-blue-500 focus:outline-none focus:scale-105">
                          <span className={`text-xs font-medium ${getPixabayColorStyle(selectedPixabayColor)}`}>
                            {pixabayColorOptions.find((c) => c.value === selectedPixabayColor)?.label}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemovePixabayColorFilter()
                            }}
                            className="hover:bg-blue-600/50 rounded-full p-0.5 transition-colors duration-200 opacity-70 hover:opacity-100"
                            aria-label="Remove color filter"
                          >
                            <X className="w-3 h-3 text-gray-400 hover:text-gray-200" />
                          </button>
                        </div>
                      )}
                      {selectedPixabayOrientation && (
                        <div className="flex items-center gap-0.5 bg-[#3A3D44FF] border border-[#4A4D54FF] rounded-full px-1 py-0.5 group bg-blue-500/30 border-blue-500 text-blue-200 shadow-md transition-all duration-200 hover:bg-blue-500/20 hover:border-blue-500/50 hover:scale-105 focus:bg-blue-500/20 focus:border-blue-500 focus:outline-none focus:scale-105">
                          <div className="text-gray-300">
                            {pixabayOrientationOptions.find((o) => o.value === selectedPixabayOrientation)?.icon}
                          </div>
                          <span className="text-xs font-medium text-gray-300">
                            {pixabayOrientationOptions.find((o) => o.value === selectedPixabayOrientation)?.label}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemovePixabayOrientationFilter()
                            }}
                            className="hover:bg-blue-600/50 rounded-full p-0.5 transition-colors duration-200 opacity-70 hover:opacity-100"
                            aria-label="Remove orientation filter"
                          >
                            <X className="w-3 h-3 text-gray-400 hover:text-gray-200" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {pixabayImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {pixabayImages.map((image) => (
                    <Card
                      key={image.id}
                      onClick={() => handlePixabayImageSelect(image.id)}
                      className={`group cursor-pointer transition-all duration-200 bg-[#3A3D44FF] border-2 rounded-lg overflow-hidden hover:bg-[#4A4D54FF] p-0
                        ${selectedPixabayImageId === image.id ? "border-blue-500" : "border-[#4A4D54FF] hover:border-gray-600"}`}
                    >
                      <CardContent className="p-0">
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={image.previewURL || "/placeholder.svg"}
                            alt={image.tags}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-2">
                          <div className="text-xs text-gray-300 truncate" title={image.tags}>
                            {image.tags}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">by {image.user}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {image.webformatWidth} × {image.webformatHeight}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sample Backgrounds Tab */}
        {activeTab === "sample-backgrounds" && (
          <div className="flex flex-col p-6 pb-0 flex-1 overflow-hidden">
            <div className="text-xs text-gray-400 text-end -mt-4.5 mb-0.5 mr-12.5 p-0">
              Powered by{" "}
              <a
                href="https://unsplash.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Unsplash
              </a>
            </div>

            {/* Search Input */}
            <div className="mb-2">
              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    value={unsplashSearchQuery}
                    onChange={(e) => setUnsplashSearchQuery(e.target.value)}
                    onKeyPress={handleUnsplashKeyPress}
                    placeholder="Enter keywords (e.g., background, abstract, texture)"
                    className="bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 w-full"
                    disabled={isLoadingUnsplashImages || !isUnsplashConfigured()}
                  />
                </div>
                <Button
                  onClick={handleUnsplashSearchSubmit}
                  disabled={isLoadingUnsplashImages || !unsplashSearchQuery.trim() || !isUnsplashConfigured()}
                  className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:opacity-50 text-white font-medium rounded-md transition-colors duration-200 flex items-center gap-2"
                >
                  <SearchIcon className="w-4 h-4" />
                </Button>
              </div>

              {/* Quick Search Buttons */}
              <div className="space-y-0 flex items-center justify-between mb-0">
                <div className="flex flex-wrap gap-1">
                  {[
                    "simple",
                    "minimalist",
                    "abstract",
                    "background",
                    "texture",
                    "gradient",
                    "blur",
                    "aesthetic",
                    "pastel",
                    "colorful",
                    "neutral",
                  ].map((term) => (
                    <button
                      key={term}
                      onClick={() => handleUnsplashQuickSearch(term)}
                      className={`px-2 py-0.5 text-xs rounded-full border transition-all duration-200 hover:bg-blue-500/20 hover:border-blue-500/50 hover:scale-105 focus:bg-blue-500/20 focus:border-blue-500 focus:outline-none focus:scale-105
                        ${unsplashSearchQuery === term
                          ? "bg-blue-500/30 border-blue-500 text-blue-200 shadow-md"
                          : "bg-[#3A3D44FF] border-[#4A4D54FF] text-gray-300 hover:text-gray-200"
                        }`}
                      disabled={isLoadingUnsplashImages || !isUnsplashConfigured()}
                    >
                      {term}
                    </button>
                  ))}
                </div>

                {/* Advanced Filters */}
                <div className="">
                  <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-300 transition-colors duration-200"
                    disabled={!isUnsplashConfigured()}
                  >
                    <FunnelPlus className="w-4 h-4" />
                    {showAdvancedFilters ? (
                      <ChevronUpIcon className="w-4 h-4" />
                    ) : (
                      <ChevronDownIcon className="w-4 h-4" />
                    )}
                    {(selectedColor || selectedOrientation) && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {(selectedColor ? 1 : 0) + (selectedOrientation ? 1 : 0)}
                      </span>
                    )}
                  </button>
                </div>
              </div>
              {showAdvancedFilters && (
                <div className="mt-3 p-2 bg-[#3A3D44FF] rounded-lg border border-2 border-[#4A4D54FF] space-y-4">
                  {/* Color Filters */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm text-gray-300 ml-2">Colors</label>
                      {selectedColor && (
                        <button
                          onClick={() => setSelectedColor("")}
                          className="px-2 py-0.5 bg-gray-500/50 hover:bg-gray-500 disabled:bg-gray-600 disabled:opacity-50 text-white text-xs rounded-md transition-colors duration-200"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map((color) => {
                        const isSelected = selectedColor === color.value
                        const colorClass = getColorStyle(color.value)

                        return (
                          <button
                            key={color.value}
                            onClick={() => handleColorToggle(color.value)}
                            className={`px-2 py-0.5 text-xs ${colorClass} rounded-full border transition-all duration-200 hover:bg-blue-500/20 hover:border-blue-500/50 hover:scale-105 focus:bg-blue-500/20 focus:border-blue-500 focus:outline-none focus:scale-105
                                ${isSelected
                                ? "bg-blue-500/30 border-blue-500 shadow-md"
                                : "bg-[#3A3D44FF] border-[#4A4D54FF]"
                              }`}
                            disabled={!isUnsplashConfigured()}
                          >
                            {color.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Orientation Filters */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm text-gray-300 ml-2">Orientation</label>
                      {selectedOrientation && (
                        <button
                          onClick={() => setSelectedOrientation("")}
                          className="px-2 py-0.5 bg-gray-500/50 hover:bg-gray-500 disabled:bg-gray-600 disabled:opacity-50 text-white text-xs rounded-md transition-colors duration-200"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {orientationOptions.map((orientation) => (
                        <button
                          key={orientation.value}
                          onClick={() => handleOrientationToggle(orientation.value)}
                          className={`px-2 py-0.5 text-xs rounded-full border transition-all duration-200 hover:bg-blue-500/20 hover:border-blue-500/50 hover:scale-105 focus:bg-blue-500/20 focus:border-blue-500 focus:outline-none focus:scale-105
                            flex items-center justify-center
                            ${selectedOrientation === orientation.value
                              ? "bg-blue-500/30 border-blue-500 text-blue-200 shadow-md"
                              : "bg-[#3A3D44FF] border-[#4A4D54FF] text-gray-300 hover:text-gray-200"
                            }`}
                          disabled={!isUnsplashConfigured()}
                        >
                          {orientation.icon}
                          <span className="ml-1">{orientation.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear All Filters Button */}
                  {(selectedColor || selectedOrientation) && (
                    <div className="pt-2 border-t border-[#4A4D54FF] flex justify-end">
                      <button
                        onClick={handleClearFilters}
                        className="px-2 py-0.5 bg-gray-500/50 hover:bg-gray-500 disabled:bg-gray-600 disabled:opacity-50 text-white text-xs rounded-md transition-colors duration-200"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Images Grid */}
            <div className="flex-1 overflow-y-auto pr-4 custom-scroll">
              {isLoadingUnsplashImages && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-400">Loading background images...</div>
                </div>
              )}

              {unsplashSearchError && (
                <div className="flex flex-col items-center justify-center py-8 px-4">
                  <div className="text-red-400 text-center mb-4">{unsplashSearchError}</div>
                </div>
              )}

              {!isLoadingUnsplashImages &&
                unsplashImages.length === 0 &&
                !unsplashSearchQuery &&
                !unsplashSearchError && (
                  <div className="flex flex-col items-center justify-center py-8">
                    {isUnsplashConfigured() ? (
                      <>
                        <div className="text-gray-400 mb-4">Ready to search</div>
                        <div className="text-sm text-gray-500">Use quick search buttons or enter custom keywords</div>
                      </>
                    ) : (
                      <div className="text-gray-400 text-center px-4">
                        <div className="mb-4">Unsplash API key required</div>
                        <div className="text-sm text-gray-500">
                          Configure your API key to search for background images
                        </div>
                      </div>
                    )}
                  </div>
                )}

              {unsplashImages.length > 0 && (
                <div className="text-xs text-gray-400 mb-2 text-center flex flex-row items-center justify-center">
                  <div className="flex flex-row items-center justify-center mb-0">
                    <span className="mr-1">
                      Found {unsplashImages.length} images for "{unsplashSearchQuery}"
                    </span>
                  </div>
                  {(selectedColor || selectedOrientation) && (
                    <div className="flex flex-row items-center justify-center gap-2">
                      <span className="text-xs">with filters:</span>
                      {selectedColor && (
                        <div className="flex items-center gap-0.5 bg-[#3A3D44FF] border border-[#4A4D54FF] rounded-full px-1 py-0.5 group bg-blue-500/30 border-blue-500 text-blue-200 shadow-md transition-all duration-200 hover:bg-blue-500/20 hover:border-blue-500/50 hover:scale-105 focus:bg-blue-500/20 focus:border-blue-500 focus:outline-none focus:scale-105">
                          <span className={`text-xs font-medium ${getColorStyle(selectedColor)}`}>
                            {colorOptions.find((c) => c.value === selectedColor)?.label}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveColorFilter()
                            }}
                            className="hover:bg-blue-600/50 rounded-full p-0.5 transition-colors duration-200 opacity-70 hover:opacity-100"
                            aria-label="Remove color filter"
                          >
                            <X className="w-3 h-3 text-gray-400 hover:text-gray-200" />
                          </button>
                        </div>
                      )}
                      {selectedOrientation && (
                        <div className="flex items-center gap-0.5 bg-[#3A3D44FF] border border-[#4A4D54FF] rounded-full px-1 py-0.5 group bg-blue-500/30 border-blue-500 text-blue-200 shadow-md transition-all duration-200 hover:bg-blue-500/20 hover:border-blue-500/50 hover:scale-105 focus:bg-blue-500/20 focus:border-blue-500 focus:outline-none focus:scale-105">
                          <div className="text-gray-300">
                            {orientationOptions.find((o) => o.value === selectedOrientation)?.icon}
                          </div>
                          <span className="text-xs font-medium text-gray-300">
                            {orientationOptions.find((o) => o.value === selectedOrientation)?.label}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveOrientationFilter()
                            }}
                            className="hover:bg-blue-600/50 rounded-full p-0.5 transition-colors duration-200 opacity-70 hover:opacity-100"
                            aria-label="Remove orientation filter"
                          >
                            <X className="w-3 h-3 text-gray-400 hover:text-gray-200" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {unsplashImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {unsplashImages.map((image) => (
                    <Card
                      key={image.id}
                      onClick={() => handleUnsplashImageSelect(image.id)}
                      className={`group cursor-pointer transition-all duration-200 bg-[#3A3D44FF] border-2 rounded-lg overflow-hidden hover:bg-[#4A4D54FF] p-0 
                        ${selectedUnsplashImageId === image.id ? "border-blue-500 ring-2 ring-blue-500/50" : "border-[#4A4D54FF] hover:border-gray-600"}`}
                    >
                      <CardContent className="p-0">
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={image.urls.thumb || "/placeholder.svg"}
                            alt={image.alt_description || "Background image"}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-2">
                          <div
                            className="text-xs text-gray-300 truncate"
                            title={image.alt_description || "Background image"}
                          >
                            {image.alt_description || "Background image"}
                          </div>
                          <div className="text-xs text-gray-400 mt-1 truncate">by {image.user.name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {image.width} × {image.height}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end items-center gap-4 px-6 py-4 bg-[#2D2F34FF] rounded-b-lg border-t border-[#4A4D54FF]">
          {/* Set as background checkbox */}
          {(selectedPixabayImageId || selectedUnsplashImageId || selectedTemplateImage) && (
            <div className="flex items-center space-x-3">
              <Checkbox
                id="setAsBackground"
                checked={
                  activeTab === "sample-images" 
                    ? setPixabayAsBackground 
                    : activeTab === "sample-backgrounds"
                    ? setUnsplashAsBackground
                    : setTemplateAsBackground
                }
                onCheckedChange={
                  activeTab === "sample-images"
                    ? handlePixabayBackgroundCheckboxChange
                    : activeTab === "sample-backgrounds"
                    ? handleUnsplashBackgroundCheckboxChange
                    : handleTemplateBackgroundCheckboxChange
                }
                className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
              />
              <Label htmlFor="setAsBackground" className="text-sm text-gray-400 cursor-pointer">
                Set as background
              </Label>
            </div>
          )}

          <div className="flex gap-4">
            <Button
              variant="ghost"
              onClick={handleAddSelectedImage}
              disabled={!selectedPixabayImageId && !selectedUnsplashImageId && !selectedTemplateImage}
              className={`px-3 py-2 ${selectedPixabayImageId || selectedUnsplashImageId || selectedTemplateImage
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
                }`}
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

export default SampleAssetsModal

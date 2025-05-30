import type React from "react"
import { useTool } from "@/context/tool-context"
import {
    Eraser,
    Type,
    Brush,
    Shapes,
    Crop,
    Hand,
    Waves,
    Droplet,
    File,
    Download,
    Upload,
    FileJson,
    FileImage,
    Image,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { CustomTooltip, CustomTooltipContent, CustomTooltipTrigger } from "@/components/ui/custom-tooltip"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import ColorPicker from "@/components/color-picker/color-picker"
import { useState } from "react"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { useUser } from "@/context/user-context"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"

const Header: React.FC = () => {
    const [isFileMenuOpen, setIsFileMenuOpen] = useState(false)
    const { loggedInUser } = useUser()
    const { importFile, exportFile } = useTool()

    const menus = [
        { id: "file", label: "File" },
    ]

    const handleFormatSelect = (format: string, event: React.MouseEvent) => {
        event.preventDefault()
        event.stopPropagation()
        exportFile(format.toLowerCase() as 'png' | 'jpg' | 'pdf' | 'json')
        setIsFileMenuOpen(false)
    }

    const handleOpenFile = (event: React.MouseEvent) => {
        event.preventDefault()
        event.stopPropagation()
        
        // Create file input
        const fileInput = document.createElement('input')
        fileInput.type = 'file'
        fileInput.accept = '.png,.jpg,.jpeg,.json'
        fileInput.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) {
                importFile(file)
            }
        }
        fileInput.click()
        
        setIsFileMenuOpen(false)
    }

    return (
        <div className="flex flex-col items-center space-y-1">
            {menus.map((menu) => (
                <DropdownMenu key={menu.id} open={isFileMenuOpen} onOpenChange={setIsFileMenuOpen}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className={`h-10 w-10 px-2 group text-sm hover:bg-[#383A3EFF] ${isFileMenuOpen ? "bg-[#414448FF]" : ""}`}>
                            <File className={`!w-4.5 !h-4.5 ${isFileMenuOpen ? "text-white" : "text-[#A8AAACFF] group-hover:text-white"}`} />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        side="right"
                        align="end"
                        className="ml-2 p-1 bg-[#292C31FF] border-2 border-[#44474AFF] rounded !text-gray-200 rounded-lg"
                    >
                        {menu.id === "file" && (
                            <>
                                <DropdownMenuItem
                                    className="hover:bg-[#414448FF] focus:bg-[#3F434AFF] flex items-center cursor-pointer !text-gray-200"
                                    onClick={handleOpenFile}
                                >
                                    <div className="flex items-center">
                                        <Upload className="mr-2 h-4 w-4" />
                                        <span>Open</span>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <DropdownMenuItem className="hover:bg-[#414448FF] focus:bg-[#3F434AFF] flex items-center justify-between cursor-pointer !text-gray-200">
                                            <div className="flex items-center">
                                                <Download className="mr-2 h-4 w-4" />
                                                <span>Save as</span>
                                            </div>
                                            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </DropdownMenuItem>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        side="right"
                                        align="end"
                                        className="bg-[#292C31FF] text-white ml-1 -mb-1 rounded border-2 border-[#44474AFF] rounded-lg"
                                    >
                                        <DropdownMenuItem
                                            className="!text-gray-200 hover:bg-[#414448FF] focus:bg-[#3F434AFF] cursor-pointer"
                                            onClick={(event) => handleFormatSelect('PNG', event)}
                                        >
                                            <Image className="mr-2 h-4 w-4" />
                                            <span>PNG</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="!text-gray-200 hover:bg-[#414448FF] focus:bg-[#3F434AFF] cursor-pointer"
                                            onClick={(event) => handleFormatSelect('JPG', event)}
                                        >
                                            <Image className="mr-2 h-4 w-4" />
                                            <span>JPG</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="!text-gray-200 hover:bg-[#414448FF] focus:bg-[#3F434AFF] cursor-pointer"
                                            onClick={(event) => handleFormatSelect('PDF', event)}
                                        >
                                            <FileImage className="mr-2 h-4 w-4" />
                                            <span>PDF</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="!text-gray-200 hover:bg-[#414448FF] focus:bg-[#3F434AFF] cursor-pointer"
                                            onClick={(event) => handleFormatSelect('JSON', event)}
                                        >
                                            <FileJson className="mr-2 h-4 w-4" />
                                            <span>JSON</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            ))}

            {loggedInUser && (
                <div className="flex p-1 min-h-9 min-w-9 border-none rounded-full">
                    <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
                        <img
                            src={loggedInUser.profilePictureName
                                ? `http://localhost:8080/uploads/user-avatars/${loggedInUser.profilePictureName}`
                                : undefined}
                            alt="User avatar"
                            className="h-full w-full object-cover"
                        />
                        {!loggedInUser.profilePictureName && (
                            <div className="h-full w-full bg-[#32353CFF] text-gray-200 flex items-center justify-center text-xs">
                                {loggedInUser.firstName ? loggedInUser.firstName.charAt(0).toUpperCase() : 'User'}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

// Define known shape types for checking activeElement.type
const knownShapeTypes: string[] = [
    "rectangle", "square", "rounded-rectangle", "squircle", "circle", "line",
    "triangle", "pentagon", "hexagon", "star", "heart", "arrow", "custom-image"
];

const lightenColor = (hex: string, percent: number): string => {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
        hex = hex.split('').map(s => s + s).join('');
    }

    let r = parseInt(hex.slice(0, 2), 16);
    let g = parseInt(hex.slice(2, 4), 16);
    let b = parseInt(hex.slice(4, 6), 16);

    r = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)));
    g = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)));
    b = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)));

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const Toolbar: React.FC = () => {
    const {
        activeTool,
        setActiveTool,
        activeElement,
        setActiveElement,
        color,
        setColor,
        secondaryColor,
        setSecondaryColor,
        swapColors,
        isCropping,
        setIsCropping,
        setCropRect,
        stageSize
    } = useTool()

    const [isPrimaryPickerOpen, setIsPrimaryPickerOpen] = useState(false)
    const [isSecondaryPickerOpen, setIsSecondaryPickerOpen] = useState(false)

    const tools = [
        {
            id: "brush",
            name: "Brush",
            type: "brush",
            icon: Brush,
            description: "Draw freehand lines with a brush.",
            imageUrl: "https://pixlr.com/img/tool/draw-info.jpg"
        },
        {
            id: "eraser",
            name: "Eraser",
            type: "eraser",
            icon: Eraser,
            description: "Erase parts of elements or drawings.",
            imageUrl: "https://pixlr.com/img/tool/eraser-info.jpg"
        },
        {
            id: "text",
            name: "Text",
            type: "text",
            icon: Type,
            description: "Add and edit text on the canvas.",
            imageUrl: "https://pixlr.com/img/tool/text-info.jpg"
        },
        {
            id: "shape",
            name: "Shape",
            type: "shape",
            icon: Shapes,
            description: "Draw various shapes like rectangles, circles.",
            imageUrl: "https://pixlr.com/img/tool/shape-info.jpg"
        },
        {
            id: "liquify",
            name: "Liquify",
            type: "liquify",
            icon: Waves,
            description: "Distort image areas as if they were liquid.",
            imageUrl: "https://pixlr.com/img/tool/liquify-info.jpg"
        },
        {
            id: "blur",
            name: "Blur",
            type: "blur",
            icon: Droplet,
            description: "Blur parts of the image using a brush.",
            imageUrl: "https://pixlr.com/img/tool/detail-info.jpg"
        },
        {
            id: "crop",
            name: "Crop",
            type: "crop",
            icon: Crop,
            description: "Crop the canvas to a selected area.",
            imageUrl: "https://pixlr.com/img/tool/crop-info.jpg"
        },
        {
            id: "hand",
            name: "Hand",
            type: "hand",
            icon: Hand,
            description: "Pan the canvas.",
            imageUrl: "https://pixlr.com/img/tool/hand-info.jpg"
        },
    ]

    const handleToolClick = (tool: any) => {
        if (tool.hasDropdown) {
            // For tools with dropdowns, don't change the active tool
            return;
        }

        const previousToolType = activeTool?.type;
        setActiveTool(tool)

        if (tool.type !== 'cursor' && tool.type !== 'hand') {
            setActiveElement(null);
        }

        if (tool.type === 'crop') {
            setIsCropping(true);
            if (stageSize) {
                setCropRect({ x: 0, y: 0, width: stageSize.width, height: stageSize.height });
            } else {
                setCropRect(null);
            }
        } else {
            if (isCropping && previousToolType === 'crop') {
                setIsCropping(false);
                setCropRect(null);
            }
        }
    }

    const primaryLightBorder = lightenColor(color, 50);
    const secondaryLightBorder = lightenColor(secondaryColor, 50);

    return (
        <div className="w-15 h-full bg-[#292C31FF] border-t-2 border-t-[#44474AFF] border-r-1 border-r-[#171719FF] flex flex-col items-center py-2">
            <div className="flex flex-col items-start m-0 p-0">
                <div className="space-y-1 items-center">
                    {tools.map((tool) => {
                        const Icon = tool.icon
                        const isActive = activeTool?.id === tool.id

                        return (
                            <div key={tool.id} className="relative">
                                <CustomTooltip>
                                    <CustomTooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className={`w-10 h-10 group hover:bg-[#383A3EFF] ${isActive || (tool.id === "shape" && activeElement && knownShapeTypes.includes(activeElement.type as string)) ? "bg-[#414448FF]" : ""}`}
                                            onClick={() => handleToolClick(tool)}
                                        >
                                            <Icon
                                                className={
                                                    `!w-4.5 !h-4.5 ${isActive || (tool.id === "shape" && activeElement && knownShapeTypes.includes(activeElement.type as string))
                                                        ? "text-white"
                                                        : "text-[#A8AAACFF] group-hover:text-white"}`
                                                }
                                            />
                                        </Button>
                                    </CustomTooltipTrigger>
                                    <CustomTooltipContent
                                        side="right"
                                        align="start"
                                        title={tool.name}
                                        description={tool.description}
                                        imageUrl={tool.imageUrl}
                                    >
                                    </CustomTooltipContent>
                                </CustomTooltip>
                            </div>
                        )
                    })}
                </div>

                <div className="-ml-1 pt-2 mb-5">
                    <div className="flex flex-col items-center space-y-2">
                        <div className="relative">
                            <div className="relative z-10">
                                <Popover open={isPrimaryPickerOpen} onOpenChange={setIsPrimaryPickerOpen}>
                                    <PopoverTrigger asChild>
                                        <button
                                            className="cursor-pointer w-8 h-8 p-0 border-0 rounded-full relative block"
                                            aria-label="Select primary color"
                                        >
                                            <div
                                                className="w-full h-full rounded-full border-2"
                                                style={{ backgroundColor: color, borderColor: primaryLightBorder }}
                                            />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent side="right" align="start" className="w-auto p-0 bg-transparent border-0 shadow-none">
                                        <ColorPicker color={color} setColor={setColor} onClose={() => setIsPrimaryPickerOpen(false)} />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="absolute -bottom-4 -right-3 z-0">
                                <Popover open={isSecondaryPickerOpen} onOpenChange={setIsSecondaryPickerOpen}>
                                    <PopoverTrigger asChild>
                                        <button
                                            className="cursor-pointer w-8 h-8 p-0 border-0 rounded-full relative block"
                                            aria-label="Select secondary color"
                                        >
                                            <div
                                                className="w-full h-full rounded-full border-2"
                                                style={{ backgroundColor: secondaryColor, borderColor: secondaryLightBorder }}
                                            />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent side="right" align="start" className="w-auto p-0 border-0 bg-transparent shadow-none">
                                        <ColorPicker color={secondaryColor} setColor={setSecondaryColor} onClose={() => setIsSecondaryPickerOpen(false)} />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="absolute top-0 right-0 transform translate-x-4.5 -translate-y-1/5">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="w-5 h-5 p-0 flex items-center justify-center rounded-none border-0 hover:bg-transparent bg-transparent"
                                            onClick={swapColors}
                                        >
                                            <svg
                                                width="18"
                                                height="18"
                                                viewBox="0 0 15 15"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                                stroke="#ffffff"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                transform="rotate(45)"
                                            >
                                                <path d="M2 7.5 Q7.5 1 13 7.5" />
                                                <polyline points="3 4 2 7.5 4 8.5" />
                                                <polyline points="12 4 13 7.5 11 8.5" />
                                            </svg>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        side="right"
                                        align="start"
                                    >
                                        <p>Swap colors</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-end mt-auto mb-2">
                <Header />
            </div>
        </div>
    )
}

export default Toolbar

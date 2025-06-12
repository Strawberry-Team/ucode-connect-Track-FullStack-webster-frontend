import type React from "react"
import { useTool } from "@/context/tool-context"
import { useElementsManager } from "@/context/elements-manager-context"
import {
    Download,
    Upload,
    FileJson,
    FileImage,
    Image,
    FolderOpen,
    Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useUser } from "@/context/user-context"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip" // Import Tooltip components

const FileOptions: React.FC = () => {
    const [isFileMenuOpen, setIsFileMenuOpen] = useState(false)
    const { loggedInUser } = useUser()
    const { importFile, exportFile, setSelectedLineId } = useTool()
    const elementsManager = useElementsManager()

    const menus = [
        { id: "file", label: "File" },
    ]

    // Function to clear all selected objects
    const clearAllSelections = () => {
        elementsManager.setSelectedElementId(null)
        setSelectedLineId(null)
        // Force immediate re-render to ensure UI updates
        setTimeout(() => {
            // This ensures the selections are cleared in the UI
        }, 0)
    }

    // Handle menu open/close and clear selections when opening
    const handleMenuOpenChange = (open: boolean) => {
        if (open) {
            // Clear selections immediately when menu opens
            elementsManager.setSelectedElementId(null)
            setSelectedLineId(null)
        }
        setIsFileMenuOpen(open)
    }

    const handleFormatSelect = (format: string, event: React.MouseEvent) => {
        event.preventDefault()
        event.stopPropagation()
        // Clear all selections before export
        clearAllSelections()
        setIsFileMenuOpen(false)
        // Longer delay to ensure selections are completely cleared and UI updated before export starts
        setTimeout(() => {
            exportFile(format.toLowerCase() as 'png' | 'jpg' | 'pdf' | 'json' | 'webp' | 'svg')
        }, 150)
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
        <TooltipProvider>
            <div className="flex flex-col items-center justify-center space-y-1">
                {menus.map((menu) => (
                    <DropdownMenu key={menu.id} open={isFileMenuOpen} onOpenChange={handleMenuOpenChange}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className={`h-10 w-10 px-2 group text-sm hover:bg-[#383A3EFF] ${isFileMenuOpen ? "bg-[#414448FF]" : ""}`}>
                                        <FolderOpen className={`!w-4.5 !h-4.5 ${isFileMenuOpen ? "text-white" : "text-[#A8AAACFF] group-hover:text-white"}`} />
                                    </Button>
                                </DropdownMenuTrigger>
                            </TooltipTrigger>
                            <TooltipContent side="right" align="center">
                                <p>Import or Export File</p>
                            </TooltipContent>
                        </Tooltip>
                        <DropdownMenuContent
                            side="right"
                            align="end"
                            className="ml-2 mb-7 p-1 bg-[#292C31FF] border-2 border-[#44474AFF] rounded !text-gray-200 rounded-lg"
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
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="w-full flex items-center">
                                                        <DropdownMenuItem
                                                            className="!text-gray-200 hover:bg-[#414448FF] focus:bg-[#3F434AFF] cursor-pointer w-full"
                                                            onClick={(event) => handleFormatSelect('WEBP', event)}
                                                            disabled={!loggedInUser}
                                                        >
                                                            <Image className="mr-2 h-4 w-4" />
                                                            <span>WEBP</span>
                                                        </DropdownMenuItem>
                                                        <span className="inline-flex items-center px-1 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm border border-blue-400/20 ml-auto mr-2">
                                                            <Zap className="w-4 h-4 !text-white" />
                                                        </span>
                                                    </div>
                                                </TooltipTrigger>
                                                {!loggedInUser && (
                                                    <TooltipContent side="right" align="center">
                                                        <p>Sign in to export in this format</p>
                                                    </TooltipContent>
                                                )}
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="w-full flex items-center">
                                                        <DropdownMenuItem
                                                            className="!text-gray-200 hover:bg-[#414448FF] focus:bg-[#3F434AFF] cursor-pointer w-full"
                                                            onClick={(event) => handleFormatSelect('SVG', event)}
                                                            disabled={!loggedInUser}
                                                        >
                                                            <FileImage className="mr-2 h-4 w-4" />
                                                            <span>SVG</span>
                                                        </DropdownMenuItem>
                                                        <span className="inline-flex items-center px-1 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm border border-blue-400/20 ml-auto mr-2">
                                                            <Zap className="w-4 h-4 !text-white" />
                                                        </span>
                                                    </div>
                                                </TooltipTrigger>
                                                {!loggedInUser && (
                                                    <TooltipContent side="right" align="center">
                                                        <p>Sign in to export in this format</p>
                                                    </TooltipContent>
                                                )}
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="w-full flex items-center">
                                                        <DropdownMenuItem
                                                            className="!text-gray-200 hover:bg-[#414448FF] focus:bg-[#3F434AFF] cursor-pointer"
                                                            onClick={(event) => handleFormatSelect('PDF', event)}
                                                            disabled={!loggedInUser}
                                                        >
                                                            <FileImage className="mr-2 h-4 w-4" />
                                                            <span>PDF</span>
                                                        </DropdownMenuItem>
                                                        <span className="inline-flex items-center px-1 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm border border-blue-400/20 ml-auto mr-2">
                                                            <Zap className="w-4 h-4 !text-white" />
                                                        </span>
                                                    </div>
                                                </TooltipTrigger>
                                                {!loggedInUser && (
                                                    <TooltipContent side="right" align="center">
                                                        <p>Sign in to export in this format</p>
                                                    </TooltipContent>
                                                )}
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="w-full flex items-center">
                                                        <DropdownMenuItem
                                                            className="!text-gray-200 hover:bg-[#414448FF] focus:bg-[#3F434AFF] cursor-pointer w-full"
                                                            onClick={(event) => handleFormatSelect('JSON', event)}
                                                            disabled={!loggedInUser}
                                                        >
                                                            <FileJson className="mr-2 h-4 w-4" />
                                                            <span>JSON</span>
                                                        </DropdownMenuItem>
                                                        <span className="inline-flex items-center px-1 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm border border-blue-400/20 ml-auto mr-2">
                                                            <Zap className="w-4 h-4 !text-white" />
                                                        </span>
                                                    </div>
                                                </TooltipTrigger>
                                                {!loggedInUser && (
                                                    <TooltipContent side="right" align="center">
                                                        <p>Sign in to export in this format</p>
                                                    </TooltipContent>
                                                )}
                                            </Tooltip>
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
        </TooltipProvider>
    )
}

export default FileOptions
import type React from "react"
import { useTool } from "@/context/tool-context"
import {
    Download,
    Upload,
    FileJson,
    FileImage,
    Image,
    FolderOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
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
                            <FolderOpen className={`!w-4.5 !h-4.5 ${isFileMenuOpen ? "text-white" : "text-[#A8AAACFF] group-hover:text-white"}`} />
                        </Button>
                    </DropdownMenuTrigger>
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

export default Header
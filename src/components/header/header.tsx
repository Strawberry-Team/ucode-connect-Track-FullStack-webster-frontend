import type React from "react"
import { useState } from "react"
import { Save, FileUp, FileDown, Undo, Redo, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useUser } from "@/context/user-context"

const Header: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const { loggedInUser, logoutUserContext } = useUser()

  const menus = [
    { id: "file", label: "File" },
    { id: "edit", label: "Edit" },
    { id: "image", label: "Image" },
    { id: "view", label: "View" },
    { id: "window", label: "Window" },
    { id: "help", label: "Help" },
  ]

  return (
    <header className="bg-[#202225FF] border-b-2 border-[#44474AFF] flex flex-col">
      <div className="flex items-center justify-between px-2 h-10">
        <div className="flex items-center space-x-1">
          {menus.map((menu) => (
            <DropdownMenu key={menu.id}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-7 px-2 text-sm hover:bg-[#3a3a3a]">
                  {menu.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#2a2a2a] border-[#1a1a1a] text-gray-200">
                {menu.id === "file" && (
                  <>
                    <DropdownMenuItem className="hover:bg-[#3a3a3a]">
                      <FileUp className="mr-2 h-4 w-4" />
                      <span>Open</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-[#3a3a3a]">
                      <Save className="mr-2 h-4 w-4" />
                      <span>Save</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-[#3a3a3a]">
                      <FileDown className="mr-2 h-4 w-4" />
                      <span>Export</span>
                    </DropdownMenuItem>
                  </>
                )}
                {menu.id === "edit" && (
                  <>
                    <DropdownMenuItem className="hover:bg-[#3a3a3a]">
                      <Undo className="mr-2 h-4 w-4" />
                      <span>Undo</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-[#3a3a3a]">
                      <Redo className="mr-2 h-4 w-4" />
                      <span>Redo</span>
                    </DropdownMenuItem>
                  </>
                )}
                {menu.id === "help" && (
                  <>
                    <DropdownMenuItem className="hover:bg-[#3a3a3a]">
                      <HelpCircle className="mr-2 h-4 w-4" />
                      <span>About</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </div>
        
        {loggedInUser && (
          <div className="flex items-center space-x-2 -mr-2 py-1 h-8 border-1 border-[#44474AFF] rounded-full">
            <div className="h-8 w-8 rounded-full overflow-hidden  flex-shrink-0">
              <img 
                src={loggedInUser.profilePictureName 
                  ? `http://localhost:8080/uploads/user-avatars/${loggedInUser.profilePictureName}` 
                  : undefined} 
                alt="User avatar" 
                className="h-full w-full object-cover"
              />
              {!loggedInUser.profilePictureName && (
                <div className="h-full w-full bg-[#32353CFF] text-gray-200 flex items-center justify-center text-xs">
                  {loggedInUser.firstName ? loggedInUser.firstName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
            <span className="mr-3 text-sm font-medium text-gray-200 truncate max-w-[100px]">
              {loggedInUser.firstName} {loggedInUser.lastName}
            </span>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header

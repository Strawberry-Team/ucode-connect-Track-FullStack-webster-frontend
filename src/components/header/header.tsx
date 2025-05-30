import type React from "react"
import { useState } from "react"
import { Save, FileUp, FileDown, Undo, Redo, HelpCircle, Brush, Eraser, Text, Shapes, Waves, Type, Droplet, Crop, Hand } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useUser } from "@/context/user-context"

const Header: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const { loggedInUser, logoutUserContext } = useUser()

  const menus = [
    { id: "file", label: "File" },
  ]

  return (
    <header className="bg-[#202225FF] border-b-2 border-[#44474AFF] flex flex-col">
      <div className="flex items-center justify-between px-5 h-10">
        <div className="flex items-center space-x-6">
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
                    {/* <DropdownMenuItem className="hover:bg-[#3a3a3a]">
                      <FileUp className="mr-2 h-4 w-4" />
                      <span>Import</span>
                    </DropdownMenuItem> */}
                    <DropdownMenuItem className="hover:bg-[#3a3a3a]">
                      <FileUp className="mr-2 h-4 w-4" />
                      <span>Open</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-[#3a3a3a]">
                      <Save className="mr-2 h-4 w-4" />
                      <span>Save as</span>
                    </DropdownMenuItem>
                    {/* <DropdownMenuItem className="hover:bg-[#3a3a3a]">
                      <FileDown className="mr-2 h-4 w-4" />
                      <span>Export</span>
                    </DropdownMenuItem> */}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </div>
        
        {loggedInUser && (
          <div className="flex items-center space-x-3 -mr-2 py-1 min-h-9 min-w-9 border-none border-[#44474AFF] rounded-full hover:bg-[#3a3a3a]">
            <div className="h-9 w-9 rounded-full overflow-hidden flex-shrink-0">
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
            <div className="mr-3 text-sm font-medium text-gray-200 truncate max-w-[100px] flex items-left space-x-1">
              <span>{loggedInUser.firstName}</span>
              <span>{loggedInUser.lastName}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header

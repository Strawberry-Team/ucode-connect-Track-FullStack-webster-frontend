import type React from "react"
import { useState } from "react"
import { Save, FileUp, FileDown, Undo, Redo, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const Header: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const menus = [
    { id: "file", label: "File" },
    { id: "edit", label: "Edit" },
    { id: "image", label: "Image" },
    { id: "layer", label: "Layer" },
    { id: "select", label: "Select" },
    { id: "filter", label: "Filter" },
    { id: "view", label: "View" },
    { id: "window", label: "Window" },
    { id: "help", label: "Help" },
  ]

  return (
    <header className="bg-[#2a2a2a] border-b border-[#1a1a1a] flex flex-col">
      <div className="flex items-center px-2 h-9">
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
      </div>
    </header>
  )
}

export default Header

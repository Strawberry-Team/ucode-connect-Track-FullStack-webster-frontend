import React from "react"
import { useTool } from "@/context/tool-context"
import { House, UserCog, LogOut, LayoutGrid, Menu } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useUser } from "@/context/user-context"
import { 
  BrushOptions, 
  EraserOptions, 
  ShapeOptions, 
  TextOptions,
  CropOptions,
  HandOptions,
  LiquifyOptions,
  BlurOptions
} from "./option-panels"

const BASE_AVATAR_URL = 'http://localhost:8080/uploads/user-avatars/'

const PropertiesPanel: React.FC = () => {
  const { activeTool } = useTool()
  const navigate = useNavigate()
  const location = useLocation()
  const { loggedInUser, logoutUserContext } = useUser()

  const handleNavigateHome = () => {
    navigate('/')
  }

  const handleLogout = () => {
    if (logoutUserContext) {
      logoutUserContext()
    }
    navigate('/')
  }

  const renderToolOptions = () => {
    switch (activeTool?.id) {
      case "brush":
        return <BrushOptions />
      case "eraser":
        return <EraserOptions />
      case "text":
        return <TextOptions />
      case "shape":
        return <ShapeOptions />
      case "crop":
        return <CropOptions />
      case "hand":
        return <HandOptions />
      case "liquify":
        return <LiquifyOptions />
      case "blur":
        return <BlurOptions />
      default:
        return null
    }
  };

  const userImageUrl = loggedInUser?.profilePictureName
    ? `${BASE_AVATAR_URL}${loggedInUser.profilePictureName}`
    : undefined;

  const userFallbackText = loggedInUser?.firstName
    ? loggedInUser.firstName.charAt(0).toUpperCase()
    : loggedInUser?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="h-12 w-full bg-[#292C31FF] p-2 ">
      <div className="flex justify-between items-center">
      <div className="flex items-center">
        {loggedInUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Menu
                className="cursor-pointer !w-5 !h-5 ml-2.5 text-[#A8AAACFF] hover:text-white focus:outline-none"
              
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-64 bg-[#2C2F34FF] border-2 border-[#4A4D54FF] text-gray-200 rounded-lg shadow-xl" 
              side="bottom" 
              align="start" 
              sideOffset={10}
            >
              <DropdownMenuLabel className="font-normal px-3 py-2">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-9 w-9 rounded-full border border-gray-600">
                    {userImageUrl && <AvatarImage src={userImageUrl} alt={`${loggedInUser.firstName || ''} ${loggedInUser.lastName || ''} avatar`} />}
                    <AvatarFallback className="rounded-full bg-gray-700 text-gray-200 text-sm">
                      {userFallbackText}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-gray-50">
                      {loggedInUser.firstName} {loggedInUser.lastName}
                    </p>
                    <p className="text-xs leading-none text-gray-400">
                      {loggedInUser.email}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="px-6 bg-[#4A4D54FF]" />
              <DropdownMenuItem
                onClick={() => navigate('/profile')}
                className="cursor-pointer hover:bg-[#3A3D44FF] focus:bg-[#3A3D44FF] rounded-md m-1 text-gray-200 hover:text-white focus:text-white"
              >
                <UserCog className="mr-2 !h-4.5 !w-4.5" />
                <span>Profile</span>
              </DropdownMenuItem>

              {location.pathname === '/canvas' && (
                <DropdownMenuItem
                  onClick={handleNavigateHome}
                  className="cursor-pointer hover:bg-[#3A3D44FF] focus:bg-[#3A3D44FF] rounded-md m-1 text-gray-200 hover:text-white focus:text-white"
                >
                  <LayoutGrid className="mr-2 !h-4.5 !w-4.5" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator className="bg-[#4A4D54FF]" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer hover:bg-[#3A3D44FF] focus:bg-[#3A3D44FF] rounded-md m-1 text-red-400 hover:text-red-300 focus:text-red-300"
              >
                <LogOut className="mr-2 !h-4.5 !w-4.5" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <House
            className="cursor-pointer !w-5 !h-5 ml-2.5 text-[#A8AAACFF] hover:text-white "
            onClick={handleNavigateHome}
          
          />
        )}
        <div className="border-l-2 border-[#44474AFF] h-8 mx-5"></div>
        <div className="flex-1 min-w-0">{renderToolOptions()}</div>
      </div>
      </div>
    </div>
  )
}

export default PropertiesPanel

import React from 'react';
import { LogOut, UserCog } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { User } from '@/types/auth';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/lib/axios-instance';

interface UserMenuDropdownProps {
  user: User;
  onLogout: () => void;
}

const BASE_AVATAR_URL = `${API_BASE_URL}/uploads/user-avatars/`;

export const UserMenuDropdown: React.FC<UserMenuDropdownProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const imageUrl = user.profilePictureName 
    ? `${BASE_AVATAR_URL}${user.profilePictureName}`
    : undefined;

  const fallbackText = user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className="cursor-pointer w-12 h-12 rounded-full flex items-center justify-center bg-[#32353CFF] text-blue-400 hover:bg-[#3A3D44FF] hover:text-blue-300 focus:outline-none data-[state=open]:ring-2 data-[state=open]:ring-blue-500 data-[state=open]:ring-offset-2 data-[state=open]:ring-offset-[#25282CFF] border border-gray-600 data-[state=open]:border-gray-600 shadow-md overflow-hidden relative"
          aria-label="User menu"
        >
          <Avatar className="h-10 w-10 rounded-full">
            {imageUrl && <AvatarImage src={imageUrl} alt={`${user.firstName} ${user.lastName}`} />}
            <AvatarFallback className="rounded-full bg-gray-700 text-gray-200">
              {fallbackText}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-auto bg-[#2C2F34FF] border-[#4A4D54FF] text-gray-200 rounded-lg shadow-xl" align="start" side="left" sideOffset={8}>
      <DropdownMenuLabel className="font-normal px-3 py-2">
          <div className="flex items-center space-x-3 ">
            <Avatar className="h-9 w-9 rounded-full border border-gray-600">
              {imageUrl && <AvatarImage src={imageUrl} alt={`${user.firstName} ${user.lastName} avatar`} />}
              <AvatarFallback className="rounded-full bg-gray-700 text-gray-200 text-sm">
                {fallbackText}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none text-gray-50">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs leading-none text-gray-400">
                {user.email}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#4A4D54FF]" />
        
        <DropdownMenuItem 
          onClick={() => navigate('/profile')} 
          className="cursor-pointer hover:bg-[#3A3D44FF] focus:bg-[#3A3D44FF] rounded-md m-1 text-gray-200 hover:text-white focus:text-white"
        >
          <UserCog className="mr-2 !h-4.5 !w-4.5" />
          <span>Profile</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={onLogout} className="cursor-pointer hover:bg-[#3A3D44FF] focus:bg-[#3A3D44FF] rounded-md m-1 text-red-400 hover:text-red-300 focus:text-red-300">
          <LogOut className="mr-2 !h-4.5 !w-4.5" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 
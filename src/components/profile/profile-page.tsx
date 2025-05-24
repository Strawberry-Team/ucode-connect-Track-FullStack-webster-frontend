import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/user-context';
import { updateUserProfile, uploadUserAvatar, getCurrentAuthenticatedUser } from '@/services/user-service';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Save, Camera, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

const BASE_AVATAR_URL = 'http://localhost:8080/uploads/user-avatars/';

const ProfilePage: React.FC = () => {
  const { loggedInUser, loginUserContext } = useUser();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    profilePicture: null as File | null,
  });
  
  const [formErrors, setFormErrors] = useState({
    firstName: '',
    lastName: '',
  });
  
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (loggedInUser) {
          setFormData({
            firstName: loggedInUser.firstName || '',
            lastName: loggedInUser.lastName || '',
            profilePicture: null,
          });
          setIsLoading(false);
          setAuthChecked(true);
          return;
        }
        
        const user = await getCurrentAuthenticatedUser();
        
        if (user) {
          loginUserContext(user);
          setFormData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            profilePicture: null,
          });
          setIsLoading(false);
          setAuthChecked(true);
        } else {
          setAuthChecked(true);
          setIsLoading(false);
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setAuthChecked(true);
        setIsLoading(false);
        navigate('/', { replace: true });
      }
    };
    
    checkAuth();
  }, [loggedInUser, loginUserContext, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Basic validation
    if (name === 'firstName' && !value.trim()) {
      setFormErrors(prev => ({ ...prev, firstName: 'First name is required' }));
    } else if (name === 'firstName') {
      setFormErrors(prev => ({ ...prev, firstName: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type', { description: 'Please upload an image file.' });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', { description: 'Please upload an image smaller than 5MB.' });
      return;
    }
    
    setFormData(prev => ({ ...prev, profilePicture: file }));
    
    // Create preview URL
    const filePreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(filePreviewUrl);
  };

  const handleCancel = () => {
    // Reset form data to current user data
    if (loggedInUser) {
      setFormData({
        firstName: loggedInUser.firstName || '',
        lastName: loggedInUser.lastName || '',
        profilePicture: null,
      });
    }
    
    // Clear any form errors
    setFormErrors({
      firstName: '',
      lastName: '',
    });
    
    // Clear preview URL if it exists
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    
    // Exit edit mode
    setEditMode(false);
  };

  const handleSave = async () => {
    // Validate form data
    if (!formData.firstName.trim()) {
      setFormErrors(prev => ({ ...prev, firstName: 'First name is required' }));
      toast.error('Validation error', { description: 'First name is required.' });
      return;
    }
    
    if (!loggedInUser) return;
    
    let updatedUser = { ...loggedInUser };
    
    // Only make API call if data has changed
    if (formData.firstName !== loggedInUser.firstName || formData.lastName !== loggedInUser.lastName) {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName ? formData.lastName : null
      };
      
      const result = await updateUserProfile(loggedInUser.id, updateData);
      
      if (!result.success || !result.data) {
        const errorMessage = result.errors?.join(', ') || 'Failed to update profile';
        toast.error('Update failed', { description: errorMessage });
        return;
      }
      
      updatedUser = result.data;
    }
    
    // Handle avatar upload if a new file was selected
    if (formData.profilePicture) {
      setAvatarLoading(true);
      const avatarResult = await uploadUserAvatar(loggedInUser.id, formData.profilePicture);
      
      if (!avatarResult.success || !avatarResult.data) {
        setAvatarLoading(false);
        const errorMessage = avatarResult.errors?.join(', ') || 'Failed to upload avatar';
        toast.error('Avatar upload failed', { description: errorMessage });
        return;
      }
      
      updatedUser.profilePictureName = avatarResult.data.server_filename;
      
      const img = new Image();
      img.onload = () => {
        loginUserContext(updatedUser);
        setAvatarLoading(false);
        
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
        
        setEditMode(false);
        toast.success('Profile updated', { description: 'Your profile has been updated successfully.' });
      };
      
      img.onerror = () => {
        loginUserContext(updatedUser);
        setAvatarLoading(false);
        
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
        
        setEditMode(false);
        toast.success('Profile updated', { description: 'Your profile has been updated successfully.' });
      };
      
      img.src = `${BASE_AVATAR_URL}${avatarResult.data.server_filename}`;
    } else {
      loginUserContext(updatedUser);
      
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      
      setEditMode(false);
      toast.success('Profile updated', { description: 'Your profile has been updated successfully.' });
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#292C31FF] text-gray-200 p-8 flex flex-col items-center">
        <div className="w-[500px] max-w-3xl">
          <Button 
            variant="ghost" 
            className="mb-6 text-gray-400 hover:text-white hover:bg-[#353840FF]"
            onClick={handleBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <Card className="w-full h-[550px] max-w-3xl bg-[#25282CFF] border-2 border-[#44474AFF] shadow-xl flex flex-col">
            <CardContent className="p-8 flex-1 flex items-center justify-center">
              <div className="text-center text-gray-400">
                Loading profile...
              </div>
            </CardContent>
            <CardFooter className="p-6">
              <Button 
                disabled
                className="w-full h-10 rounded-full bg-blue-500/50 text-white font-semibold"
              >
                Edit Profile
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  if (authChecked && !loggedInUser) return null;

  // Get avatar URL (either from preview or user data)
  const avatarUrl = previewUrl || 
    (loggedInUser?.profilePictureName 
      ? `${BASE_AVATAR_URL}${loggedInUser.profilePictureName}`
      : undefined);
  
  // Get fallback text for avatar
  const fallbackText = loggedInUser?.firstName 
    ? loggedInUser.firstName.charAt(0).toUpperCase() 
    : 'U';

  return (
    <div className="min-h-screen bg-[#292C31FF] text-gray-200 p-8 flex flex-col justify-center items-center">
      <div className="w-[500px] max-w-3xl">
        <Button 
          variant="ghost" 
          className="p-2 px-4 mb-6 text-gray-400 hover:text-white hover:bg-[#353840FF]"
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <Card className="w-full h-[550px] max-w-3xl bg-[#25282CFF] border-2 border-[#44474AFF] shadow-xl flex flex-col">
          <CardContent className="p-6 flex-1">
            <div className="flex flex-col items-center gap-6">
              {/* Avatar with upload option */}
              <div className="relative group">
                <Avatar className="h-55 w-55 border-4 border-[#44474AFF]">
                  {!avatarLoading && avatarUrl && (
                    <AvatarImage 
                      src={avatarUrl} 
                      alt={`${loggedInUser?.firstName || ''} ${loggedInUser?.lastName || ''}`}
                      className={editMode ? "group-hover:opacity-70 transition-opacity duration-200" : ""}
                    />
                  )}
                  <AvatarFallback className="bg-[#3A3D44FF] text-white text-6xl">
                    {fallbackText}
                  </AvatarFallback>
                </Avatar>
                
                {editMode && (
                  <>
                    <input
                      id="profilePicture"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      onClick={() => document.getElementById('profilePicture')?.click()}
                      className="cursor-pointer absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full"
                      aria-label="Change profile picture"
                    >
                      <Camera className="h-12 w-12 text-white drop-shadow-lg" strokeWidth={1.5} />
                    </button>
                  </>
                )}
              </div>
              
              {/* User information */}
              {editMode ? (
                <div className="w-full max-w-md space-y-4 mx-auto mt-7 px-20 ">
                  <div className="text-center">
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`bg-[#32353CFF] border-[#44474AFF] focus:border-blue-500 focus:ring-blue-500 text-white text-center ${
                        formErrors.firstName ? 'border-red-500' : ''
                      }`}
                      placeholder="Enter your first name"
                    />
                  </div>
                  
                  <div className="text-center">
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="bg-[#32353CFF] border-[#44474AFF] focus:border-blue-500 focus:ring-blue-500 text-white text-center"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <h1 className="text-3xl font-medium text-white">
                    {loggedInUser?.firstName} {loggedInUser?.lastName}
                  </h1>
                  <p className="text-gray-400 text-lg">{loggedInUser?.email}</p>
                  <div className="flex items-center justify-center space-x-2 text-[#A7A8AAFF]">
                    <span className="px-3 py-1 text-sm bg-[#3A3D44FF] rounded-full">
                      {loggedInUser?.role}
                    </span>
                    <span className="px-3 py-1 text-sm bg-[#3A3D44FF] rounded-full">
                      Joined {format(new Date(loggedInUser?.createdAt || ''), 'MMMM d, yyyy')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="p-6">
            {editMode ? (
              <div className="flex w-full gap-4">
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  className="flex-1 h-10 rounded-full bg-transparent border-2 border-[#414448FF] hover:bg-[#303237FF] text-[#A7A8AAFF] hover:text-white font-semibold"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  className="flex-1 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold"
                  disabled={!formData.firstName.trim() || avatarLoading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => setEditMode(true)}
                className="w-full h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold"
              >
                Edit Profile
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage; 
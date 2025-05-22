import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTool } from '@/context/tool-context';
import CreateProjectModal from './create-project-modal.tsx';
import AuthContainer from '../auth/auth-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ImageUp, Plus, User, X, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserMenuDropdown } from './user-menu-dropdown';
import { useUser } from '@/context/user-context';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { getCurrentAuthenticatedUser } from '@/services/user-service';
import type { User as AuthUser } from '@/types/auth';

const DashboardPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthVisible, setIsAuthVisible] = useState(false);
  const { loggedInUser, isLoadingAuth, loginUserContext, logoutUserContext } = useUser();
  const navigate = useNavigate();
  const {
    setStageSize,
    setIsCanvasManuallyResized,
    setInitialImage,
    setRenderableObjects,
    setActiveTool,
    setActiveElement,
    setColor,
    setSecondaryColor,
    setBrushSize,
    setEraserSize,
    setOpacity,
    setEraserOpacity,
    setEraserHardness,
    setZoom,
    setBrushMirrorMode,
    setEraserMirrorMode,
    setCursorPositionOnCanvas,
    addHistoryEntry,
    setIsAddModeActive,
    setCurrentAddToolType,
    setStagePosition,
    setLastDrawingEndTime,
    setTextColor,
    setTextBgColor,
    setTextBgOpacity,
    setFontSize,
    setFontFamily,
    setFontStyles,
    setTextCase,
    setTextAlignment,
    setLineHeight,
    setBackgroundColor,
    setBackgroundOpacity,
    setTextColorOpacity,
    setFillColor,
    setFillColorOpacity,
    setBorderColor,
    setBorderWidth,
    setBorderStyle,
    setBorderColorOpacity,
    setCornerRadius,
    setShapeType,
    setShapeTransform,
    setLiquifyBrushSize,
    setLiquifyStrength,
    setLiquifyMode,
    setIsImageReadyForLiquify,
    setBlurBrushSize,
    setBlurStrength
  } = useTool();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const processAuthTokens = async () => {
      const params = new URLSearchParams(window.location.search);
      const accessToken = params.get('accessToken');
      const refreshToken = params.get('refreshToken');

      if (accessToken && refreshToken) {
        Cookies.set('accessToken', accessToken, { expires: 1, path: '/', sameSite: 'lax' });
        Cookies.set('refreshToken', refreshToken, { expires: 7, path: '/', sameSite: 'lax' });
        
        window.history.replaceState(null, '', window.location.pathname);

        try {
          const user = await getCurrentAuthenticatedUser();
          if (user) {
            loginUserContext(user as AuthUser);
            setIsAuthVisible(false); 
            toast.success("Logged In", { description: "Successfully authenticated via Google.", duration: 3000 });
          } else {
            toast.error("Authentication Failed", { description: "Could not verify Google session.", duration: 3000 });
            Cookies.remove('accessToken', { path: '/' });
            Cookies.remove('refreshToken', { path: '/' });
          }
        } catch (error) {
          console.error("Error fetching user after Google login:", error);
          toast.error("Authentication Error", { description: "An error occurred while authenticating.", duration: 3000 });
          Cookies.remove('accessToken', { path: '/' });
          Cookies.remove('refreshToken', { path: '/' });
        }
      }
    };

    if (!loggedInUser && !isLoadingAuth) {
      processAuthTokens();
    }
  }, [isLoadingAuth, loggedInUser, loginUserContext]);

  const resetAllToolSettings = () => {
    setActiveTool(null);
    setActiveElement(null);

    setColor("#000000");
    setSecondaryColor("#ffffff");
    setBrushSize(20);
    setEraserSize(20);
    setOpacity(100);
    setEraserOpacity(100);
    setEraserHardness(100);
    setZoom(100);
    setBrushMirrorMode("None");
    setEraserMirrorMode("None");

    setCursorPositionOnCanvas(null);

    const emptyObjects: never[] = [];
    setRenderableObjects(emptyObjects);
    addHistoryEntry({
      type: 'unknown',
      description: 'Новый проект',
      linesSnapshot: emptyObjects
    });

    setIsAddModeActive(false);
    setCurrentAddToolType(null);

    setStagePosition({ x: 0, y: 0 });
    setLastDrawingEndTime(null);

    setTextColor("#000000");
    setTextBgColor("transparent");
    setTextBgOpacity(100);
    setFontSize(16);
    setFontFamily("Arial");
    setFontStyles({
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false
    });
    setTextCase("none");
    setTextAlignment("center");
    setLineHeight(1);
    setBackgroundColor("transparent");
    setBackgroundOpacity(100);
    setTextColorOpacity(100);

    setFillColor("#ffffff");
    setFillColorOpacity(100);
    setBorderColor("#000000");
    setBorderWidth(2);
    setBorderStyle("solid");
    setBorderColorOpacity(100);
    setCornerRadius(0);
    setShapeType("rectangle");
    setShapeTransform({
      rotate: 0,
      scaleX: 1,
      scaleY: 1
    });

    setLiquifyBrushSize(20);
    setLiquifyStrength(50);
    setLiquifyMode("push");
    setIsImageReadyForLiquify(false);

    setBlurBrushSize(20);
    setBlurStrength(20);
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const toggleAuthVisibility = () => {
    if (!loggedInUser) {
      setIsAuthVisible(!isAuthVisible);
      console.log("Toggling auth visibility to:", !isAuthVisible);
    }
  };

  const handleCreateNewProject = (name: string, width: number, height: number) => {
    resetAllToolSettings();
    setInitialImage(null);
    setStageSize({ width, height });
    setIsCanvasManuallyResized(true);
    navigate('/canvas');
  };

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          resetAllToolSettings();
          setInitialImage({ src: img.src, width: img.naturalWidth, height: img.naturalHeight, file });
          setStageSize({ width: img.naturalWidth, height: img.naturalHeight });
          setIsCanvasManuallyResized(true);
          navigate('/canvas');
        };
        img.onerror = () => {
          console.error("Error loading image for size determination.");
        };
        if (e.target?.result) {
          img.src = e.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleAuthSuccess = (user: import('@/types/auth').User) => {
    console.log('Пользователь успешно авторизован в DashboardPage, обновляем контекст:', user);
    loginUserContext(user);
    setIsAuthVisible(false);
  };

  const handleLogout = () => {
    logoutUserContext();
    setIsAuthVisible(false);
    toast.success("Logged Out", { description: "You have been successfully logged out.", duration: 3000 });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#292C31FF] text-gray-200 p-6">
      <div className="w-full max-w-lg">
        <motion.div
          className="flex flex-col items-center justify-center relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <Card className={`w-full max-w-md bg-[#25282CFF] border-2 border-dashed border-gray-600 shadow-xl relative overflow-hidden transition-opacity duration-300 ${isLoadingAuth ? 'opacity-75' : 'opacity-100'}`}>
            {isLoadingAuth && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#25282CFF] bg-opacity-50 z-20 rounded-lg">
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
              </div>
            )}
            <div className={`relative z-10 ${isLoadingAuth ? 'pointer-events-none' : ''}`}>
              <div className="absolute -top-3 right-3 z-10">
                {loggedInUser ? (
                  <UserMenuDropdown user={loggedInUser} onLogout={handleLogout} />
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleAuthVisibility}
                    className="cursor-pointer w-12 h-12 rounded-full flex items-center justify-center bg-[#32353CFF] text-blue-400 hover:bg-[#3A3D44FF] hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#25282CFF] border border-gray-600 shadow-md overflow-hidden relative"
                    aria-label={isAuthVisible ? "Close authentication" : "Open authentication"}
                    disabled={isLoadingAuth}
                  >
                    <motion.div
                      animate={isAuthVisible ? { rotate: 180, y: 0 } : { rotate: 0, y: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      {isAuthVisible ? <X size={25} /> : <User size={25} />}
                    </motion.div>
                  </motion.button>
                )}
              </div>

              <CardContent className="p-0 flex items-stretch">
                <div className="relative overflow-hidden" style={{ height: '380px' }}>
                  <motion.div
                    className="flex flex-row w-[200%] h-full"
                    animate={{
                      x: isAuthVisible && !loggedInUser ? "-50%" : "0%"
                    }}
                    transition={{
                      type: "spring", stiffness: 100, damping: 20, mass: 1.2,
                      restDelta: 0.001, restSpeed: 0.001
                    }}
                  >
                    <div className="w-1/2 h-full flex items-center justify-center">
                      <motion.div
                        className="flex flex-col items-center text-center px-8 w-full"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: isAuthVisible && !loggedInUser ? 0 : 1 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <ImageUp size={60} className="mb-6 text-gray-400" strokeWidth={1.5} />
                        <h2 className="text-xl font-semibold mb-2 text-gray-100">Start new project</h2>
                        <p className="text-gray-400 mb-4">
                          Upload an image or start with a blank canvas.
                        </p>
                        <Button
                          onClick={handleOpenImageClick}
                          variant="secondary"
                          className="w-full max-w-[220px] h-10 rounded-full mb-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold"
                          disabled={isLoadingAuth}
                        >
                          <Plus className="!h-5 !w-5 mr-1" />
                          Open Image
                        </Button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageFileChange}
                          accept="image/*"
                          className="hidden"
                          disabled={isLoadingAuth}
                        />
                        <Button
                          onClick={handleOpenModal}
                          variant="outline"
                          className="w-full max-w-[220px] bg-transparent hover:bg-[#303237FF] border-2 border-[#414448FF] h-10 rounded-full text-[#A7A8AAFF] hover:text-white font-semibold"
                          disabled={isLoadingAuth}
                        >
                          Create new
                        </Button>
                        
                      </motion.div>
                    </div>
                    <div className="w-1/2 h-full flex items-center justify-center px-8">
                      {!loggedInUser && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: isAuthVisible ? 1 : 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="w-full"
                        >
                          <AuthContainer onAuthSuccess={handleAuthSuccess} />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </CardContent>
            </div>
          </Card>
        </motion.div>
      </div>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onCreate={handleCreateNewProject}
      />
    </div>
  );
};

export default DashboardPage;
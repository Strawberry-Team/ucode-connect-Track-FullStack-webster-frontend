import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTool } from '@/context/tool-context';
import CreateProjectModal from './create-project-modal.tsx';
import AuthContainer from '../../auth/auth-container.tsx';
import RecentProjects from './recent-projects.tsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ImageUp, Plus, User, X, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserMenuDropdown } from './user-menu-dropdown.tsx';
import { useUser } from '@/context/user-context';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { getCurrentAuthenticatedUser } from '@/services/user-service';
import type { User as AuthUser } from '@/types/auth';
import { deleteProject, getProjectData, getUserProjects, duplicateProject } from '@/utils/project-storage';
import type { RecentProject } from '@/types/dashboard';
import type { ElementData } from '@/types/canvas.ts';

const DashboardPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthVisible, setIsAuthVisible] = useState(false);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
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
    clearHistory,
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
    if (loggedInUser) {
      const userProjects = getUserProjects(loggedInUser.id);
      setRecentProjects(userProjects);
    } else {
      setRecentProjects([]);
    }
  }, [loggedInUser]);

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
    
    clearHistory();
    addHistoryEntry({
      type: 'unknown',
      description: 'New project',
      linesSnapshot: emptyObjects
    });

    setIsAddModeActive(false);
    setCurrentAddToolType(null);

    setStagePosition({ x: 0, y: 0 });
    setLastDrawingEndTime(null);

    setTextColor("#ffffff");
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
    navigate(`/canvas?name=${encodeURIComponent(name)}`);
  };

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileName = file.name.toLowerCase();
      
      // Handle JSON project files
      if (fileName.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const text = e.target?.result as string;
            const projectData = JSON.parse(text);
            
            if (projectData.renderableObjects) {
              resetAllToolSettings();
              
              // Set stage size if available
              if (projectData.stageSize) {
                setStageSize(projectData.stageSize);
              } else {
                // Default canvas size if no stageSize in project
                setStageSize({ width: 1920, height: 1080 });
              }
              
              setIsCanvasManuallyResized(true);
              
              // Set renderable objects
              setRenderableObjects(projectData.renderableObjects);
              
              // Add to history
              clearHistory();
              addHistoryEntry({
                type: 'elementAdded',
                description: `Imported project: ${file.name}`,
                linesSnapshot: projectData.renderableObjects
              });
              
              // Show success toast
              toast.success("Success", {
                description: `Project "${file.name}" imported successfully`,
                duration: 3000,
              });
              
              // Navigate to canvas with project name
              const projectName = file.name.replace(/\.[^/.]+$/, "");
              navigate(`/canvas?name=${encodeURIComponent(projectName)}`);
            } else {
              toast.error("Invalid Project", {
                description: "This JSON file doesn't contain valid project data",
                duration: 3000,
              });
            }
          } catch (error) {
            console.error('Error parsing JSON:', error);
            toast.error("Import Error", {
              description: "Invalid JSON file format",
              duration: 3000,
            });
          }
        };
        reader.readAsText(file);
        return;
      }
      
      // Handle image files (existing logic)
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          resetAllToolSettings();
          
          // Set fixed canvas size to 1000x1000
          const canvasSize = { width: 1000, height: 1000 };
          setStageSize(canvasSize);
          setIsCanvasManuallyResized(true);
          
          // Calculate image positioning and scaling
          let imageWidth = img.naturalWidth;
          let imageHeight = img.naturalHeight;
          
          // Check if image is larger than canvas, scale down if needed
          const maxSize = Math.min(canvasSize.width * 0.8, canvasSize.height * 0.8); // 80% of canvas size
          if (img.naturalWidth > maxSize || img.naturalHeight > maxSize) {
            const scaleX = maxSize / img.naturalWidth;
            const scaleY = maxSize / img.naturalHeight;
            const scale = Math.min(scaleX, scaleY);
            
            imageWidth = img.naturalWidth * scale;
            imageHeight = img.naturalHeight * scale;
          }
          
          // Center the image on canvas (using center coordinates, not top-left)
          const imageCenterX = canvasSize.width / 2;
          const imageCenterY = canvasSize.height / 2;
          
          // Create image element to add to canvas
          const imageElement = {
            id: `image-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            type: "custom-image",
            x: imageCenterX,
            y: imageCenterY,
            width: imageWidth,
            height: imageHeight,
            src: e.target?.result as string,
            fileName: file.name, // Add original file name
            borderColor: "#000000",
            borderColorOpacity: 100,
            borderWidth: 0,
            borderStyle: "hidden",
            color: "#000000",
            opacity: 100,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            draggable: true,
            preserveAspectRatio: true,
          };
          
          // Add image element to renderable objects
          setRenderableObjects([imageElement as ElementData]);
          
          // Add to history
          clearHistory();
          addHistoryEntry({
            type: 'elementAdded',
            description: `Imported image: ${file.name}`,
            linesSnapshot: [imageElement as ElementData]
          });
          
          const fileName = file.name.replace(/\.[^/.]+$/, "");
          navigate(`/canvas?name=${encodeURIComponent(fileName)}`);
        };
        img.onerror = () => {
          console.error("Error loading image for size determination.");
          toast.error("Image Error", {
            description: "Could not load the selected image",
            duration: 3000,
          });
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
    console.log('User successfully authorized in DashboardPage, updating context:', user);
    loginUserContext(user);
    setIsAuthVisible(false);
    
    const userProjects = getUserProjects(user.id);
    setRecentProjects(userProjects);
  };

  const handleLogout = () => {
    logoutUserContext();
    setIsAuthVisible(false);
    setRecentProjects([]);
    toast.success("Logged Out", { description: "You have been successfully logged out.", duration: 3000 });
  };

  const handleOpenProject = (projectId: string) => {
    const projectData = getProjectData(projectId);
    
    if (!projectData) {
      toast.error("Error", { description: "Failed to load project", duration: 3000 });
      return;
    }
    
    resetAllToolSettings();
    
    const { project, renderableObjects } = projectData;
    
    
    setStageSize({ width: project.width, height: project.height });
    setIsCanvasManuallyResized(true);
    
    setRenderableObjects(renderableObjects);
    
    clearHistory();
    addHistoryEntry({
      type: 'unknown',
      description: `Opened project "${project.name}"`,
      linesSnapshot: renderableObjects
    });
    
    navigate(`/canvas?projectId=${encodeURIComponent(project.id)}&name=${encodeURIComponent(project.name)}`);
  };

  const handleDeleteProject = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    deleteProject(projectId);
    
    if (loggedInUser) {
      const userProjects = getUserProjects(loggedInUser.id);
      setRecentProjects(userProjects);
    } else {
      setRecentProjects([]);
    }
    
    toast.success("Project deleted", { duration: 3000 });
  };

  const handleDuplicateProject = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!loggedInUser) {
      toast.error("Authentication required", { 
        description: "Please log in to duplicate projects", 
        duration: 3000 
      });
      return;
    }
    
    const newProjectId = duplicateProject(projectId, loggedInUser.id);
    
    if (newProjectId) {
      // Refresh the projects list
      const userProjects = getUserProjects(loggedInUser.id);
      setRecentProjects(userProjects);
      
      toast.success("Project duplicated", { 
        description: "Project has been successfully duplicated", 
        duration: 3000 
      });
      
      // Optionally open the duplicated project immediately
      setTimeout(() => {
        handleOpenProject(newProjectId);
      }, 500);
    } else {
      toast.error("Duplication failed", { 
        description: "Could not duplicate the project", 
        duration: 3000 
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const now = new Date();
      const date = new Date(dateString);
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) {
        return `${diffInSeconds}s ago`;
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes}m ago`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours}h ago`;
      } else if (diffInSeconds < 2592000) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days}d ago`;
      } else if (diffInSeconds < 31536000) {
        const months = Math.floor(diffInSeconds / 2592000);
        return `${months}mo ago`;
      } else {
        const years = Math.floor(diffInSeconds / 31536000);
        return `${years}y ago`;
      }
    } catch (error) {
      return "unknown";
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#292C31FF] text-gray-200 p-0">
      <div className="w-full max-w-7xl">
        <motion.div
          className="flex flex-col items-center justify-center relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <Card className={`w-full mt-20 max-w-md bg-[#25282CFF] border-2 border-dashed border-gray-600 shadow-xl relative overflow-hidden transition-opacity duration-300 ${isLoadingAuth ? 'opacity-75' : 'opacity-100'}`}>
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

              <CardContent className="p-0 flex items-center justify-center items-stretch">
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
                          <span>Upload an image, import a JSON project, <br /> or start with a blank canvas.</span>
                        </p>
                        <Button
                          onClick={handleOpenImageClick}
                          variant="secondary"
                          className="w-full max-w-[220px] h-10 rounded-full mb-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                          disabled={isLoadingAuth}
                        >
                          <Plus className="!h-5 !w-5 mr-1" />
                          Open
                        </Button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageFileChange}
                          accept="image/*,.json"
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

          <RecentProjects
            projects={recentProjects}
            onOpenProject={handleOpenProject}
            onDeleteProject={handleDeleteProject}
            onDuplicateProject={handleDuplicateProject}
            formatDate={formatDate}
          />
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
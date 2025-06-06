import { useEffect, useRef, useState, useCallback, createElement, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import { saveProject, updateProject, getProjectData } from '@/utils/project-storage';
import { loadProjectFonts } from '@/utils/font-utils';
import { useTool } from '@/context/tool-context';
import type { RenderableObject } from '@/types/canvas';
import type { User } from '@/types/auth';

// Debounce utility function
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

interface UseProjectManagerProps {
  loggedInUser: User | null;
  renderableObjects: RenderableObject[];
  contextStageSize: { width: number; height: number } | null;
  backgroundImage: HTMLImageElement | null;
  stageRef: React.RefObject<any>;
}

export const useProjectManager = ({
  loggedInUser,
  renderableObjects,
  contextStageSize,
  backgroundImage,
  stageRef
}: UseProjectManagerProps) => {
  const { registerProjectSaver, setHasUnsavedChanges } = useTool();
  
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>("Untitled Project");
  const [showUnsavedWarning, setShowUnsavedWarning] = useState<boolean>(false);

  const currentProjectIdRef = useRef<string | null>(null);
  const projectNameRef = useRef<string>("Untitled Project");
  const renderableObjectsRef = useRef<RenderableObject[]>([]);
  const contextStageSizeRef = useRef<{ width: number; height: number } | null>(null);

  const location = useLocation();

  useEffect(() => {
    currentProjectIdRef.current = currentProjectId;
  }, [currentProjectId]);

  useEffect(() => {
    projectNameRef.current = projectName;
  }, [projectName]);

  useEffect(() => {
    renderableObjectsRef.current = renderableObjects;
  }, [renderableObjects]);

  useEffect(() => {
    contextStageSizeRef.current = contextStageSize;
  }, [contextStageSize]);

  // Helper function to generate thumbnail safely, ensuring all images are loaded
  const generateThumbnailSafely = useCallback(async (): Promise<string | undefined> => {
    if (!stageRef.current) return undefined;

    try {
      const stage = stageRef.current;
      
      // Check if there are any custom-image elements
      const hasCustomImages = renderableObjectsRef.current.some(obj => 
        !('tool' in obj) && obj.type === 'custom-image'
      );

      if (hasCustomImages) {
        // Log the current order of elements for debugging
        const elementOrder = renderableObjectsRef.current
          .filter(obj => !('tool' in obj))
          .map((obj, index) => ({ index, type: obj.type, id: obj.id }));
        console.log('ProjectManager: Element order for thumbnail generation:', elementOrder);
        
        // Wait for all images to be loaded by forcing a render cycle
        return new Promise((resolve) => {
          // Use a longer timeout to ensure all images are rendered in correct order
          setTimeout(() => {
            try {
              // Hide background pattern during thumbnail generation for better preview
              const backgroundPattern = stage.findOne('.background-pattern');
              const wasBackgroundVisible = backgroundPattern?.visible();
              if (backgroundPattern) {
                backgroundPattern.visible(false);
              }
              
              const dataURL = stage.toDataURL({ 
                pixelRatio: 0.4, 
                quality: 0.8,
                mimeType: 'image/png'
              });
              
              // Restore background pattern visibility
              if (backgroundPattern && wasBackgroundVisible) {
                backgroundPattern.visible(true);
              }
              
              console.log('ProjectManager: Thumbnail generated successfully with images in correct order');
              resolve(dataURL);
            } catch (error) {
              console.warn('ProjectManager: Error generating thumbnail with images:', error);
              // Try without crossOrigin
              try {
                const fallbackDataURL = stage.toDataURL({ 
                  pixelRatio: 0.3, 
                  quality: 0.7
                });
                console.log('ProjectManager: Fallback thumbnail generated successfully');
                resolve(fallbackDataURL);
              } catch (fallbackError) {
                console.error('ProjectManager: Fallback thumbnail generation failed:', fallbackError);
                resolve(undefined);
              }
            }
          }, 500); // Increased wait time to 500ms for better image loading
        });
      } else {
        // No custom images, generate thumbnail immediately
        try {
          // Hide background pattern for cleaner preview
          const backgroundPattern = stage.findOne('.background-pattern');
          const wasBackgroundVisible = backgroundPattern?.visible();
          if (backgroundPattern) {
            backgroundPattern.visible(false);
          }
          
          const dataURL = stage.toDataURL({ 
            pixelRatio: 0.4, 
            quality: 0.8 
          });
          
          // Restore background pattern visibility
          if (backgroundPattern && wasBackgroundVisible) {
            backgroundPattern.visible(true);
          }
          
          console.log('ProjectManager: Thumbnail generated successfully without custom images');
          return dataURL;
        } catch (error) {
          console.error('ProjectManager: Error generating thumbnail without images:', error);
          return undefined;
        }
      }
    } catch (error) {
      console.error('ProjectManager: Error in generateThumbnailSafely:', error);
      return undefined;
    }
  }, []);

  const saveCurrentProjectState = useCallback(async () => {
    const currentStageSize = contextStageSizeRef.current;
    const currentRenderableObjects = renderableObjectsRef.current;
    const currentProjectIdValue = currentProjectIdRef.current;
    const currentProjectName = projectNameRef.current;
    
    if (!currentStageSize || !loggedInUser) {
      console.warn('ProjectManager: Cannot save - missing stage size or user not logged in');
      return null;
    }
    
    if (currentRenderableObjects.length === 0) {
      console.warn('ProjectManager: Cannot save - no renderable objects');
      return null;
    }
    
    // Log current element order for debugging
    const elementOrder = currentRenderableObjects
      .filter(obj => !('tool' in obj))
      .map((obj, index) => ({ index, type: obj.type, id: obj.id.slice(-6) }));
    
    console.log('ProjectManager: Saving project state...', {
      projectId: currentProjectIdValue,
      objectsCount: currentRenderableObjects.length,
      elementOrder: elementOrder,
      stageSize: currentStageSize
    });
    
    const thumbnailUrl = await generateThumbnailSafely();
    
    if (currentProjectIdValue) {
      const success = updateProject(
        currentProjectIdValue, 
        currentRenderableObjects, 
        thumbnailUrl,
        currentStageSize.width,
        currentStageSize.height
      );
      console.log('ProjectManager: Updated existing project:', currentProjectIdValue, 'success:', success);
      if (success) {
        console.log('ProjectManager: Element order saved successfully:', elementOrder);
      }
      return currentProjectIdValue;
    } else {
      const hasInitialImage = !!backgroundImage;
      const newProjectId = saveProject(
        currentProjectName,
        currentStageSize.width,
        currentStageSize.height,
        currentRenderableObjects,
        thumbnailUrl,
        hasInitialImage,
        loggedInUser?.id
      );
      
      console.log('ProjectManager: Created new project:', newProjectId, 'with element order:', elementOrder);
      currentProjectIdRef.current = newProjectId;
      setCurrentProjectId(newProjectId);
      
      // Update URL with new project ID
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('projectId', newProjectId);
      window.history.replaceState(null, '', newUrl.toString());
      
      return newProjectId;
    }
  }, [loggedInUser, backgroundImage, stageRef, setCurrentProjectId]);
  
  // Force immediate save when critical changes occur (like element reordering)
  const saveImmediately = useCallback(async () => {
    console.log('ProjectManager: Immediate save triggered');
    return saveCurrentProjectState();
  }, [saveCurrentProjectState]);

  const debouncedSave = useMemo(
    () => debounce(() => {
      if (loggedInUser && contextStageSizeRef.current && renderableObjectsRef.current.length > 0) {
        console.log('ProjectManager: Debounced save triggered');
        saveCurrentProjectState().then((savedProjectId) => {
          if (savedProjectId) {
            console.log('ProjectManager: Debounced save completed successfully');
          }
        }).catch((error) => {
          console.error('ProjectManager: Error in debounced save:', error);
        });
      }
    }, 1500), // Reduced debounce time for faster saves
    [saveCurrentProjectState, loggedInUser]
  );

  // Register the project saver function with ToolContext
  useEffect(() => {
    registerProjectSaver(saveCurrentProjectState);
  }, [registerProjectSaver, saveCurrentProjectState]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const projectId = searchParams.get('projectId');
    const name = searchParams.get('name');
    
    if (name) {
      setProjectName(name);
    }
    
    if (projectId) {
      setCurrentProjectId(projectId);
      setHasUnsavedChanges(false); // Reset unsaved changes flag for existing project
      
      const projectData = getProjectData(projectId);
      if (projectData) {
        setProjectName(projectData.project.name);
        
        // Migrate any legacy opacity values (fix for opacity being stored as 0-100 instead of 0-1)
        const migratedObjects = projectData.renderableObjects.map(obj => {
          if (!('tool' in obj) && typeof obj.opacity === 'number' && obj.opacity > 1) {
            console.warn('ProjectManager: Migrating legacy opacity value:', {
              elementId: obj.id.slice(-6),
              oldOpacity: obj.opacity,
              newOpacity: obj.opacity / 100
            });
            return { ...obj, opacity: obj.opacity / 100 };
          }
          return obj;
        });
        
        // Log element order when loading project
        const elementOrder = migratedObjects
          .filter(obj => !('tool' in obj))
          .map((obj, index) => ({ index, type: obj.type, id: obj.id.slice(-6) }));
        console.log('ProjectManager: Loading project with element order:', elementOrder);
        
        // Load Google Fonts used in this project
        loadProjectFonts(migratedObjects);
        
        // If we migrated any objects, save the updated version
        if (migratedObjects.some((obj, index) => obj !== projectData.renderableObjects[index])) {
          console.log('ProjectManager: Auto-saving migrated opacity values');
          // Update the project with migrated data
          updateProject(projectId, migratedObjects);
        }
      } else {
        console.warn('ProjectManager: Project data not found for ID:', projectId);
      }
    } else {
      console.log('ProjectManager: New project detected, resetting currentProjectId');
      setCurrentProjectId(null);
      setHasUnsavedChanges(false); // Reset unsaved changes flag for new project
    }
  }, [location, setHasUnsavedChanges]);

  useEffect(() => {
    if (!loggedInUser && !showUnsavedWarning) {
      setShowUnsavedWarning(true);
      toast.warning(
        "Changes will not be saved", 
        { 
          description: "Login to enable project autosaving",
          icon: createElement(AlertTriangle, { className: "h-4 w-4" }),
          duration: 5000,
        }
      );
    }
  }, [loggedInUser, showUnsavedWarning]);

  useEffect(() => {
    if (loggedInUser && renderableObjects.length > 0) {
      console.log('ProjectManager: Triggering debounced save due to changes');
      debouncedSave();
    }
  }, [renderableObjects, contextStageSize, debouncedSave, loggedInUser]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (renderableObjects.length > 0) {
        if (loggedInUser) {
          console.warn('ProjectManager: BeforeUnload save triggered');
          // Note: beforeunload is synchronous, so we can't await the promise
          // We'll do a best-effort save
          saveCurrentProjectState().catch((error) => {
            console.error('ProjectManager: Error in beforeunload save:', error);
          });
        } else {
          e.preventDefault();
          e.returnValue = '';
          return '';
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);

      const wasNewProject = !currentProjectIdRef.current;
      saveCurrentProjectState().then((savedProjectId) => {
        if (savedProjectId && wasNewProject) {
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set('projectId', savedProjectId);
          window.history.replaceState(null, '', newUrl.toString());
        }
      }).catch((error) => {
        console.error('ProjectManager: Error in cleanup save:', error);
      });
    };
  }, [renderableObjects, loggedInUser, saveCurrentProjectState]);

  return {
    currentProjectId,
    projectName,
    setProjectName,
    setCurrentProjectId,
    saveImmediately
  };
}; 
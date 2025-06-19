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
  const { registerProjectSaver, setHasUnsavedChanges, projectName: toolContextProjectName, setProjectName: setToolContextProjectName } = useTool();

  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState<boolean>(false);

  const currentProjectIdRef = useRef<string | null>(null);
  const projectNameRef = useRef<string>(toolContextProjectName || "Untitled Project");
  const renderableObjectsRef = useRef<RenderableObject[]>([]);
  const contextStageSizeRef = useRef<{ width: number; height: number } | null>(null);

  const location = useLocation();

  useEffect(() => {
    currentProjectIdRef.current = currentProjectId;
  }, [currentProjectId]);

  // Listen for project name updates from storage
  useEffect(() => {
    const handleProjectNameUpdate = (event: CustomEvent) => {
      const { projectId, newName } = event.detail;

      // If this is the current project, update the name in context
      if (currentProjectId === projectId) {
        setToolContextProjectName(newName);

        // Update URL if we're on the canvas page
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('name', encodeURIComponent(newName));
        const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
        window.history.replaceState({}, '', newUrl);
      }
    };

    window.addEventListener('projectNameUpdated', handleProjectNameUpdate as EventListener);

    return () => {
      window.removeEventListener('projectNameUpdated', handleProjectNameUpdate as EventListener);
    };
  }, [currentProjectId, setToolContextProjectName]);

  useEffect(() => {
    projectNameRef.current = toolContextProjectName || "Untitled Project";
  }, [toolContextProjectName]);

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
        // Wait for all images to be loaded by forcing a render cycle
        return new Promise((resolve) => {
          // Use a longer timeout to ensure all images are rendered in correct order
          setTimeout(() => {
            try {
              // Keep background pattern visible during thumbnail generation to show canvas background
              const backgroundPattern = stage.findOne('.background-pattern');
              const wasBackgroundVisible = backgroundPattern?.visible();

              // Ensure background pattern is visible for thumbnail
              if (backgroundPattern) {
                backgroundPattern.visible(true);
              }

              const dataURL = stage.toDataURL({
                pixelRatio: 0.4,
                quality: 0.8,
                mimeType: 'image/png'
              });

              // Restore original background pattern visibility
              if (backgroundPattern && wasBackgroundVisible !== undefined) {
                backgroundPattern.visible(wasBackgroundVisible);
              }

              resolve(dataURL);
            } catch (error) {
              // Try without crossOrigin
              try {
                const fallbackDataURL = stage.toDataURL({
                  pixelRatio: 0.3,
                  quality: 0.7
                });

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
          // Keep background pattern visible during thumbnail generation to show canvas background
          const backgroundPattern = stage.findOne('.background-pattern');
          const wasBackgroundVisible = backgroundPattern?.visible();

          // Ensure background pattern is visible for thumbnail
          if (backgroundPattern) {
            backgroundPattern.visible(true);
          }

          const dataURL = stage.toDataURL({
            pixelRatio: 0.4,
            quality: 0.8
          });

          // Restore original background pattern visibility
          if (backgroundPattern && wasBackgroundVisible !== undefined) {
            backgroundPattern.visible(wasBackgroundVisible);
          }


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
      return null;
    }

    if (currentRenderableObjects.length === 0) {
      return null;
    }



    const thumbnailUrl = await generateThumbnailSafely();

    if (currentProjectIdValue) {
      updateProject(
        currentProjectIdValue,
        currentRenderableObjects,
        thumbnailUrl,
        currentStageSize.width,
        currentStageSize.height,
        currentProjectName
      );

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

    return saveCurrentProjectState();
  }, [saveCurrentProjectState]);

  const debouncedSave = useMemo(
    () => debounce(() => {
      if (loggedInUser && contextStageSizeRef.current && renderableObjectsRef.current.length > 0) {
        saveCurrentProjectState().then(() => {
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

    if (name && !projectId) {
      // Only set project name from URL if it's a new project (no projectId)
      setToolContextProjectName(decodeURIComponent(name));
    }

    if (projectId) {
      setCurrentProjectId(projectId);
      setHasUnsavedChanges(false); // Reset unsaved changes flag for existing project

      const projectData = getProjectData(projectId);
      if (projectData) {
        // Set project name from saved project data, taking precedence over URL
        setToolContextProjectName(projectData.project.name);

        // Migrate any legacy opacity values (fix for opacity being stored as 0-100 instead of 0-1)
        const migratedObjects = projectData.renderableObjects.map(obj => {
          if (!('tool' in obj) && typeof obj.opacity === 'number' && obj.opacity > 1) {
            return { ...obj, opacity: obj.opacity / 100 };
          }
          return obj;
        });




        // Load Google Fonts used in this project
        loadProjectFonts(migratedObjects);

        // If we migrated any objects, save the updated version
        if (migratedObjects.some((obj, index) => obj !== projectData.renderableObjects[index])) {

          // Update the project with migrated data
          updateProject(projectId, migratedObjects);
        }
      }
    } else {

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

      debouncedSave();
    }
  }, [renderableObjects, contextStageSize, debouncedSave, loggedInUser]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (renderableObjects.length > 0) {
        if (loggedInUser) {
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
    projectName: toolContextProjectName,
    setProjectName: setToolContextProjectName,
    setCurrentProjectId,
    saveImmediately
  };
}; 
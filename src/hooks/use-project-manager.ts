import { useEffect, useRef, useState, useCallback, createElement, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import { saveProject, updateProject, getProjectData } from '@/utils/project-storage';
import { loadProjectFonts } from '@/utils/font-utils';
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

  const saveCurrentProjectState = useCallback(() => {
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
    
    const thumbnailUrl = stageRef.current?.toDataURL({ 
      pixelRatio: 0.4, 
      quality: 0.8 
    });
    
    if (currentProjectIdValue) {
      const success = updateProject(
        currentProjectIdValue, 
        currentRenderableObjects, 
        thumbnailUrl,
        currentStageSize.width,
        currentStageSize.height
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
      
      return newProjectId;
    }
  }, [loggedInUser, backgroundImage, stageRef]);

  const debouncedSave = useMemo(
    () => debounce(() => {
      if (loggedInUser && contextStageSizeRef.current && renderableObjectsRef.current.length > 0) {
        saveCurrentProjectState();
      }
    }, 2000), 
    [saveCurrentProjectState, loggedInUser]
  );

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const projectId = searchParams.get('projectId');
    const name = searchParams.get('name');
    
    if (name) {
      setProjectName(name);
    }
    
    if (projectId) {
      setCurrentProjectId(projectId);
      
      const projectData = getProjectData(projectId);
      if (projectData) {
        setProjectName(projectData.project.name);
        // Load Google Fonts used in this project
        loadProjectFonts(projectData.renderableObjects);
      } else {
        console.warn('ProjectManager: Project data not found for ID:', projectId);
      }
    } else {
      console.warn('ProjectManager: New project detected, resetting currentProjectId');
      setCurrentProjectId(null);
    }
  }, [location]);

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
          console.warn('ProjectManager: BeforeUnload save triggered');
          saveCurrentProjectState();
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
      const savedProjectId = saveCurrentProjectState();
      
      if (savedProjectId && wasNewProject) {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('projectId', savedProjectId);
        window.history.replaceState(null, '', newUrl.toString());
      }
    };
  }, [renderableObjects, loggedInUser, saveCurrentProjectState]);

  return {
    currentProjectId,
    projectName,
    setProjectName,
    setCurrentProjectId
  };
}; 
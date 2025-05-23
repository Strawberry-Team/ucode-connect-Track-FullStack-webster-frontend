import { useEffect, useRef, useState, useCallback, createElement, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import { saveProject, updateProject, getProjectData } from '@/utils/project-storage';
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
  // Состояние для текущего проекта
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>("Untitled Project");
  const [showUnsavedWarning, setShowUnsavedWarning] = useState<boolean>(false);

  // Рефы для стабильного доступа к текущим значениям при размонтировании
  const currentProjectIdRef = useRef<string | null>(null);
  const projectNameRef = useRef<string>("Untitled Project");
  const renderableObjectsRef = useRef<RenderableObject[]>([]);
  const contextStageSizeRef = useRef<{ width: number; height: number } | null>(null);

  const location = useLocation();

  // Обновляем рефы при изменении состояния
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

  // Единая функция для сохранения проекта
  const saveCurrentProjectState = useCallback(() => {
    const currentStageSize = contextStageSizeRef.current;
    const currentRenderableObjects = renderableObjectsRef.current;
    const currentProjectIdValue = currentProjectIdRef.current;
    const currentProjectName = projectNameRef.current;
    
    if (!currentStageSize || !loggedInUser) {
      console.log('ProjectManager: Save skipped - no context or user');
      return null;
    }
    
    // Проверяем что есть что сохранять
    if (currentRenderableObjects.length === 0) {
      console.log('ProjectManager: Save skipped - no objects to save');
      return null;
    }
    
    console.log('ProjectManager: Saving project state -', { 
      currentProjectId: currentProjectIdValue, 
      projectName: currentProjectName, 
      renderableObjectsCount: currentRenderableObjects.length,
      stageSize: currentStageSize
    });
    
    const thumbnailUrl = stageRef.current?.toDataURL({ 
      pixelRatio: 0.4, // Увеличено для лучшего качества thumbnail'ов
      quality: 0.8 
    });
    
    if (currentProjectIdValue) {
      // Обновляем существующий проект с актуальными размерами
      console.log('ProjectManager: Updating existing project:', currentProjectIdValue);
      const success = updateProject(
        currentProjectIdValue, 
        currentRenderableObjects, 
        thumbnailUrl,
        currentStageSize.width,
        currentStageSize.height
      );
      console.log('ProjectManager: Update result:', success);
      return currentProjectIdValue;
    } else {
      // Создаем новый проект
      console.log('ProjectManager: Creating new project:', currentProjectName);
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
      console.log('ProjectManager: Created new project with ID:', newProjectId);
      
      // Обновляем рефы для последующих сохранений
      currentProjectIdRef.current = newProjectId;
      setCurrentProjectId(newProjectId);
      
      return newProjectId;
    }
  }, [loggedInUser, backgroundImage, stageRef]);

  // Debounced версия функции сохранения для автосохранения
  const debouncedSave = useMemo(
    () => debounce(() => {
      if (loggedInUser && contextStageSizeRef.current && renderableObjectsRef.current.length > 0) {
        saveCurrentProjectState();
      }
    }, 2000), // Сохранять через 2 секунды после последнего изменения
    [saveCurrentProjectState, loggedInUser]
  );

  // Получаем название проекта и ID проекта из параметров URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const projectId = searchParams.get('projectId');
    const name = searchParams.get('name');
    
    console.log('ProjectManager: URL params -', { projectId, name });
    
    if (name) {
      setProjectName(name);
    }
    
    if (projectId) {
      console.log('ProjectManager: Setting currentProjectId to:', projectId);
      setCurrentProjectId(projectId);
      
      // Если проект существует, загружаем его данные
      const projectData = getProjectData(projectId);
      if (projectData) {
        setProjectName(projectData.project.name);
        console.log('ProjectManager: Loaded existing project:', projectData.project.name);
      } else {
        console.warn('ProjectManager: Project data not found for ID:', projectId);
      }
    } else {
      // Если нет projectId в URL, это новый проект
      console.log('ProjectManager: New project detected, resetting currentProjectId');
      setCurrentProjectId(null);
    }
  }, [location]);

  // Показываем предупреждение для неавторизованных пользователей
  useEffect(() => {
    if (!loggedInUser && !showUnsavedWarning) {
      setShowUnsavedWarning(true);
      toast.warning(
        "Изменения не сохранятся", 
        { 
          description: "Войдите в аккаунт, чтобы включить автосохранение проектов",
          icon: createElement(AlertTriangle, { className: "h-4 w-4" }),
          duration: 5000,
        }
      );
    }
  }, [loggedInUser, showUnsavedWarning]);

  // Автосохранение при изменении renderableObjects или размеров холста
  useEffect(() => {
    if (loggedInUser && renderableObjects.length > 0) {
      debouncedSave();
    }
  }, [renderableObjects, contextStageSize, debouncedSave, loggedInUser]);

  // Сохраняем перед закрытием страницы И при уходе со страницы внутри SPA
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Эта функция вызывается только при закрытии/обновлении вкладки
      if (renderableObjects.length > 0) {
        if (loggedInUser) {
          console.log('ProjectManager: BeforeUnload save triggered');
          saveCurrentProjectState();
        } else {
          // Для неавторизованных пользователей показываем стандартное предупреждение браузера
          e.preventDefault();
          e.returnValue = ''; // For older browsers
          return ''; // For modern browsers
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // Эта функция вызывается при размонтировании компонента (SPA-навигация или закрытие/обновление)
      window.removeEventListener('beforeunload', handleBeforeUnload);

      // Сохраняем проект при уходе со страницы (SPA-навигация)
      console.log('ProjectManager: Component cleanup - saving project');
      const wasNewProject = !currentProjectIdRef.current; // Запоминаем, был ли это новый проект
      const savedProjectId = saveCurrentProjectState();
      
      // Если был создан новый проект, обновляем URL
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
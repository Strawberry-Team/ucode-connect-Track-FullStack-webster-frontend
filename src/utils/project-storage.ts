import type { RecentProject } from '@/types/dashboard';
import type { RenderableObject } from '@/types/canvas';

// Единый ключ для хранения всех проектов
const PROJECTS_STORAGE_KEY = 'webster_projects';
const MAX_RECENT_PROJECTS = 20;

interface ProjectWithData extends RecentProject {
  renderableObjects: RenderableObject[];
  userId?: number;
}

/**
 * Получает все проекты из localStorage
 */
const getAllProjects = (): Record<string, ProjectWithData> => {
  try {
    const projectsStr = localStorage.getItem(PROJECTS_STORAGE_KEY);
    return projectsStr ? JSON.parse(projectsStr) : {};
  } catch (error) {
    console.error('Ошибка при получении проектов:', error);
    return {};
  }
};

/**
 * Сохраняет все проекты в localStorage
 */
const saveAllProjects = (projects: Record<string, ProjectWithData>): void => {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Ошибка при сохранении проектов:', error);
  }
};

/**
 * Сохраняет проект в localStorage
 */
export const saveProject = (
  projectName: string,
  width: number,
  height: number,
  renderableObjects: RenderableObject[],
  thumbnailUrl?: string,
  hasInitialImage: boolean = false,
  userId?: number
): string => {
  // Получаем все проекты
  const allProjects = getAllProjects();
  
  // Создаем ID для нового проекта
  const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Создаем новый проект
  const newProject: ProjectWithData = {
    id: projectId,
    name: projectName,
    width,
    height,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    thumbnailUrl,
    hasInitialImage,
    renderableObjects,
    userId
  };
  
  // Добавляем проект в общий список
  allProjects[projectId] = newProject;
  
  // Сохраняем все проекты
  saveAllProjects(allProjects);
  
  return projectId;
};

/**
 * Обновляет существующий проект
 */
export const updateProject = (
  projectId: string,
  renderableObjects: RenderableObject[],
  thumbnailUrl?: string,
  width?: number,
  height?: number
): boolean => {
  try {
    console.log('Storage: updateProject called for ID:', projectId);
    const allProjects = getAllProjects();
    
    console.log('Storage: Available projects:', Object.keys(allProjects));
    
    if (!allProjects[projectId]) {
      console.warn('Storage: Project not found:', projectId);
      return false;
    }
    
    console.log('Storage: Updating project:', allProjects[projectId].name);
    
    // Обновляем проект
    const updatedProject = {
      ...allProjects[projectId],
      renderableObjects,
      lastModified: new Date().toISOString()
    };

    // Обновляем размеры, если они переданы
    if (width !== undefined && height !== undefined) {
      updatedProject.width = width;
      updatedProject.height = height;
      console.log('Storage: Updated canvas size to:', width, 'x', height);
    }
    
    if (thumbnailUrl) {
      updatedProject.thumbnailUrl = thumbnailUrl;
    }

    allProjects[projectId] = updatedProject;
    
    // Сохраняем все проекты
    saveAllProjects(allProjects);
    
    console.log('Storage: Project updated successfully');
    return true;
  } catch (error) {
    console.error('Ошибка при обновлении проекта:', error);
    return false;
  }
};

/**
 * Получает список последних проектов
 */
export const getRecentProjects = (): RecentProject[] => {
  try {
    const allProjects = getAllProjects();
    
    // Преобразуем объект проектов в массив
    const projectsArray = Object.values(allProjects)
      .map(({ renderableObjects, userId, ...projectData }) => projectData as RecentProject)
      .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
      .slice(0, MAX_RECENT_PROJECTS);
    
    return projectsArray;
  } catch (error) {
    console.error('Ошибка при получении списка проектов:', error);
    return [];
  }
};

/**
 * Получает данные конкретного проекта
 */
export const getProjectData = (projectId: string): {
  project: RecentProject;
  renderableObjects: RenderableObject[];
  userId?: number;
} | null => {
  try {
    const allProjects = getAllProjects();
    
    if (!allProjects[projectId]) return null;
    
    const { renderableObjects, userId, ...projectData } = allProjects[projectId];
    
    return {
      project: projectData as RecentProject,
      renderableObjects,
      userId
    };
  } catch (error) {
    console.error('Ошибка при получении данных проекта:', error);
    return null;
  }
};

/**
 * Удаляет проект
 */
export const deleteProject = (projectId: string): boolean => {
  try {
    const allProjects = getAllProjects();
    
    if (!allProjects[projectId]) return false;
    
    // Удаляем проект
    delete allProjects[projectId];
    
    // Сохраняем обновленный список проектов
    saveAllProjects(allProjects);
    
    return true;
  } catch (error) {
    console.error('Ошибка при удалении проекта:', error);
    return false;
  }
};

/**
 * Проверяет, принадлежит ли проект пользователю
 */
export const isProjectOwnedByUser = (projectId: string, userId?: number): boolean => {
  if (!userId) return false;
  
  try {
    const allProjects = getAllProjects();
    return allProjects[projectId]?.userId === userId;
  } catch (error) {
    return false;
  }
};

/**
 * Получает проекты пользователя
 */
export const getUserProjects = (userId?: number): RecentProject[] => {
  if (!userId) return [];
  
  try {
    const allProjects = getAllProjects();
    
    // Фильтруем проекты по userId и преобразуем в массив RecentProject
    const userProjects = Object.values(allProjects)
      .filter(project => project.userId === userId)
      .map(({ renderableObjects, userId, ...projectData }) => projectData as RecentProject)
      .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
      .slice(0, MAX_RECENT_PROJECTS);
    
    return userProjects;
  } catch (error) {
    console.error('Ошибка при получении проектов пользователя:', error);
    return [];
  }
}; 
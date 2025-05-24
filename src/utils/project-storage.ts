import type { RecentProject } from '@/types/dashboard';
import type { RenderableObject } from '@/types/canvas';

const PROJECTS_STORAGE_KEY = 'webster_projects';
const MAX_RECENT_PROJECTS = 20;

interface ProjectWithData extends RecentProject {
  renderableObjects: RenderableObject[];
  userId?: number;
}

const getAllProjects = (): Record<string, ProjectWithData> => {
  try {
    const projectsStr = localStorage.getItem(PROJECTS_STORAGE_KEY);
    return projectsStr ? JSON.parse(projectsStr) : {};
  } catch (error) {
    return {};
  }
};

const saveAllProjects = (projects: Record<string, ProjectWithData>): void => {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
  }
};

export const saveProject = (
  projectName: string,
  width: number,
  height: number,
  renderableObjects: RenderableObject[],
  thumbnailUrl?: string,
  hasInitialImage: boolean = false,
  userId?: number
): string => {
  const allProjects = getAllProjects();
  
  const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
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
  
  allProjects[projectId] = newProject;
  
  saveAllProjects(allProjects);
  
  return projectId;
};

export const updateProject = (
  projectId: string,
  renderableObjects: RenderableObject[],
  thumbnailUrl?: string,
  width?: number,
  height?: number
): boolean => {
  try {
    const allProjects = getAllProjects();
    
    
    if (!allProjects[projectId]) {
      return false;
    }
    
    
    const updatedProject = {
      ...allProjects[projectId],
      renderableObjects,
      lastModified: new Date().toISOString()
    };

    if (width !== undefined && height !== undefined) {
      updatedProject.width = width;
      updatedProject.height = height;
    }
    
    if (thumbnailUrl) {
      updatedProject.thumbnailUrl = thumbnailUrl;
    }

    allProjects[projectId] = updatedProject;
    
    saveAllProjects(allProjects);
    
    return true;
  } catch (error) {
    return false;
  }
};

export const getRecentProjects = (): RecentProject[] => {
  try {
    const allProjects = getAllProjects();
    
    const projectsArray = Object.values(allProjects)
      .map(({ renderableObjects, userId, ...projectData }) => projectData as RecentProject)
      .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
      .slice(0, MAX_RECENT_PROJECTS);
    
    return projectsArray;
  } catch (error) {
    return [];
  }
};

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
    return null;
  }
};

export const deleteProject = (projectId: string): boolean => {
  try {
    const allProjects = getAllProjects();
    
    if (!allProjects[projectId]) return false;
    
    delete allProjects[projectId];
    
    saveAllProjects(allProjects);
    
    return true;
  } catch (error) {
    return false;
  }
};

export const isProjectOwnedByUser = (projectId: string, userId?: number): boolean => {
  if (!userId) return false;
  
  try {
    const allProjects = getAllProjects();
    return allProjects[projectId]?.userId === userId;
  } catch (error) {
    return false;
  }
};

export const getUserProjects = (userId?: number): RecentProject[] => {
  if (!userId) return [];
  
  try {
    const allProjects = getAllProjects();
    
    const userProjects = Object.values(allProjects)
      .filter(project => project.userId === userId)
      .map(({ renderableObjects, userId, ...projectData }) => projectData as RecentProject)
      .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
      .slice(0, MAX_RECENT_PROJECTS);
    
    return userProjects;
  } catch (error) {
    return [];
  }
}; 
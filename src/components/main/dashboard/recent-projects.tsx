import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ImageUp, Trash2, Copy, Edit2, Check, X, Settings, FileEdit } from 'lucide-react';
import type { RecentProject } from '@/types/dashboard';
import { formatDimensionDisplay } from '@/utils/format-utils';

interface RecentProjectsProps {
  projects: RecentProject[];
  onOpenProject: (projectId: string) => void;
  onDeleteProject: (projectId: string, e: React.MouseEvent) => void;
  onDuplicateProject: (projectId: string, e: React.MouseEvent) => void;
  onRenameProject?: (projectId: string, newName: string) => void;
  formatDate: (dateString: string) => string;
}

const RecentProjects: React.FC<RecentProjectsProps> = ({
  projects,
  onOpenProject,
  onDeleteProject,
  onDuplicateProject,
  onRenameProject,
  formatDate
}) => {
  const [localProjects, setLocalProjects] = useState(projects);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [hoveredMenuId, setHoveredMenuId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Update local projects when props change
  useEffect(() => {
    setLocalProjects(projects);
  }, [projects]);



  const handleStartEdit = (projectId: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const project = localProjects.find(p => p.id === projectId);
    setEditingProjectId(projectId);
    setEditingName(project?.name || currentName);
    setHoveredMenuId(null); // Close menu when starting edit
    
    if (!onRenameProject) {
      console.warn('onRenameProject function not provided - changes will be saved locally only');
    }
  };

  const handleSaveEdit = (projectId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const trimmedName = editingName.trim();
    const currentProject = localProjects.find(p => p.id === projectId);
    
    if (trimmedName && trimmedName !== currentProject?.name) {
      // Update local state immediately for UI responsiveness
      setLocalProjects(prev => 
        prev.map(project => 
          project.id === projectId 
            ? { ...project, name: trimmedName }
            : project
        )
      );
      
      // Call parent function if available
      if (onRenameProject) {
        onRenameProject(projectId, trimmedName);
      }
    }
    
    setEditingProjectId(null);
    setEditingName('');
  };

  const handleCancelEdit = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingProjectId(null);
    setEditingName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, projectId: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(projectId);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  // Focus input when editing starts
  useEffect(() => {
    if (editingProjectId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingProjectId]);



  if (localProjects.length === 0) {
    return null;
  }

  return (
    <motion.div
      className="w-11/12 mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h2 className="text-xl font-semibold mb-4 text-gray-100 flex items-center ">
        <Clock className="mr-2 h-5 w-5 text-gray-400" />
        Recent projects
      </h2>

      <div className="recent-projects-scroll cursor-pointer overflow-x-auto pb-2">
        <style dangerouslySetInnerHTML={{
          __html: `
          .recent-projects-scroll::-webkit-scrollbar {
            width: 8px;
            height: 8px;
            background-color: #292C31;
          }
          .recent-projects-scroll::-webkit-scrollbar-thumb {
            background-color: #44474A;
            border-radius: 4px;
          }
          .recent-projects-scroll::-webkit-scrollbar-track {
            background-color: #292C31;
            border-radius: 4px;
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(-10px) scale(0.8);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          
          .animate-fadeInUp {
            animation: fadeInUp 0.3s ease-out forwards;
          }
        ` }} />
        <div className="flex gap-4 min-w-max">
          {localProjects.map((project) => (
            <Card
              key={project.id}
              onClick={() => onOpenProject(project.id)}
              className="flex-shrink-0 w-55 bg-[#25282CFF] border-2 border-[#44474AFF] hover:border-blue-500 transition-colors duration-200 cursor-pointer overflow-hidden -py-2"
            >
              <div className="h-35 bg-[#1A1C1FFF] relative overflow-hidden">
                {project.thumbnailUrl ? (
                  <img
                    src={project.thumbnailUrl}
                    alt={project.name}
                    className="w-full h-full object-contain"
                    style={{
                      imageRendering: 'crisp-edges',
                      filter: 'contrast(1.05) brightness(1.02)',
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <ImageUp size={32} />
                  </div>
                )}
                <div 
                  className="absolute top-1 right-1 flex flex-col gap-1" 
                  ref={menuRef}
                  onMouseEnter={() => setHoveredMenuId(project.id)}
                  onMouseLeave={() => setHoveredMenuId(null)}
                >
                  {hoveredMenuId === project.id ? (
                    <>
                      <Button
                        variant="ghost"
                        onClick={(e) => handleStartEdit(project.id, project.name, e)}
                        className="h-6 w-6 rounded-full bg-grey-600/50 hover:bg-yellow-500/80 text-gray-300 hover:text-white p-0 transition-all duration-200 opacity-0 animate-fadeInUp"
                        style={{ animationDelay: '0ms' }}
                        title="Rename"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicateProject(project.id, e);
                        }}
                        className="h-6 w-6 rounded-full bg-grey-600/50 hover:bg-blue-500/80 text-gray-300 hover:text-white p-0 transition-all duration-200 opacity-0 animate-fadeInUp"
                        style={{ animationDelay: '150ms' }}
                        title="Duplicate"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProject(project.id, e);
                        }}
                        className="h-6 w-6 rounded-full bg-grey-600/50 hover:bg-red-500/80 text-gray-300 hover:text-white p-0 transition-all duration-200 opacity-0 animate-fadeInUp"
                        style={{ animationDelay: '250ms' }}
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      className="h-6 w-6 rounded-full bg-grey-600/50 hover:bg-gray-500/80 text-gray-300 hover:text-white p-0 transition-all duration-200"
                      title="Project options"
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              <CardContent className="px-4 -mt-2">
                <div className="flex items-center justify-between">
                  {editingProjectId === project.id ? (
                    <div className="flex items-center space-x-1 w-full">
                      <input
                        ref={inputRef}
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, project.id)}
                        onBlur={() => handleSaveEdit(project.id)}
                        className="flex-1 bg-[#1A1C1FFF] border border-blue-500 rounded rounded-sm px-2 py-0 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Button
                        variant="ghost"
                        onClick={(e) => handleSaveEdit(project.id, e)}
                        className="h-6 w-6 p-0 hover:bg-green-500/20 bg-grey-600/50 text-green-400 rounded-full"
                        title="Save"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      {/* <Button
                        variant="ghost"
                        onClick={(e) => handleCancelEdit(e)}
                        className="h-6 w-6 p-0 hover:bg-red-500/20 text-red-400"
                        title="Cancel"
                      >
                        <X className="h-3 w-3" />
                      </Button> */}
                    </div>
                  ) : (
                    <h3 className="font-medium text-gray-100 truncate">
                      {project.name}
                    </h3>
                  )}
                </div>
                <div className="flex justify-between items-center text-sm text-gray-400 mb-2">
                  <span className="flex-shrink-0">
                    {(project ? formatDimensionDisplay(project.width) : "0")} × {(project ? formatDimensionDisplay(project.height) : "0")}
                  </span>
                  <span className="truncate ml-2">
                    {formatDate(project.lastModified)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-500 text-center mt-2">
        {localProjects.length > 4 && "← Scroll to view all projects →"}
      </div>
    </motion.div>
  );
};

export default RecentProjects; 
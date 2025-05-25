import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ImageUp, Trash2, Copy } from 'lucide-react';
import type { RecentProject } from '@/types/dashboard';
import { formatDimensionDisplay } from '@/utils/format-utils';

interface RecentProjectsProps {
  projects: RecentProject[];
  onOpenProject: (projectId: string) => void;
  onDeleteProject: (projectId: string, e: React.MouseEvent) => void;
  onDuplicateProject: (projectId: string, e: React.MouseEvent) => void;
  formatDate: (dateString: string) => string;
}

const RecentProjects: React.FC<RecentProjectsProps> = ({
  projects,
  onOpenProject,
  onDeleteProject,
  onDuplicateProject,
  formatDate
}) => {
  if (projects.length === 0) {
    return null;
  }

  return (
    <motion.div
      className="w-full mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h2 className="text-xl font-semibold mb-4 text-gray-100 flex items-center">
        <Clock className="mr-2 h-5 w-5 text-gray-400" />
        Recent projects
      </h2>
      
      <div className="cursor-pointer overflow-x-auto custom-scroll pb-2">
        <div className="flex gap-4 min-w-max">
          {projects.map((project) => (
            <Card
              key={project.id}
              onClick={() => onOpenProject(project.id)}
              className="flex-shrink-0 w-60 bg-[#25282CFF] border-2 border-[#44474AFF] hover:border-blue-500 transition-colors duration-200 cursor-pointer overflow-hidden"
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
                <Button
                  variant="ghost"
                  onClick={(e) => onDuplicateProject(project.id, e)}
                  className="absolute top-1 right-10 h-8 w-8 rounded-full bg-black/50 hover:bg-blue-500/80 text-gray-300 hover:text-white p-0"
                  title="Duplicate project"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={(e) => onDeleteProject(project.id, e)}
                  className="absolute top-1 right-1 h-8 w-8 rounded-full bg-black/50 hover:bg-red-500/80 text-gray-300 hover:text-white p-0"
                  title="Delete project"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
            
              </div>
              
              <CardContent className="px-4">
                <h3 className="font-medium text-gray-100 truncate mb-2">
                  {project.name}
                </h3>
                <div className="flex justify-between items-center text-sm text-gray-400">
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
        {projects.length > 4 && "← Scroll to view all projects →"}
      </div>
    </motion.div>
  );
};

export default RecentProjects; 
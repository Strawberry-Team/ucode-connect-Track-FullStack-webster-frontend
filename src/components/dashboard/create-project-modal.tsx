import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import type { Template } from '@/types/dashboard';

const initialTemplates: Template[] = [
  { id: 'social', title: 'Social media post', dimensionsText: '1080x1080 px', width: 1080, height: 1080, iconUrl: 'https://pixlr.com/img/icon/category/social.svg' },
  { id: 'portrait1', title: 'Portrait 4x6 in', dimensionsText: '1200x1800 px', width: 1200, height: 1800, iconUrl: 'https://pixlr.com/img/icon/category/portrait.svg' },
  { id: 'portrait2', title: 'Portrait 8x10 in', dimensionsText: '2400x3000 px', width: 2400, height: 3000, iconUrl: 'https://pixlr.com/img/icon/category/portrait.svg' },
  { id: 'landscape', title: 'Landscape 6x4 in', dimensionsText: '1800x1200 px', width: 1800, height: 1200, iconUrl: 'https://pixlr.com/img/icon/category/landscape.svg' },
];

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, width: number, height: number) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [projectName, setProjectName] = useState<string>('');
  const [canvasWidth, setCanvasWidth] = useState<string>('');
  const [canvasHeight, setCanvasHeight] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const resetFormStates = () => {
    setProjectName('');
    setCanvasWidth('');
    setCanvasHeight('');
    setSelectedTemplateId(null);
  };

  useEffect(() => {
    if (selectedTemplateId) {
      const template = initialTemplates.find(t => t.id === selectedTemplateId);
      if (template) {
        setProjectName(template.title);
        setCanvasWidth(template.width.toString());
        setCanvasHeight(template.height.toString());
      }
    }
  }, [selectedTemplateId]);

  const handleTemplateClick = (template: Template) => {
    setSelectedTemplateId(template.id);
  };

  const handleInputChange = () => {
    setSelectedTemplateId(null);
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCanvasWidth(e.target.value);
    handleInputChange();
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCanvasHeight(e.target.value);
    handleInputChange();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectName(e.target.value);
  }

  const handleCreate = () => {
    const widthNum = parseInt(canvasWidth, 10);
    const heightNum = parseInt(canvasHeight, 10);

    if (projectName.trim() && widthNum > 0 && heightNum > 0) {
      onCreate(projectName.trim(), widthNum, heightNum);
      onClose();
    } else {
      alert('Please fill in all fields correctly.');
    }
  };

  const AspectRatioPreview: React.FC<{ width: number; height: number; iconUrl?: string; title?: string }> = ({ width, height, iconUrl, title }) => {
    const containerHeight = 128;
    const containerPadding = 16;
    const availableHeight = containerHeight - containerPadding;

    let previewW, previewH;
    const aspectRatio = width / height;

    if (width > height) {
        previewH = availableHeight * 0.8;
        previewW = previewH * aspectRatio;
    } else {
        previewW = availableHeight * 0.8 * aspectRatio;
        previewH = availableHeight * 0.8;
        if (aspectRatio === 1) {
          previewW = previewH;
        }
    }
    
    let innerWidthPercent = '80%';
    let innerHeightPercent = '80%';

    if (aspectRatio > 1) {
        innerHeightPercent = `${60 / aspectRatio}%`;
    } else {
        innerWidthPercent = `${60 * aspectRatio}%`;
    }


    return (
      <div className="w-full h-32 bg-[#4A4D54FF] rounded-md mb-3 flex items-center justify-center overflow-hidden p-2">
        {iconUrl ? (
          <img src={iconUrl} alt={title ? `${title} icon` : 'Template icon'} className="w-[45px] max-h-full object-contain" />
        ) : (
          <div style={{ width: innerWidthPercent, height: innerHeightPercent }} className="bg-[#6A6D74FF] rounded-sm"></div>
        )}
      </div>
    );
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetFormStates();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[1000px] sm:max-h-[70vh] bg-[#2D2F34FF] text-gray-100 border-none p-0">
        <DialogHeader>
        </DialogHeader>

        <div className="flex md:flex-row flex-col gap-6 p-6">
          <div className="flex flex-col md:w-[500px]">
            <div className="flex flex-wrap gap-3 overflow-y-auto max-h-[calc(80vh-10rem)] pr-2 custom-scroll">
              {initialTemplates.map((template) => (
                <Card
                  key={template.id}
                  onClick={() => handleTemplateClick(template)}
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleTemplateClick(template)}
                  className={`bg-[#3A3D44FF] h-[250px] min-w-[200px] border-2 border-[#4A4D54FF] hover:bg-[#4A4D54FF] cursor-pointer transition-colors duration-150 rounded-lg flex-1
                              ${selectedTemplateId === template.id ? 'border-2 border-blue-500 ring-blue-500' : 'ring-1 ring-transparent hover:ring-gray-600'}`}
                  
                >
                  <CardContent className="p-4">
                    <AspectRatioPreview width={template.width} height={template.height} iconUrl={template.iconUrl} title={template.title} />
                    <h4 className="text-md font-semibold text-gray-100">{template.title}</h4>
                    <p className="text-sm text-gray-400">{template.dimensionsText}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-6 flex-1">
            <h3 className="text-lg font-medium text-gray-300">Or specify your parameters</h3>
            <div>
              <Label htmlFor="projectName" className="text-gray-300 mb-1.5 block">Project name</Label>
              <Input
                id="projectName"
                type="text"
                value={projectName}
                onChange={handleNameChange}
                placeholder="My new design"
                className="bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="canvasWidth" className="text-gray-300 mb-1.5 block">Width (px)</Label>
                <Input
                  id="canvasWidth"
                  type="number"
                  value={canvasWidth}
                  onChange={handleWidthChange}
                  placeholder="1920"
                  min="1"
                  className="hide-arrows bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="canvasHeight" className="text-gray-300 mb-1.5 block">Height (px)</Label>
                <Input
                  id="canvasHeight"
                  type="number"
                  value={canvasHeight}
                  onChange={handleHeightChange}
                  placeholder="1080"
                  min="1"
                  className="hide-arrows bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-row gap-4 px-6 -mt-5 sm:justify-end bg-[#2D2F34FF] rounded-b-lg">
          <Button
            variant="outline"
            onClick={() => {
              resetFormStates();
              onClose();
            }}
            className="w-[150px] bg-transparent hover:bg-[#303237FF] border-2 border-[#414448FF] h-10 rounded-full text-[#A7A8AAFF] hover:text-white font-semibold"
            aria-label="Cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            className="w-[150px] h-10 rounded-full mb-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold"
            aria-label="Create project"
            disabled={!projectName.trim() || !(parseInt(canvasWidth, 10) > 0) || !(parseInt(canvasHeight, 10) > 0)}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectModal; 

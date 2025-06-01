import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import type { Template } from '@/types/dashboard';

const allTemplates: Record<string, Template[]> = {
  recommended: [
    { id: 'social-post', title: 'Social post', dimensionsText: '1080x1080 px', width: 1080, height: 1080, iconUrl: 'https://pixlr.com/img/icon/category/social.svg' },
    { id: 'social-story', title: 'Social story', dimensionsText: '1080x1920 px', width: 1080, height: 1920, iconUrl: 'https://pixlr.com/img/icon/category/social.svg' },
    { id: 'web-med', title: 'Web med', dimensionsText: '1600x900 px', width: 1600, height: 900, iconUrl: 'https://pixlr.com/img/icon/category/web.svg' },
    { id: 'art-grid', title: 'Art grid', dimensionsText: '1000x1000 px', width: 1000, height: 1000, iconUrl: 'https://pixlr.com/img/icon/category/art.svg' },
    { id: 'thumb-720p', title: 'Thumb 720p', dimensionsText: '1280x720 px', width: 1280, height: 720, iconUrl: 'https://pixlr.com/img/icon/category/video.svg' },
    { id: 'wide-1080p', title: 'Wide 1080p', dimensionsText: '1920x1080 px', width: 1920, height: 1080, iconUrl: 'https://pixlr.com/img/icon/category/video.svg' },
    { id: '12-mpx-43', title: '12 mpx 4:3', dimensionsText: '4032x3024 px', width: 4032, height: 3024, iconUrl: 'https://pixlr.com/img/icon/category/landscape.svg' },
    { id: '8-mpx-43', title: '8 mpx 4:3', dimensionsText: '3264x2448 px', width: 3264, height: 2448, iconUrl: 'https://pixlr.com/img/icon/category/landscape.svg' },
  ],
  photo: [
    { id: '12-mpx-43-photo', title: '12 mpx 4:3', dimensionsText: '4032x3024 px', width: 4032, height: 3024, iconUrl: 'https://pixlr.com/img/icon/category/landscape.svg' },
    { id: '8-mpx-43-photo', title: '8 mpx 4:3', dimensionsText: '3264x2448 px', width: 3264, height: 2448, iconUrl: 'https://pixlr.com/img/icon/category/landscape.svg' },
    { id: 'landscape-3x2', title: 'Landscape 3x2 in', dimensionsText: '900x600 px', width: 900, height: 600, iconUrl: 'https://pixlr.com/img/icon/category/landscape.svg' },
    { id: 'landscape-6x4', title: 'Landscape 6x4 in', dimensionsText: '1800x1200 px', width: 1800, height: 1200, iconUrl: 'https://pixlr.com/img/icon/category/landscape.svg' },
    { id: 'landscape-7x5', title: 'Landscape 7x5 in', dimensionsText: '2100x1500 px', width: 2100, height: 1500, iconUrl: 'https://pixlr.com/img/icon/category/landscape.svg' },
    { id: 'landscape-10x8', title: 'Landscape 10x8 in', dimensionsText: '3000x2400 px', width: 3000, height: 2400, iconUrl: 'https://pixlr.com/img/icon/category/landscape.svg' },
    { id: 'portrait-2x3', title: 'Portrait 2x3 in', dimensionsText: '600x900 px', width: 600, height: 900, iconUrl: 'https://pixlr.com/img/icon/category/portrait.svg' },
    { id: 'portrait-4x6', title: 'Portrait 4x6 in', dimensionsText: '1200x1800 px', width: 1200, height: 1800, iconUrl: 'https://pixlr.com/img/icon/category/portrait.svg' },
    { id: 'portrait-5x7', title: 'Portrait 5x7 in', dimensionsText: '1500x2100 px', width: 1500, height: 2100, iconUrl: 'https://pixlr.com/img/icon/category/portrait.svg' },
    { id: 'portrait-8x10', title: 'Portrait 8x10 in', dimensionsText: '2400x3000 px', width: 2400, height: 3000, iconUrl: 'https://pixlr.com/img/icon/category/portrait.svg' },
  ],
  social: [
    { id: 'instagram-square', title: 'Instagram square', dimensionsText: '1080x1080 px', width: 1080, height: 1080, iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/2048px-Instagram_logo_2016.svg.png' },
    { id: 'instagram-post', title: 'Instagram post', dimensionsText: '1080x1350 px', width: 1080, height: 1350, iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/2048px-Instagram_logo_2016.svg.png' },
    { id: 'instagram-story', title: 'Instagram story', dimensionsText: '1080x1920 px', width: 1080, height: 1920, iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/2048px-Instagram_logo_2016.svg.png' },
    { id: 'facebook-post', title: 'Facebook post', dimensionsText: '1200x630 px', width: 1200, height: 630, iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png' },
    { id: 'facebook-story', title: 'Facebook story', dimensionsText: '1080x1920 px', width: 1080, height: 1920, iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png' },
    { id: 'facebook-cover', title: 'Facebook cover', dimensionsText: '851x315 px', width: 851, height: 315, iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png' },
    { id: 'facebook-profile', title: 'Facebook profile', dimensionsText: '850x850 px', width: 850, height: 850, iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png' },
    { id: 'twitter-post', title: 'Twitter post', dimensionsText: '1600x900 px', width: 1600, height: 900, iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg' },
    { id: 'twitter-cover', title: 'Twitter cover', dimensionsText: '1500x500 px', width: 1500, height: 500, iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg' },
    { id: 'twitter-profile', title: 'Twitter profile', dimensionsText: '400x400 px', width: 400, height: 400, iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg' },
    { id: 'youtube-profile', title: 'Youtube profile', dimensionsText: '800x800 px', width: 800, height: 800, iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg' },
    { id: 'youtube-thumbnail', title: 'Youtube thumbnail', dimensionsText: '1280x720 px', width: 1280, height: 720, iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg' },
    { id: 'youtube-art', title: 'Youtube art', dimensionsText: '2048x1152 px', width: 2048, height: 1152, iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg' },
    { id: 'pinterest-pin', title: 'Pinterest pin', dimensionsText: '1000x1500 px', width: 1000, height: 1500, iconUrl: 'https://pixlr.com/img/icon/category/pinterest.svg' },
    { id: 'pinterest-square-pin', title: 'Pinterest square pin', dimensionsText: '1000x1000 px', width: 1000, height: 1000, iconUrl: 'https://pixlr.com/img/icon/category/pinterest.svg' },
    { id: 'pinterest-wide-pin', title: 'Pinterest wide pin', dimensionsText: '1000x2100 px', width: 1000, height: 2100, iconUrl: 'https://pixlr.com/img/icon/category/pinterest.svg' },
  ],
  web: [
    { id: 'web-1994', title: 'Web 1994', dimensionsText: '800x600 px', width: 800, height: 600, iconUrl: 'https://pixlr.com/img/icon/category/web.svg' },
    { id: 'web-2004', title: 'Web 2004', dimensionsText: '1280x720 px', width: 1280, height: 720, iconUrl: 'https://pixlr.com/img/icon/category/web.svg' },
    { id: 'web-2012', title: 'Web 2012', dimensionsText: '1366x768 px', width: 1366, height: 768, iconUrl: 'https://pixlr.com/img/icon/category/web.svg' },
    { id: 'web-2016', title: 'Web 2016', dimensionsText: '1440x900 px', width: 1440, height: 900, iconUrl: 'https://pixlr.com/img/icon/category/web.svg' },
    { id: 'web-2020', title: 'Web 2020', dimensionsText: '1920x1200 px', width: 1920, height: 1200, iconUrl: 'https://pixlr.com/img/icon/category/web.svg' },
    { id: 'icon-16', title: 'Icon 16', dimensionsText: '16x16 px', width: 16, height: 16, iconUrl: 'https://pixlr.com/img/icon/category/icon.svg' },
    { id: 'icon-32', title: 'Icon 32', dimensionsText: '32x32 px', width: 32, height: 32, iconUrl: 'https://pixlr.com/img/icon/category/icon.svg' },
    { id: 'icon-64', title: 'Icon 64', dimensionsText: '64x64 px', width: 64, height: 64, iconUrl: 'https://pixlr.com/img/icon/category/icon.svg' },
    { id: 'icon-512', title: 'Icon 512', dimensionsText: '512x512 px', width: 512, height: 512, iconUrl: 'https://pixlr.com/img/icon/category/icon.svg' },
    { id: 'icon-1024', title: 'Icon 1024', dimensionsText: '1024x1024 px', width: 1024, height: 1024, iconUrl: 'https://pixlr.com/img/icon/category/icon.svg' },
  ],
  print: [
    { id: 'letter-8x11', title: 'Letter 8 x 11 in', dimensionsText: '2400x3300 px', width: 2400, height: 3300, iconUrl: 'https://pixlr.com/img/icon/category/paper.svg' },
    { id: 'legal-8x14', title: 'Legal 8 x 14 in', dimensionsText: '2400x4200 px', width: 2400, height: 4200, iconUrl: 'https://pixlr.com/img/icon/category/paper.svg' },
    { id: 'tabloid-11x17', title: 'Tabloid 11 x 17 in', dimensionsText: '3300x5100 px', width: 3300, height: 5100, iconUrl: 'https://pixlr.com/img/icon/category/paper.svg' },
    { id: 'a3-297x420', title: 'A3 297 x 420 mm', dimensionsText: '3508x4961 px', width: 3508, height: 4961, iconUrl: 'https://pixlr.com/img/icon/category/paper.svg' },
    { id: 'a4-210x297', title: 'A4 210 x 297 mm', dimensionsText: '2480x3508 px', width: 2480, height: 3508, iconUrl: 'https://pixlr.com/img/icon/category/paper.svg' },
    { id: 'a5-148x210', title: 'A5 148 x 210 mm', dimensionsText: '1748x2480 px', width: 1748, height: 2480, iconUrl: 'https://pixlr.com/img/icon/category/paper.svg' },
    { id: 'a6-105x148', title: 'A6 105 x 148 mm', dimensionsText: '1240x1748 px', width: 1240, height: 1748, iconUrl: 'https://pixlr.com/img/icon/category/paper.svg' },
    { id: 'business-card', title: 'Business card', dimensionsText: '1050x600 px', width: 1050, height: 600, iconUrl: 'https://pixlr.com/img/icon/category/business-card.svg' },
    { id: 'flyer-4.25x5.5', title: 'Flyer 4.25 x 5.5 in', dimensionsText: '1275x1650 px', width: 1275, height: 1650, iconUrl: 'https://pixlr.com/img/icon/category/flyer.svg' },
    { id: 'flyer-5.5x8.5', title: 'Flyer 5.5 x 8.5 in', dimensionsText: '1650x2550 px', width: 1650, height: 2550, iconUrl: 'https://pixlr.com/img/icon/category/flyer.svg' },
    { id: 'flyer-8.5x11', title: 'Flyer 8.5 x 11 in', dimensionsText: '2550x3300 px', width: 2550, height: 3300, iconUrl: 'https://pixlr.com/img/icon/category/flyer.svg' },
    { id: 'brochure-8.5x11', title: 'Booklet 8.5 x 11 in', dimensionsText: '2550x3300 px', width: 2550, height: 3300, iconUrl: 'https://pixlr.com/img/icon/category/flyer.svg' },
    { id: 'brochure-8.5x14', title: 'Booklet 8.5 x 14 in', dimensionsText: '2550x4200 px', width: 2550, height: 4200, iconUrl: 'https://pixlr.com/img/icon/category/flyer.svg' },
    { id: 'brochure-11x17', title: 'Booklet 11 x 17 in', dimensionsText: '3300x5100 px', width: 3300, height: 5100, iconUrl: 'https://pixlr.com/img/icon/category/flyer.svg' },
    { id: 'invitation-4x6', title: 'Invitation 4 x 6 in', dimensionsText: '384x576 px', width: 384, height: 576, iconUrl: 'https://pixlr.com/img/icon/category/invitation.svg' },
    { id: 'invitation-5x7', title: 'Invitation 5 x 7 in', dimensionsText: '480x672 px', width: 480, height: 672, iconUrl: 'https://pixlr.com/img/icon/category/invitation.svg' },
  ],
  video: [
    { id: '360p', title: '360p', dimensionsText: '640x360 px', width: 640, height: 360, iconUrl: 'https://pixlr.com/img/icon/category/video.svg' },
    { id: '480p', title: '480p', dimensionsText: '854x480 px', width: 854, height: 480, iconUrl: 'https://pixlr.com/img/icon/category/video.svg' },
    { id: '720p', title: '720p', dimensionsText: '1280x720 px', width: 1280, height: 720, iconUrl: 'https://pixlr.com/img/icon/category/video.svg' },
    { id: '1080p-hd', title: '1080p HD', dimensionsText: '1920x1080 px', width: 1920, height: 1080, iconUrl: 'https://pixlr.com/img/icon/category/video.svg' },
    { id: '1440p-2k', title: '1440p 2K', dimensionsText: '2560x1440 px', width: 2560, height: 1440, iconUrl: 'https://pixlr.com/img/icon/category/video.svg' },
    { id: '4k-uhd', title: '4K UHD', dimensionsText: '3840x2160 px', width: 3840, height: 2160, iconUrl: 'https://pixlr.com/img/icon/category/video.svg' },
  ]
};

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, width: number, height: number) => void;
}

type TabType = 'recommended' | 'photo' | 'social' | 'web' | 'print' | 'video' | 'sample-images';

const tabs = [
  { id: 'recommended' as TabType, label: 'Recommended' },
  { id: 'photo' as TabType, label: 'Photo' },
  { id: 'social' as TabType, label: 'Social' },
  { id: 'web' as TabType, label: 'Web' },
  { id: 'print' as TabType, label: 'Print' },
  { id: 'video' as TabType, label: 'Video' },
  { id: 'sample-images' as TabType, label: 'Sample Images' },
];

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [projectName, setProjectName] = useState<string>('');
  const [canvasWidth, setCanvasWidth] = useState<string>('');
  const [canvasHeight, setCanvasHeight] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('recommended');

  const currentTemplates = allTemplates[activeTab] || [];

  const resetFormStates = () => {
    setProjectName('');
    setCanvasWidth('');
    setCanvasHeight('');
    setSelectedTemplateId(null);
    setActiveTab('recommended');
  };

  useEffect(() => {
    if (selectedTemplateId) {
      const template = currentTemplates.find(t => t.id === selectedTemplateId);
      if (template) {
        setProjectName(template.title);
        setCanvasWidth(template.width.toString());
        setCanvasHeight(template.height.toString());
      }
    }
  }, [selectedTemplateId, currentTemplates]);

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

  const handleTabClick = (tabId: TabType) => {
    setActiveTab(tabId);
    setSelectedTemplateId(null); // Reset selected template when switching tabs
  };

  const AspectRatioPreview: React.FC<{ width: number; height: number; iconUrl?: string; title?: string, className?: string }> = ({ width, height, iconUrl, title, className }) => {
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
      <div className={`w-full h-32 bg-[#4A4D54FF] rounded-md mb-3 flex items-center justify-center overflow-hidden p-2 ${className}`}>
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
      <DialogContent className="sm:max-w-[1000px] sm:max-h-[90vh] h-full bg-[#2D2F34FF] text-gray-300 border-none p-0 flex flex-col items-center justify-start">
        <DialogHeader className="px-6 pt-6 pb-0 w-full">
          <DialogTitle className="m-0 text-base font-normal text-center text-gray-300">Create a new project</DialogTitle>

          {/* Tabs */}
          <div className="flex border-b border-[#4A4D54FF]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleTabClick(tab.id)}
                className={`px-4 py-3 text-sm font-medium transition-colors duration-200 border-b-2 hover:text-gray-200 focus:text-white focus:border-white focus:border-b-2 focus:bg-[#3A3D44FF] focus:rounded-t-md
                  ${activeTab === tab.id
                    ? 'text-white border-white border-b-2 bg-[#3A3D44FF] rounded-t-md'
                    : 'text-gray-400 border-transparent hover:border-gray-500'
                  }
                  `}
                tabIndex={0}
                aria-label={`Switch to ${tab.label} tab`}
              >
                <span className="flex items-center gap-2">
                  {tab.label}
                  {tab.id === 'sample-images' && <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">New</span>}
                </span>
              </button>
            ))}
          </div>
        </DialogHeader>

        {/* Template Content */}
        {activeTab !== 'sample-images' && (
          <div className="flex md:flex-row flex-col gap-6 p-6 flex-1 overflow-hidden">
            <div className="flex flex-col md:w-[700px]">
              <div className="flex flex-wrap gap-4 overflow-y-auto max-h-[calc(90vh-12rem)] pr-4 custom-scroll">
                {currentTemplates.map((template) => (
                  <Card
                    key={template.id}
                    onClick={() => handleTemplateClick(template)}
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleTemplateClick(template)}
                    className={`flex flex-col items-center justify-start p-2 bg-[#3A3D44FF] h-[160px] min-w-[120px] border-2 border-[#4A4D54FF] hover:bg-[#4A4D54FF] cursor-pointer transition-colors duration-150 rounded-lg
                              ${selectedTemplateId === template.id ? 'border-2 border-blue-500 ring-blue-500' : 'ring-1 ring-transparent hover:ring-gray-600'}`}
                  >
                    <CardContent className="px-2 py-0 flex flex-col items-center justify-center">
                      <AspectRatioPreview width={template.width} height={template.height} iconUrl={template.iconUrl} title={template.title}
                        className="!h-[100px] !w-[100px]" />
                      <h4 className="text-xs font-semibold text-gray-200 text-center">{template.title}</h4>
                      <p className="text-xs text-gray-300 text-center">{template.dimensionsText}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-6 flex flex-col items-start justify-start max-w-[300px]">
              <h3 className="text-lg font-medium text-gray-300">Or specify your parameters</h3>
              <div className="w-full">
                <Label htmlFor="projectName" className="text-gray-300 mb-1.5 block">Project name</Label>
                <Input
                  id="projectName"
                  type="text"
                  value={projectName}
                  onChange={handleNameChange}
                  placeholder="My new design"
                  className="bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 w-full">
                <div>
                  <Label htmlFor="canvasWidth" className="text-gray-300 mb-1.5 block">Width (px)</Label>
                  <Input
                    id="canvasWidth"
                    type="number"
                    value={canvasWidth}
                    onChange={handleWidthChange}
                    placeholder="1920"
                    min="1"
                    className="hide-arrows bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 min-w-[100px]"
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
                    className="hide-arrows bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 min-w-[100px]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sample Images */}
        {activeTab === 'sample-images' && (
          <div className="flex flex-col items-center justify-center p-6">
            <h3 className="text-lg font-medium text-gray-300">Sample Images</h3>
          </div>
        )}

        <DialogFooter className="flex flex-row gap-4 px-6 py-4 sm:justify-end bg-[#2D2F34FF] rounded-b-lg border-t border-[#4A4D54FF] w-full">
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
            className="w-[150px] h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold"
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

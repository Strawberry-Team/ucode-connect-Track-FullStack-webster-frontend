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
import { Checkbox } from '@/components/ui/checkbox';
import type { Template } from '@/types/dashboard';
import { SearchIcon, ChevronDownIcon, ChevronUpIcon, FunnelPlus, Square, RectangleHorizontal, RectangleVertical, X, Loader2, Sparkles, ImageIcon, Zap } from 'lucide-react';
import { useUser } from "@/context/user-context"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
// API imports
import { searchPixabayImages, type PixabayImage } from '@/lib/api/pixabay';
import { searchUnsplashImages, type UnsplashImage } from '@/lib/api/unsplash';
import { type GenerateImageOptions, type GeneratedImage } from '@/lib/api/pollinations-ai';

// Template image imports
import template1 from '@/assets/project-templates/template_1_macbook.png';
import template2 from '@/assets/project-templates/template_2_ipad_vertical.png';
import template3 from '@/assets/project-templates/template_3_ipad_horizontal.png';
import template4 from '@/assets/project-templates/template_4_iphone.png';
import template5 from '@/assets/project-templates/template_5_iphone_gloss.png';
import template6 from '@/assets/project-templates/template_6_iphone_horizontal.png';
import template7 from '@/assets/project-templates/template_7_watch.png';
import template8 from '@/assets/project-templates/template_8_iphone_music.png';
import template9 from '@/assets/project-templates/template_9_iphone_instagram_story.png';
import template10 from '@/assets/project-templates/template_10_instagram_post.png';
import template11 from '@/assets/project-templates/template_11_iphone_facebook_post.png';

// Template images interface
interface ProjectTemplate {
  id: string;
  title: string;
  imagePath: string;
  width: number;
  height: number;
  dimensionsText: string;
}

// Helper to extract file extension from a URL
const getFileExtensionFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const lastDotIndex = pathname.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      const extension = pathname.substring(lastDotIndex + 1).toLowerCase();
      // Basic validation for common image extensions
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
        return extension;
      }
    }
  } catch (e) {
    // URL parsing might fail for data URLs or malformed URLs
  }
  return 'png'; // Default to jpg if no valid extension found
};

// Project templates from assets folder
const projectTemplates: ProjectTemplate[] = [
  {
    id: 'macbook',
    title: 'MacBook',
    imagePath: template1,
    width: 1000,
    height: 1000,
    dimensionsText: '1000 x 1000 px'
  },
  {
    id: 'ipad-vertical',
    title: 'iPad Vertical',
    imagePath: template2,
    width: 1000,
    height: 1000,
    dimensionsText: '1000 x 1000 px'
  },
  {
    id: 'ipad-horizontal',
    title: 'iPad Horizontal',
    imagePath: template3,
    width: 1000,
    height: 1000,
    dimensionsText: '1000 x 1000 px'
  },
  {
    id: 'watch',
    title: 'Apple Watch',
    imagePath: template7,
    width: 1000,
    height: 1000,
    dimensionsText: '1000 x 1000 px'
  },
  {
    id: 'iphone-gloss',
    title: 'iPhone Vertical Gloss',
    imagePath: template5,
    width: 1000,
    height: 1000,
    dimensionsText: '1000 x 1000 px'
  },
  {
    id: 'iphone',
    title: 'iPhone Vertical',
    imagePath: template4,
    width: 1000,
    height: 1000,
    dimensionsText: '1000 x 1000 px'
  },
  {
    id: 'iphone-horizontal',
    title: 'iPhone Horizontal',
    imagePath: template6,
    width: 1000,
    height: 1000,
    dimensionsText: '1000 x 1000 px'
  },
  
  {
    id: 'iphone-music',
    title: 'iPhone Music',
    imagePath: template8,
    width: 1000,
    height: 1000,
    dimensionsText: '1000 x 1000 px'
  },
  {
    id: 'iphone-instagram-story',
    title: 'iPhone Instagram Story',
    imagePath: template9,
    width: 1000,
    height: 1000,
    dimensionsText: '1000 x 1000 px'
  },
  {
    id: 'instagram-post',
    title: 'Instagram Post',
    imagePath: template10,
    width: 1000,
    height: 1000,
    dimensionsText: '1000 x 1000 px'
  },
  {
    id: 'iphone-facebook-post',
    title: 'iPhone Facebook Post',
    imagePath: template11,
    width: 1000,
    height: 1000,
    dimensionsText: '1000 x 1000 px'
  },
];

const allTemplates: Record<string, Template[]> = {
  recommended: [
    { id: 'art-grid', title: 'Art grid', dimensionsText: '1000 x 1000 px', width: 1000, height: 1000, iconUrl: 'https://pixlr.com/img/icon/category/art.svg' },
    { id: 'social-post', title: 'Social post', dimensionsText: '1080 x 1080 px', width: 1080, height: 1080, iconUrl: 'https://pixlr.com/img/icon/category/social.svg' },
    { id: 'social-story', title: 'Social story', dimensionsText: '1080 x 1920 px', width: 1080, height: 1920, iconUrl: 'https://pixlr.com/img/icon/category/social.svg' },
    { id: 'web-med', title: 'Web med', dimensionsText: '1600 x 900 px', width: 1600, height: 900, iconUrl: 'https://pixlr.com/img/icon/category/web.svg' },
    { id: 'thumb-720p', title: 'Thumb 720p', dimensionsText: '1280 x 720 px', width: 1280, height: 720, iconUrl: 'https://pixlr.com/img/icon/category/video.svg' },
    { id: 'wide-1080p', title: 'Wide 1080p', dimensionsText: '1920 x 1080 px', width: 1920, height: 1080, iconUrl: 'https://pixlr.com/img/icon/category/video.svg' },
    { id: '12-mpx-43', title: '12 mpx 4:3', dimensionsText: '4032 x 3024 px', width: 4032, height: 3024, iconUrl: 'https://pixlr.com/img/icon/category/landscape.svg' },
    { id: '8-mpx-43', title: '8 mpx 4:3', dimensionsText: '3264 x 2448 px', width: 3264, height: 2448, iconUrl: 'https://pixlr.com/img/icon/category/landscape.svg' },
  ],
  photo: [
    { id: '12-mpx-43-photo', title: '12 mpx 4:3', dimensionsText: '4032 x 3024 px', width: 4032, height: 3024, iconUrl: 'https://pixlr.com/img/icon/category/landscape.svg' },
    { id: '8-mpx-43-photo', title: '8 mpx 4:3', dimensionsText: '3264 x 2448 px', width: 3264, height: 2448, iconUrl: 'https://pixlr.com/img/icon/category/landscape.svg' },
    { id: 'landscape-3x2', title: 'Landscape 3x2 in', dimensionsText: '900 x 600 px', width: 900, height: 600, iconUrl: 'https://pixlr.com/img/icon/category/landscape.svg' },
    { id: 'landscape-6x4', title: 'Landscape 6x4 in', dimensionsText: '1800 x 1200 px', width: 1800, height: 1200, iconUrl: 'https://pixlr.com/img/icon/category/landscape.svg' },
    { id: 'landscape-7x5', title: 'Landscape 7x5 in', dimensionsText: '2100 x 1500 px', width: 2100, height: 1500, iconUrl: 'https://pixlr.com/img/icon/category/landscape.svg' },
    { id: 'landscape-10x8', title: 'Landscape 10x8 in', dimensionsText: '3000 x 2400 px', width: 3000, height: 2400, iconUrl: 'https://pixlr.com/img/icon/category/landscape.svg' },
    { id: 'portrait-2x3', title: 'Portrait 2x3 in', dimensionsText: '600 x 900 px', width: 600, height: 900, iconUrl: 'https://pixlr.com/img/icon/category/portrait.svg' },
    { id: 'portrait-4x6', title: 'Portrait 4x6 in', dimensionsText: '1200 x 1800 px', width: 1200, height: 1800, iconUrl: 'https://pixlr.com/img/icon/category/portrait.svg' },
    { id: 'portrait-5x7', title: 'Portrait 5x7 in', dimensionsText: '1500 x 2100 px', width: 1500, height: 2100, iconUrl: 'https://pixlr.com/img/icon/category/portrait.svg' },
    { id: 'portrait-8x10', title: 'Portrait 8x10 in', dimensionsText: '2400 x 3000 px', width: 2400, height: 3000, iconUrl: 'https://pixlr.com/img/icon/category/portrait.svg' },
  ],
  social: [
    { id: 'instagram-square', title: 'Instagram square', dimensionsText: '1080 x 1080 px', width: 1080, height: 1080, iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/2048px-Instagram_logo_2016.svg.png' },
    { id: 'instagram-post', title: 'Instagram post', dimensionsText: '1080 x 1350 px', width: 1080, height: 1350, iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/2048px-Instagram_logo_2016.svg.png' },
    { id: 'instagram-story', title: 'Instagram story', dimensionsText: '1080 x 1920 px', width: 1080, height: 1920, iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/2048px-Instagram_logo_2016.svg.png' },
    { id: 'facebook-post', title: 'Facebook post', dimensionsText: '1200 x 630 px', width: 1200, height: 630, iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png' },
    { id: 'facebook-story', title: 'Facebook story', dimensionsText: '1080 x 1920 px', width: 1080, height: 1920, iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png' },
    { id: 'facebook-cover', title: 'Facebook cover', dimensionsText: '851 x 315 px', width: 851, height: 315, iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png' },
    { id: 'facebook-profile', title: 'Facebook profile', dimensionsText: '850 x 850 px', width: 850, height: 850, iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png' },
    { id: 'twitter-post', title: 'Twitter post', dimensionsText: '1600 x 900 px', width: 1600, height: 900, iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg' },
    { id: 'twitter-cover', title: 'Twitter cover', dimensionsText: '1500 x 500 px', width: 1500, height: 500, iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg' },
    { id: 'twitter-profile', title: 'Twitter profile', dimensionsText: '400 x 400 px', width: 400, height: 400, iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg' },
    { id: 'youtube-profile', title: 'Youtube profile', dimensionsText: '800 x 800 px', width: 800, height: 800, iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg' },
    { id: 'youtube-thumbnail', title: 'Youtube thumbnail', dimensionsText: '1280 x 720 px', width: 1280, height: 720, iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg' },
    { id: 'youtube-art', title: 'Youtube art', dimensionsText: '2048 x 1152 px', width: 2048, height: 1152, iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg' },
    { id: 'pinterest-pin', title: 'Pinterest pin', dimensionsText: '1000 x 1500 px', width: 1000, height: 1500, iconUrl: 'https://pixlr.com/img/icon/category/pinterest.svg' },
    { id: 'pinterest-square-pin', title: 'Pinterest square pin', dimensionsText: '1000 x 1000 px', width: 1000, height: 1000, iconUrl: 'https://pixlr.com/img/icon/category/pinterest.svg' },
    { id: 'pinterest-wide-pin', title: 'Pinterest wide pin', dimensionsText: '1000 x 2100 px', width: 1000, height: 2100, iconUrl: 'https://pixlr.com/img/icon/category/pinterest.svg' },
  ],
  web: [
    { id: 'web-1994', title: 'Web 1994', dimensionsText: '800 x 600 px', width: 800, height: 600, iconUrl: 'https://pixlr.com/img/icon/category/web.svg' },
    { id: 'web-2004', title: 'Web 2004', dimensionsText: '1280 x 720 px', width: 1280, height: 720, iconUrl: 'https://pixlr.com/img/icon/category/web.svg' },
    { id: 'web-2012', title: 'Web 2012', dimensionsText: '1366 x 768 px', width: 1366, height: 768, iconUrl: 'https://pixlr.com/img/icon/category/web.svg' },
    { id: 'web-2016', title: 'Web 2016', dimensionsText: '1440 x 900 px', width: 1440, height: 900, iconUrl: 'https://pixlr.com/img/icon/category/web.svg' },
    { id: 'web-2020', title: 'Web 2020', dimensionsText: '1920 x 1200 px', width: 1920, height: 1200, iconUrl: 'https://pixlr.com/img/icon/category/web.svg' },
    { id: 'icon-16', title: 'Icon 16', dimensionsText: '16 x 16 px', width: 16, height: 16, iconUrl: 'https://pixlr.com/img/icon/category/icon.svg' },
    { id: 'icon-32', title: 'Icon 32', dimensionsText: '32 x 32 px', width: 32, height: 32, iconUrl: 'https://pixlr.com/img/icon/category/icon.svg' },
    { id: 'icon-64', title: 'Icon 64', dimensionsText: '64 x 64 px', width: 64, height: 64, iconUrl: 'https://pixlr.com/img/icon/category/icon.svg' },
    { id: 'icon-512', title: 'Icon 512', dimensionsText: '512 x 512 px', width: 512, height: 512, iconUrl: 'https://pixlr.com/img/icon/category/icon.svg' },
    { id: 'icon-1024', title: 'Icon 1024', dimensionsText: '1024 x 1024 px', width: 1024, height: 1024, iconUrl: 'https://pixlr.com/img/icon/category/icon.svg' },
  ],
  print: [
    { id: 'letter-8x11', title: 'Letter 8 x 11 in', dimensionsText: '2400 x 3300 px', width: 2400, height: 3300, iconUrl: 'https://pixlr.com/img/icon/category/paper.svg' },
    { id: 'legal-8x14', title: 'Legal 8 x 14 in', dimensionsText: '2400 x 4200 px', width: 2400, height: 4200, iconUrl: 'https://pixlr.com/img/icon/category/paper.svg' },
    { id: 'tabloid-11x17', title: 'Tabloid 11 x 17 in', dimensionsText: '3300 x 5100 px', width: 3300, height: 5100, iconUrl: 'https://pixlr.com/img/icon/category/paper.svg' },
    { id: 'a3-297x420', title: 'A3 297 x 420 mm', dimensionsText: '3508 x 4961 px', width: 3508, height: 4961, iconUrl: 'https://pixlr.com/img/icon/category/paper.svg' },
    { id: 'a4-210x297', title: 'A4 210 x 297 mm', dimensionsText: '2480 x 3508 px', width: 2480, height: 3508, iconUrl: 'https://pixlr.com/img/icon/category/paper.svg' },
    { id: 'a5-148x210', title: 'A5 148 x 210 mm', dimensionsText: '1748 x 2480 px', width: 1748, height: 2480, iconUrl: 'https://pixlr.com/img/icon/category/paper.svg' },
    { id: 'a6-105x148', title: 'A6 105 x 148 mm', dimensionsText: '1240 x 1748 px', width: 1240, height: 1748, iconUrl: 'https://pixlr.com/img/icon/category/paper.svg' },
    { id: 'business-card', title: 'Business card', dimensionsText: '1050 x 600 px', width: 1050, height: 600, iconUrl: 'https://pixlr.com/img/icon/category/business-card.svg' },
    { id: 'flyer-4.25x5.5', title: 'Flyer 4.25 x 5.5 in', dimensionsText: '1275 x 1650 px', width: 1275, height: 1650, iconUrl: 'https://pixlr.com/img/icon/category/flyer.svg' },
    { id: 'flyer-5.5x8.5', title: 'Flyer 5.5 x 8.5 in', dimensionsText: '1650 x 2550 px', width: 1650, height: 2550, iconUrl: 'https://pixlr.com/img/icon/category/flyer.svg' },
    { id: 'flyer-8.5x11', title: 'Flyer 8.5 x 11 in', dimensionsText: '2550 x 3300 px', width: 2550, height: 3300, iconUrl: 'https://pixlr.com/img/icon/category/flyer.svg' },
    { id: 'brochure-8.5x11', title: 'Booklet 8.5 x 11 in', dimensionsText: '2550 x 3300 px', width: 2550, height: 3300, iconUrl: 'https://pixlr.com/img/icon/category/flyer.svg' },
    { id: 'brochure-8.5x14', title: 'Booklet 8.5 x 14 in', dimensionsText: '2550 x 4200 px', width: 2550, height: 4200, iconUrl: 'https://pixlr.com/img/icon/category/flyer.svg' },
    { id: 'brochure-11x17', title: 'Booklet 11 x 17 in', dimensionsText: '3300 x 5100 px', width: 3300, height: 5100, iconUrl: 'https://pixlr.com/img/icon/category/flyer.svg' },
    { id: 'invitation-4x6', title: 'Invitation 4 x 6 in', dimensionsText: '384 x 576 px', width: 384, height: 576, iconUrl: 'https://pixlr.com/img/icon/category/invitation.svg' },
    { id: 'invitation-5x7', title: 'Invitation 5 x 7 in', dimensionsText: '480 x 672 px', width: 480, height: 672, iconUrl: 'https://pixlr.com/img/icon/category/invitation.svg' },
  ],
  video: [
    { id: '360p', title: '360p', dimensionsText: '640 x 360 px', width: 640, height: 360, iconUrl: 'https://pixlr.com/img/icon/category/video.svg' },
    { id: '480p', title: '480p', dimensionsText: '854 x 480 px', width: 854, height: 480, iconUrl: 'https://pixlr.com/img/icon/category/video.svg' },
    { id: '720p', title: '720p', dimensionsText: '1280 x 720 px', width: 1280, height: 720, iconUrl: 'https://pixlr.com/img/icon/category/video.svg' },
    { id: '1080p-hd', title: '1080p HD', dimensionsText: '1920 x 1080 px', width: 1920, height: 1080, iconUrl: 'https://pixlr.com/img/icon/category/video.svg' },
    { id: '1440p-2k', title: '1440p 2K', dimensionsText: '2560 x 1440 px', width: 2560, height: 1440, iconUrl: 'https://pixlr.com/img/icon/category/video.svg' },
    { id: '4k-uhd', title: '4K UHD', dimensionsText: '3840 x 2160 px', width: 3840, height: 2160, iconUrl: 'https://pixlr.com/img/icon/category/video.svg' },
  ]
};

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, width: number, height: number, backgroundImage?: string, setAsBackground?: boolean, imageFileName?: string) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onCreate }) => {
  const { loggedInUser } = useUser()

  type TabType = 'canvas-resolutions' | 'sample-images' | 'sample-backgrounds' | 'ai-images' | 'templates';
  type SubTabType = 'recommended' | 'photo' | 'social' | 'web' | 'print' | 'video';

  const tabs = [
    { id: 'canvas-resolutions' as TabType, label: 'Canvas Resolutions' },
    { id: 'templates' as TabType, label: 'Mockups' },
    { id: 'sample-images' as TabType, label: 'Sample Elements', disabled: !loggedInUser },
    { id: 'sample-backgrounds' as TabType, label: 'Sample Backgrounds', disabled: !loggedInUser },
    { id: 'ai-images' as TabType, label: 'AI-Generated Images', disabled: !loggedInUser },
  ];

  const templateTabs = [
    { id: 'recommended' as SubTabType, label: 'Recommended' },
    { id: 'photo' as SubTabType, label: 'Photo' },
    { id: 'social' as SubTabType, label: 'Social Media' },
    { id: 'web' as SubTabType, label: 'Web' },
    { id: 'print' as SubTabType, label: 'Print' },
    { id: 'video' as SubTabType, label: 'Video' },
  ];

  const [projectName, setProjectName] = useState<string>('');
  const [canvasWidth, setCanvasWidth] = useState<string>('');
  const [canvasHeight, setCanvasHeight] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('canvas-resolutions');
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>('recommended');

  // Pixabay API states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pixabayImages, setPixabayImages] = useState<PixabayImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [setAsBackground, setSetAsBackground] = useState<boolean>(true);
  const [isLoadingImages, setIsLoadingImages] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string>('');

  // Unsplash API states
  const [unsplashSearchQuery, setUnsplashSearchQuery] = useState<string>('');
  const [unsplashImages, setUnsplashImages] = useState<UnsplashImage[]>([]);
  const [selectedUnsplashImageId, setSelectedUnsplashImageId] = useState<string | null>(null);
  const [setUnsplashAsBackground, setSetUnsplashAsBackground] = useState<boolean>(true);
  const [isLoadingUnsplashImages, setIsLoadingUnsplashImages] = useState<boolean>(false);
  const [unsplashSearchError, setUnsplashSearchError] = useState<string>('');

  // Unsplash filters
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedOrientation, setSelectedOrientation] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  // Pixabay filters
  const [selectedPixabayColor, setSelectedPixabayColor] = useState<string>('');
  const [selectedPixabayOrientation, setSelectedPixabayOrientation] = useState<string>('');
  const [showPixabayAdvancedFilters, setShowPixabayAdvancedFilters] = useState<boolean>(false);

  // Track if initial search has been performed to preserve results between tab switches
  const [hasSearchedPixabay, setHasSearchedPixabay] = useState<boolean>(false);
  const [hasSearchedUnsplash, setHasSearchedUnsplash] = useState<boolean>(false);

  // AI Image Generation states
  const [aiPrompt, setAIPrompt] = useState<string>('');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedAIImageId, setSelectedAIImageId] = useState<string | null>(null);
  const [setAIAsBackground, setSetAIAsBackground] = useState<boolean>(true);
  const [isLoadingAIImages, setIsLoadingAIImages] = useState<boolean>(false);
  const [aiError, setAIError] = useState<string>('');
  const [generatingCount, setGeneratingCount] = useState<number>(0);

  // AI generation settings
  const [aiBackgroundType, setAIBackgroundType] = useState<"none" | "white" | "black" | "gradient">("none");
  const [aiImageSize, setAIImageSize] = useState<string>("1024x1024");

  // States for displaying current settings (used only after generation)
  const [generatedAIBackgroundType, setGeneratedAIBackgroundType] = useState<"none" | "white" | "black" | "gradient">("none");
  const [generatedAIImageSize, setGeneratedAIImageSize] = useState<string>("1024x1024");

  // Template states
  const [selectedTemplateImage, setSelectedTemplateImage] = useState<ProjectTemplate | null>(null);
  const [setTemplateAsBackground, setSetTemplateAsBackground] = useState<boolean>(true);

  const currentTemplates = allTemplates[activeSubTab] || [];

  // AI Image Generation options - matching ai-image-generator-modal.tsx
  const aiBackgroundOptions = [
    { value: "none", label: "Standard", textColor: "text-gray-300" },
    { value: "white", label: "White", textColor: "text-white" },
    { value: "black", label: "Black", textColor: "text-gray-900" },
    { value: "gradient", label: "Gradient", textColor: "bg-gradient-to-r from-yellow-400 to-blue-400 bg-clip-text text-transparent" },
  ];

  // AI Image size options
  const aiImageSizes = [
    { value: "512x512", label: "512×512", icon: Square },
    { value: "768x768", label: "768×768", icon: Square },
    { value: "1024x1024", label: "1024×1024", icon: Square },
    { value: "768x1024", label: "768×1024", icon: RectangleVertical },
    { value: "1024x1536", label: "1024×1536", icon: RectangleVertical },
  ];


  // AI Image generation function - copied from ai-image-generator-modal.tsx
  const generateImage = async (options: GenerateImageOptions): Promise<GeneratedImage> => {
    const { prompt, backgroundType = "none", width = 1024, height = 1024} = options;

    if (!prompt.trim()) {
      throw new Error("Please enter an image description");
    }

    let finalPrompt = prompt;

    // Add background specification if selected
    if (backgroundType !== "none") {
      if (backgroundType === "white") {
        finalPrompt += ", on pure white background";
      } else if (backgroundType === "black") {
        finalPrompt += ", on pure black background";
      } else if (backgroundType === "gradient") {
        finalPrompt += ", on colorful gradient background";
      }
    }

    const timestamp = Date.now();
    const randomSeed = Math.floor(Math.random() * 1000000);

    // Fixed URL with correct size parameters
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=${width}&height=${height}&seed=${timestamp + randomSeed}&nologo=true`;

    return {
      url: imageUrl,
      prompt: finalPrompt,
      timestamp: Date.now(),
      id: `ai-image-${timestamp}-${randomSeed}`,
    };
  };

  // AI Image generation - multiple images
  const generateMultipleImages = async (count = 3) => {
    if (!aiPrompt.trim()) {
      setAIError("Please enter an image description");
      return;
    }

    setIsLoadingAIImages(true);
    setAIError("");
    setGeneratedImages([]);
    setSelectedAIImageId(null);
    setGeneratingCount(0);

    // Save settings for display
    setGeneratedAIBackgroundType(aiBackgroundType);
    setGeneratedAIImageSize(aiImageSize.replace("x", " × ") + " px");

    try {
      const [width, height] = aiImageSize.split("x").map(Number);

      const options: GenerateImageOptions = {
        prompt: aiPrompt,
        backgroundType: aiBackgroundType,
        width,
        height,
        noLogo: true,
      };

      // Generate images simultaneously
      const imagePromises = Array.from({ length: count }, async (_, index) => {
        try {
          const result = await generateImage(options);
          // Add image as soon as it is ready
          setGeneratedImages((prev) => [...prev, result]);
          setGeneratingCount((prev) => prev + 1);
          return result;
        } catch (error) {
          console.error(`Error generating image ${index + 1}:`, error);
          setGeneratingCount((prev) => prev + 1);
          return null;
        }
      });

      // Wait for all generations to complete
      const results = await Promise.allSettled(imagePromises);
      const successCount = results.filter((result) => result.status === "fulfilled" && result.value !== null).length;

      if (successCount === 0) {
        throw new Error("Failed to generate any images");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred while generating images";
      setAIError(errorMessage);
    } finally {
      setIsLoadingAIImages(false);
      setGeneratingCount(0);
    }
  };

  // Check if Unsplash API key is configured
  const isUnsplashConfigured = () => {
    const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
    return accessKey && accessKey !== 'your_unsplash_access_key_here';
  };

  // Set default values when modal opens
  useEffect(() => {
    if (isOpen && !projectName && !canvasWidth && !canvasHeight) {
      setProjectName('New Project');
      setCanvasWidth('1000');
      setCanvasHeight('1000');
    }
  }, [isOpen, projectName, canvasWidth, canvasHeight]);

  // Handle global Enter key press for creating project with default settings
  useEffect(() => {
    const handleGlobalKeyPress = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
        // Check if the target is not an input or textarea to avoid conflicts
        const target = e.target as HTMLElement;
        const isInputElement = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true';

        if (!isInputElement) {
          e.preventDefault();
          handleCreateWithDefaults();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleGlobalKeyPress);
    }

    return () => {
      document.removeEventListener('keydown', handleGlobalKeyPress);
    };
  }, [isOpen, projectName, canvasWidth, canvasHeight]);

  // Function to create project with default settings
  const handleCreateWithDefaults = () => {
    const name = projectName.trim() || 'New Project';
    const width = parseInt(canvasWidth, 10) || 1000;
    const height = parseInt(canvasHeight, 10) || 1000;

    let backgroundImage: string | undefined = undefined;
    let shouldSetAsBackground = false;
    let imageFileName: string | undefined = undefined;

    // Determine background image, its type, and file name based on selection
    if (selectedImageId) {
      const selectedImage = pixabayImages.find(img => img.id === selectedImageId);
      if (selectedImage) {
        backgroundImage = selectedImage.webformatURL;
        shouldSetAsBackground = setAsBackground;
        const baseName = selectedImage.tags.split(',')[0].trim();
        const extension = getFileExtensionFromUrl(selectedImage.webformatURL);
        imageFileName = `${baseName}.${extension}`;
      }
    } else if (selectedUnsplashImageId) {
      const selectedImage = unsplashImages.find(img => img.id === selectedUnsplashImageId);
      if (selectedImage) {
        backgroundImage = selectedImage.urls.regular;
        shouldSetAsBackground = setUnsplashAsBackground;
        const baseName = selectedImage.alt_description || selectedImage.user.name + ' image';
        const extension = getFileExtensionFromUrl(selectedImage.urls.regular);
        imageFileName = `${baseName}.${extension}`;
      }
    } else if (selectedAIImageId) {
      const selectedImage = generatedImages.find(img => img.id === selectedAIImageId);
      if (selectedImage) {
        backgroundImage = selectedImage.url;
        shouldSetAsBackground = setAIAsBackground;
        const baseName = `AI Generated: ${selectedImage.prompt.slice(0, 30)}`;
        const extension = getFileExtensionFromUrl(selectedImage.url);
        imageFileName = `${baseName}.${extension}`;
      }
    } else if (selectedTemplateImage) {
      backgroundImage = selectedTemplateImage.imagePath;
      shouldSetAsBackground = setTemplateAsBackground;
      const baseName = selectedTemplateImage.title;
      const extension = getFileExtensionFromUrl(selectedTemplateImage.imagePath);
      imageFileName = `${baseName}.${extension}`;
    }

    onCreate(name, width, height, backgroundImage, shouldSetAsBackground, imageFileName);
    onClose();
  };

  // Unsplash filter options
  const colorOptions = [
    { value: 'black_and_white', label: 'Black & White' },
    { value: 'black', label: 'Black' },
    { value: 'white', label: 'White' },
    { value: 'yellow', label: 'Yellow' },
    { value: 'orange', label: 'Orange' },
    { value: 'red', label: 'Red' },
    { value: 'purple', label: 'Purple' },
    { value: 'magenta', label: 'Magenta' },
    { value: 'green', label: 'Green' },
    { value: 'teal', label: 'Teal' },
    { value: 'blue', label: 'Blue' }
  ];

  const orientationOptions = [
    { value: 'landscape', label: 'Landscape', icon: <RectangleHorizontal className="w-4 h-4" /> },
    { value: 'portrait', label: 'Portrait', icon: <RectangleVertical className="w-4 h-4" /> },
    { value: 'squarish', label: 'Square', icon: <Square className="w-4 h-4" /> }
  ];

  // Pixabay filter options
  const pixabayColorOptions = [
    { value: 'grayscale', label: 'Grayscale' },
    { value: 'transparent', label: 'Transparent' },
    { value: 'red', label: 'Red' },
    { value: 'orange', label: 'Orange' },
    { value: 'yellow', label: 'Yellow' },
    { value: 'green', label: 'Green' },
    { value: 'turquoise', label: 'Turquoise' },
    { value: 'blue', label: 'Blue' },
    { value: 'lilac', label: 'Lilac' },
    { value: 'pink', label: 'Pink' },
    { value: 'white', label: 'White' },
    { value: 'gray', label: 'Gray' },
    { value: 'black', label: 'Black' },
    { value: 'brown', label: 'Brown' }
  ];

  const pixabayOrientationOptions = [
    { value: 'horizontal', label: 'Horizontal', icon: <RectangleHorizontal className="w-4 h-4" /> },
    { value: 'vertical', label: 'Vertical', icon: <RectangleVertical className="w-4 h-4" /> }
  ];

  // Function to get color for text based on color value
  const getColorStyle = (colorValue: string) => {
    const colorMap: Record<string, string> = {
      'black_and_white': 'text-gray-400',
      'black': 'text-gray-900',
      'white': 'text-gray-100',
      'yellow': 'text-yellow-400',
      'orange': 'text-orange-400',
      'red': 'text-red-400',
      'purple': 'text-purple-400',
      'magenta': 'text-pink-400',
      'green': 'text-green-400',
      'teal': 'text-teal-400',
      'blue': 'text-blue-400'
    };

    return colorMap[colorValue] || 'text-gray-300';
  };

  // Function to get Pixabay color styles
  const getPixabayColorStyle = (colorValue: string) => {
    const colorMap: Record<string, string> = {
      'grayscale': 'text-gray-400',
      'transparent': 'text-gray-300',
      'red': 'text-red-400',
      'orange': 'text-orange-400',
      'yellow': 'text-yellow-400',
      'green': 'text-green-400',
      'turquoise': 'text-teal-400',
      'blue': 'text-blue-400',
      'lilac': 'text-purple-400',
      'pink': 'text-pink-400',
      'white': 'text-gray-100',
      'gray': 'text-gray-400',
      'black': 'text-gray-900',
      'brown': 'text-amber-600'
    };

    return colorMap[colorValue] || 'text-gray-300';
  };

  const resetFormStates = () => {
    setProjectName('New Project');
    setCanvasWidth('1000');
    setCanvasHeight('1000');
    setSelectedTemplateId(null);
    setActiveTab('canvas-resolutions');
    setActiveSubTab('recommended');
    // Reset Template states
    setSelectedTemplateImage(null);
    setSetTemplateAsBackground(true);
    // Reset Pixabay states
    setSearchQuery('');
    setPixabayImages([]);
    setSelectedImageId(null);
    setSetAsBackground(true);
    setSearchError('');
    setSelectedPixabayColor('');
    setSelectedPixabayOrientation('');
    setShowPixabayAdvancedFilters(false);
    setHasSearchedPixabay(false);
    // Reset Unsplash states
    setUnsplashSearchQuery('');
    setUnsplashImages([]);
    setSelectedUnsplashImageId(null);
    setSetUnsplashAsBackground(true);
    setUnsplashSearchError('');
    setSelectedColor('');
    setSelectedOrientation('');
    setShowAdvancedFilters(false);
    setHasSearchedUnsplash(false);
    // Reset AI states
    setAIPrompt('');
    setGeneratedImages([]);
    setSelectedAIImageId(null);
    setSetAIAsBackground(true);
    setAIError('');
    setAIBackgroundType('none');
    setAIImageSize('1024 x 1024 px');
    setGeneratedAIBackgroundType('none');
    setGeneratedAIImageSize('1024 x 1024 px');
  };

  // Function to search Pixabay images using API module
  const searchPixabayImagesLocal = async (query: string) => {
    if (!query.trim()) {
      setPixabayImages([]);
      return;
    }

    setIsLoadingImages(true);
    setSearchError('');

    try {
      const data = await searchPixabayImages({
        query: query.trim(),
        color: selectedPixabayColor,
        orientation: selectedPixabayOrientation,
        perPage: 200
      });
      setPixabayImages(data.hits);
    } catch (error) {
      console.error('Error fetching Pixabay images:', error);
      setSearchError(error instanceof Error ? error.message : 'Failed to fetch images. Please try again.');
      setPixabayImages([]);
    } finally {
      setIsLoadingImages(false);
    }
  };

  // Function to search Unsplash images using API module
  const searchUnsplashImagesLocal = async (query: string) => {
    if (!query.trim()) {
      setUnsplashImages([]);
      return;
    }

    setIsLoadingUnsplashImages(true);
    setUnsplashSearchError('');

    try {
      const data = await searchUnsplashImages({
        query: query.trim(),
        color: selectedColor,
        orientation: selectedOrientation,
        perPage: 30
      });
      setUnsplashImages(data.results);
    } catch (error) {
      console.error('Error fetching Unsplash images:', error);
      if (error instanceof Error) {
        setUnsplashSearchError(error.message);
      } else {
        setUnsplashSearchError('Failed to fetch images. Please try again.');
      }
      setUnsplashImages([]);
    } finally {
      setIsLoadingUnsplashImages(false);
    }
  };

  // Auto-search for "ui element" when opening Sample Images tab (only if no search was done before)
  useEffect(() => {
    if (activeTab === 'sample-images' && !hasSearchedPixabay && !searchQuery && pixabayImages.length === 0) {
      setSearchQuery('ui element');
      searchPixabayImagesLocal('ui element');
      setHasSearchedPixabay(true);
    }
  }, [activeTab]);

  // Auto-search for "simple" when opening Sample Backgrounds tab (only if no search was done before)
  useEffect(() => {
    if (activeTab === 'sample-backgrounds' && !hasSearchedUnsplash && !unsplashSearchQuery && unsplashImages.length === 0) {
      if (isUnsplashConfigured()) {
        setUnsplashSearchQuery('simple');
        searchUnsplashImagesLocal('simple');
        setHasSearchedUnsplash(true);
      }
    }
  }, [activeTab]);

  // Auto-search when filters change (if there's already a search query)
  useEffect(() => {
    if (activeTab === 'sample-backgrounds' && unsplashSearchQuery && isUnsplashConfigured()) {
      const timeoutId = setTimeout(() => {
        searchUnsplashImagesLocal(unsplashSearchQuery);
      }, 300); // Debounce for 300ms

      return () => clearTimeout(timeoutId);
    }
  }, [selectedColor, selectedOrientation]);

  // Auto-search when Pixabay filters change (if there's already a search query)
  useEffect(() => {
    if (activeTab === 'sample-images' && searchQuery) {
      const timeoutId = setTimeout(() => {
        searchPixabayImagesLocal(searchQuery);
      }, 300); // Debounce for 300ms

      return () => clearTimeout(timeoutId);
    }
  }, [selectedPixabayColor, selectedPixabayOrientation]);

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      searchPixabayImagesLocal(searchQuery.trim());
      setShowPixabayAdvancedFilters(false); // Close advanced filters menu when searching
      setHasSearchedPixabay(true);
    }
  };

  const handleUnsplashSearchSubmit = () => {
    if (unsplashSearchQuery.trim()) {
      searchUnsplashImagesLocal(unsplashSearchQuery.trim());
      setShowAdvancedFilters(false); // Close advanced filters menu when searching
      setHasSearchedUnsplash(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleUnsplashKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleUnsplashSearchSubmit();
    }
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
    setSelectedTemplateImage(null); // Clear template image selection
    setSelectedImageId(null); // Also clear Pixabay selection
    setSelectedUnsplashImageId(null); // Also clear Unsplash selection
    setSelectedAIImageId(null); // Also clear AI selection
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
    // Don't clear selections when user manually types project name
  }

  const handleNameKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreate();
    }
  };

  const handleDimensionKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreate();
    }
  };

  const handleCreate = () => {
    const widthNum = parseInt(canvasWidth, 10);
    const heightNum = parseInt(canvasHeight, 10);

    let backgroundImage: string | undefined = undefined;
    let shouldSetAsBackground = false;
    let imageFileName: string | undefined = undefined;

    if (projectName.trim() && widthNum > 0 && heightNum > 0) {
      // Determine background image, its type, and file name based on selection
      if (selectedImageId) {
        const selectedImage = pixabayImages.find(img => img.id === selectedImageId);
        if (selectedImage) {
          backgroundImage = selectedImage.webformatURL;
          shouldSetAsBackground = setAsBackground;
          const baseName = selectedImage.tags.split(',')[0].trim();
          const extension = getFileExtensionFromUrl(selectedImage.webformatURL);
          imageFileName = `${baseName}.${extension}`;
        }
      } else if (selectedUnsplashImageId) {
        const selectedImage = unsplashImages.find(img => img.id === selectedUnsplashImageId);
        if (selectedImage) {
          backgroundImage = selectedImage.urls.regular;
          shouldSetAsBackground = setUnsplashAsBackground;
          const baseName = selectedImage.alt_description || selectedImage.user.name + ' image';
          const extension = getFileExtensionFromUrl(selectedImage.urls.regular);
          imageFileName = `${baseName}.${extension}`;
        }
      } else if (selectedAIImageId) {
        const selectedImage = generatedImages.find(img => img.id === selectedAIImageId);
        if (selectedImage) {
          backgroundImage = selectedImage.url;
          shouldSetAsBackground = setAIAsBackground;
          const baseName = `AI Generated: ${selectedImage.prompt.slice(0, 30)}`;
          const extension = getFileExtensionFromUrl(selectedImage.url);
          imageFileName = `${baseName}.${extension}`;
        }
      } else if (selectedTemplateImage) {
        backgroundImage = selectedTemplateImage.imagePath;
        shouldSetAsBackground = setTemplateAsBackground;
        const baseName = selectedTemplateImage.title;
        const extension = getFileExtensionFromUrl(selectedTemplateImage.imagePath);
        imageFileName = `${baseName}.${extension}`;
      }

      onCreate(projectName.trim(), widthNum, heightNum, backgroundImage, shouldSetAsBackground, imageFileName);
      onClose();
    } else {
      alert('Please fill in all fields correctly.');
    }
  };

  const handleTabClick = (tabId: TabType) => {
    setActiveTab(tabId);
    setSelectedTemplateId(null); // Reset selected template when switching tabs

    // Reset template selection when switching away from templates
    if (tabId !== 'templates') {
      setSelectedTemplateImage(null);
    }

    // Reset Pixabay selection when switching away from sample-images (but keep search results and filters)
    if (tabId !== 'sample-images') {
      setSelectedImageId(null);
      setSetAsBackground(true);
      // Only reset filters and close advanced menu when switching to non-sample tabs
      if (tabId !== 'sample-backgrounds' && tabId !== 'ai-images') {
        setSelectedPixabayColor('');
        setSelectedPixabayOrientation('');
        setShowPixabayAdvancedFilters(false);
      }
    }

    // Reset Unsplash selection when switching away from sample-backgrounds (but keep search results and filters)
    if (tabId !== 'sample-backgrounds') {
      setSelectedUnsplashImageId(null);
      setSetUnsplashAsBackground(true);
      // Only reset filters and close advanced menu when switching to non-sample tabs
      if (tabId !== 'sample-images' && tabId !== 'ai-images') {
        setSelectedColor('');
        setSelectedOrientation('');
        setShowAdvancedFilters(false);
      }
    }

    // Reset AI selection when switching away from ai-images (but keep generated images)
    if (tabId !== 'ai-images') {
      setSelectedAIImageId(null);
      setSetAIAsBackground(true);
    }

    // Reset template selection when switching away from templates
    if (tabId !== 'templates') {
      setSelectedTemplateImage(null);
      setSetTemplateAsBackground(true);
    }
  };

  const handleSubTabClick = (subTabId: SubTabType) => {
    setActiveSubTab(subTabId);
    setSelectedTemplateId(null); // Reset selected template when switching sub-tabs
  };

  const handleImageSelect = (imageId: number) => {
    setSelectedImageId(imageId);
    setSelectedTemplateId(null); // Clear template selection
    setSelectedUnsplashImageId(null); // Clear Unsplash selection

    // Auto-fill project name and dimensions based on selected image
    const selectedImage = pixabayImages.find(img => img.id === imageId);
    if (selectedImage) {
      if (!projectName.trim()) {
        setProjectName(`Project with ${selectedImage.tags.split(',')[0].trim()}`);
      }
      setCanvasWidth(selectedImage.webformatWidth.toString());
      setCanvasHeight(selectedImage.webformatHeight.toString());
    }
  };

  const handleUnsplashImageSelect = (imageId: string) => {
    setSelectedUnsplashImageId(imageId);
    setSelectedTemplateId(null); // Clear template selection
    setSelectedImageId(null); // Clear Pixabay selection

    // Auto-fill project name and dimensions based on selected image
    const selectedImage = unsplashImages.find(img => img.id === imageId);
    if (selectedImage) {
      if (!projectName.trim()) {
        const description = selectedImage.alt_description || 'Beautiful image';
        setProjectName(`Project with ${description.split(' ').slice(0, 3).join(' ')}`);
      }
      setCanvasWidth(selectedImage.width.toString());
      setCanvasHeight(selectedImage.height.toString());
    }
  };

  const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setSelectedImageId(null); // Clear selection when searching
  };

  const handleUnsplashSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUnsplashSearchQuery(e.target.value);
    setSelectedUnsplashImageId(null); // Clear selection when searching
  };

  const handleBackgroundCheckboxChange = (checked: boolean) => {
    setSetAsBackground(checked);
  };

  const handleUnsplashBackgroundCheckboxChange = (checked: boolean) => {
    setSetUnsplashAsBackground(checked);
  };

  const handleTemplateBackgroundCheckboxChange = (checked: boolean) => {
    setSetTemplateAsBackground(checked);
  };

  const handleQuickSearch = (term: string) => {
    setSearchQuery(term);
    setSelectedImageId(null); // Clear selection when doing quick search
    searchPixabayImagesLocal(term); // Immediately search for the term
    setHasSearchedPixabay(true);
  };

  const handleUnsplashQuickSearch = (term: string) => {
    setUnsplashSearchQuery(term);
    setSelectedUnsplashImageId(null); // Clear selection when doing quick search
    searchUnsplashImagesLocal(term); // Immediately search for the term
    setHasSearchedUnsplash(true);
  };

  const handleColorToggle = (color: string) => {
    setSelectedColor(prev => prev === color ? '' : color);
  };

  const handleOrientationToggle = (orientation: string) => {
    setSelectedOrientation(prev => prev === orientation ? '' : orientation);
  };

  const handleClearFilters = () => {
    setSelectedColor('');
    setSelectedOrientation('');
  };

  const handleRemoveColorFilter = () => {
    setSelectedColor('');
  };

  const handleRemoveOrientationFilter = () => {
    setSelectedOrientation('');
  };

  const handlePixabayColorToggle = (color: string) => {
    setSelectedPixabayColor(prev => prev === color ? '' : color);
  };

  const handlePixabayOrientationToggle = (orientation: string) => {
    setSelectedPixabayOrientation(prev => prev === orientation ? '' : orientation);
  };

  const handleClearPixabayFilters = () => {
    setSelectedPixabayColor('');
    setSelectedPixabayOrientation('');
  };

  const handleRemovePixabayColorFilter = () => {
    setSelectedPixabayColor('');
  };

  const handleRemovePixabayOrientationFilter = () => {
    setSelectedPixabayOrientation('');
  };

  // AI Image handlers
  const handleAIGenerate = () => {
    generateMultipleImages(3);
  };

  const handleAIBackgroundTypeSelect = (type: "none" | "white" | "black" | "gradient") => {
    setAIBackgroundType(type);
    setSelectedAIImageId(null); // Reset selection when changing background
    setSetAIAsBackground(true); // Reset background setting
  };

  const handleAIImageSizeSelect = (size: string) => {
    setAIImageSize(size);
    setSelectedAIImageId(null); // Reset selection when changing size
    setSetAIAsBackground(true); // Reset background setting
  };

  const handleAIImageSelect = (imageId: string) => {
    setSelectedAIImageId(imageId);
    setSelectedTemplateId(null); // Clear template selection
    setSelectedImageId(null); // Clear Pixabay selection
    setSelectedUnsplashImageId(null); // Clear Unsplash selection

    // Auto-fill project name and dimensions based on selected image
    const selectedImage = generatedImages.find(img => img.id === imageId);
    if (selectedImage) {
      if (!projectName.trim()) {
        setProjectName(`AI Generated: ${selectedImage.prompt.slice(0, 30)}...`);
      }
      setCanvasWidth(aiImageSize.split('x')[0]);
      setCanvasHeight(aiImageSize.split('x')[1]);
    }
  };

  const handleAIBackgroundCheckboxChange = (checked: boolean) => {
    setSetAIAsBackground(checked);
  };

  const handleAIPromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAIPrompt(e.target.value);
    setSelectedAIImageId(null); // Clear selection when changing prompt
  };

  const handleAIKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAIGenerate();
    }
  };

  // Template handlers
  const handleTemplateImageSelect = (template: ProjectTemplate) => {
    setSelectedTemplateImage(template);
    setSelectedTemplateId(null); // Clear regular template selection
    setSelectedImageId(null); // Clear Pixabay selection
    setSelectedUnsplashImageId(null); // Clear Unsplash selection
    setSelectedAIImageId(null); // Clear AI selection
    setSetTemplateAsBackground(true); // Reset background checkbox

    // Auto-fill project name and dimensions based on selected template
    if (!projectName.trim()) {
      setProjectName(template.title);
    }
    setCanvasWidth(template.width.toString());
    setCanvasHeight(template.height.toString());
  };

  const AspectRatioPreview: React.FC<{ width: number; height: number; iconUrl?: string; title?: string, className?: string }> = ({ width, height, iconUrl, title, className }) => {
    const aspectRatio = width / height;

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
              <div key={tab.id} className="flex">
                {tab.disabled ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex relative">
                          <button
                            onClick={() => !tab.disabled && handleTabClick(tab.id)}
                            onKeyDown={(e) => !tab.disabled && (e.key === 'Enter' || e.key === ' ') && handleTabClick(tab.id)}
                            className={`px-4 py-3 text-sm font-medium transition-colors duration-200 border-b-2 hover:text-gray-200 focus:text-white focus:border-white focus:border-b-2 focus:bg-[#3A3D44FF] focus:rounded-t-md
                              ${activeTab === tab.id
                                ? 'text-white border-white border-b-2 bg-[#3A3D44FF] rounded-t-md'
                                : 'text-gray-400 border-transparent hover:border-gray-500'
                              }
                            ${tab.disabled ? 'opacity-50  hover:text-gray-400 hover:border-transparent' : ''}`}
                            tabIndex={tab.disabled ? -1 : 0}
                            aria-label={`Switch to ${tab.label} tab`}
                            disabled={tab.disabled}
                          >
                            <span className="flex items-center gap-2">
                              {tab.label}
                            </span>
                          </button>
                          {(tab.id === 'sample-images' || tab.id === 'sample-backgrounds' || tab.id === 'ai-images') && (
                            <span className="inline-flex items-center px-1 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm border border-blue-400/20 m-auto">
                              <Zap className="w-4 h-4 !text-white" />
                            </span>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" align="center" >
                        <p>Sign in to access {tab.label} tool</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <button
                    onClick={() => handleTabClick(tab.id)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleTabClick(tab.id)}
                    className={`px-4 py-3 text-sm font-medium transition-colors duration-200 border-b-2 hover:text-gray-200 focus:text-white focus:border-white focus:border-b-2 focus:bg-[#3A3D44FF] focus:rounded-t-md
            ${activeTab === tab.id
                        ? 'text-white border-white border-b-2 bg-[#3A3D44FF] rounded-t-md'
                        : 'text-gray-400 border-transparent hover:border-gray-500'
                      }`}
                    tabIndex={0}
                    aria-label={`Switch to ${tab.label} tab`}
                  >
                    <span className="flex items-center gap-2">
                      {tab.label}
                      {(tab.id === 'sample-images' || tab.id === 'sample-backgrounds' || tab.id === 'ai-images') && (
                        <span className="inline-flex items-center px-1 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm border border-blue-400/20 ml-auto">
                          <Zap className="w-4 h-4 !text-white" />
                        </span>
                      )}
                    </span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </DialogHeader>

        {/* Template Content */}
        {activeTab === 'canvas-resolutions' && (
          <div className="flex md:flex-row flex-col gap-6 p-6 py-0 -mt-4 flex-1 overflow-hidden">
            <div className="flex flex-col md:w-[700px]">
              {/* Sub-tabs for templates */}
              <div className="flex border-none border-[#4A4D54FF] mb-4">
                {templateTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleSubTabClick(tab.id)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSubTabClick(tab.id)}
                    className={`px-4 py-2 text-sm font-medium transition-colors duration-200 border-t-2 hover:text-gray-200 focus:text-white focus:border-white focus:border-t-2 focus:bg-[#3A3D44FF] focus:rounded-b-md
                      ${activeSubTab === tab.id
                        ? 'text-white border-white border-t-2 bg-[#3A3D44FF] rounded-b-md'
                        : 'text-gray-400 border-transparent hover:border-gray-500'
                      }`}
                    tabIndex={0}
                    aria-label={`Switch to ${tab.label} sub-tab`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 overflow-y-auto max-h-[calc(90vh-16rem)] pr-4 custom-scroll">
                {currentTemplates.map((template) => (
                  <Card
                    key={template.id}
                    onClick={() => handleTemplateClick(template)}
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleTemplateClick(template)}
                    className={`flex flex-col items-center justify-start p-2 bg-[#3A3D44FF] h-[160px] min-w-[120px] border-2 border-[#4A4D54FF] hover:bg-[#4A4D54FF] cursor-pointer transition-colors duration-150 rounded-lg
                              ${selectedTemplateId === template.id ? 'border-2 border-blue-500 ring-blue-500' : 'ring-1 ring-transparent hover:ring-gray-600'}`}
                  >
                    <CardContent className="px-2 py-0 flex flex-col ">
                      <AspectRatioPreview width={template.width} height={template.height} iconUrl={template.iconUrl} title={template.title}
                        className="!h-[100px] !w-[100px]" />
                      <p className="text-xs text-gray-300 text-start">{template.title}</p>
                      <p className="text-xs text-gray-500 text-start">{template.dimensionsText}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-6 flex flex-col items-start justify-start max-w-[300px] pt-10">
              <h3 className="text-lg font-medium text-gray-300">Or specify your parameters</h3>
              <div className="w-full">
                <Label htmlFor="projectName" className="text-gray-400 mb-1.5 block">Project name</Label>
                <Input
                  id="projectName"
                  type="text"
                  value={projectName}
                  onChange={handleNameChange}
                  onKeyPress={handleNameKeyPress}
                  placeholder="My new design"
                  className="bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 w-full">
                <div>
                  <Label htmlFor="canvasWidth" className="text-gray-400 mb-1.5 block">Width (px)</Label>
                  <Input
                    id="canvasWidth"
                    type="number"
                    value={canvasWidth}
                    onChange={handleWidthChange}
                    onKeyPress={handleDimensionKeyPress}
                    placeholder="1920"
                    min="1"
                    className="hide-arrows bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 min-w-[100px]"
                  />
                </div>
                <div>
                  <Label htmlFor="canvasHeight" className="text-gray-400 mb-1.5 block">Height (px)</Label>
                  <Input
                    id="canvasHeight"
                    type="number"
                    value={canvasHeight}
                    onChange={handleHeightChange}
                    onKeyPress={handleDimensionKeyPress}
                    placeholder="1080"
                    min="1"
                    className="hide-arrows bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 min-w-[100px]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sample Backgrounds */}
        {activeTab === 'sample-backgrounds' && (
          <div className="flex md:flex-row flex-col gap-6 p-6 pb-0 flex-1 overflow-hidden">
            <div className="flex flex-col md:w-[700px]">
              <div className="text-xs text-gray-400 text-end -mt-4.5 mb-0.5 mr-12.5 p-0">
                Powered by{' '}
                <a
                  href="https://unsplash.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Unsplash
                </a>
              </div>

              {/* Search Input */}
              <div className="mb-2">
                <div className="flex gap-2 mb-3">
                  <div className="relative flex-1">
                    <Input
                      id="unsplashSearch"
                      type="text"
                      value={unsplashSearchQuery}
                      onChange={handleUnsplashSearchQueryChange}
                      onKeyPress={handleUnsplashKeyPress}
                      placeholder="Enter keywords (e.g., background, abstract, texture)"
                      className="bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 w-full"
                      disabled={isLoadingUnsplashImages || !isUnsplashConfigured()}
                    />
                  </div>
                  <Button
                    onClick={handleUnsplashSearchSubmit}
                    disabled={isLoadingUnsplashImages || !unsplashSearchQuery.trim() || !isUnsplashConfigured()}
                    className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:opacity-50 text-white font-medium rounded-md transition-colors duration-200 flex items-center gap-2"
                    aria-label="Search background images"
                  >
                    <>
                      <SearchIcon className="w-4 h-4" />
                    </>
                  </Button>
                </div>

                {/* Quick Search Buttons */}
                <div className="space-y-0 flex items-center justify-between mb-0">
                  <div className="flex flex-wrap gap-1">
                    {['minimalist', 'abstract', 'texture', 'gradient', 'blur', 'aesthetic', 'pastel', 'colorful', 'neutral'].map((term) => (
                      <button
                        key={term}
                        onClick={() => handleUnsplashQuickSearch(term)}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleUnsplashQuickSearch(term)}
                        className={`px-2 py-0.5 text-xs rounded-full border transition-all duration-200 hover:bg-blue-500/20 hover:border-blue-500/50 hover:scale-105 focus:bg-blue-500/20 focus:border-blue-500 focus:outline-none focus:scale-105
                          ${unsplashSearchQuery === term
                            ? 'bg-blue-500/30 border-blue-500 text-blue-200 shadow-md'
                            : 'bg-[#3A3D44FF] border-[#4A4D54FF] text-gray-300 hover:text-gray-200'
                          }`}
                        tabIndex={0}
                        aria-label={`Quick search for ${term}`}
                        disabled={isLoadingUnsplashImages || !isUnsplashConfigured()}
                      >
                        {term}
                      </button>
                    ))}
                  </div>

                  {/* Advanced Filters */}
                  <div className="">
                    <button
                      onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                      className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-300 transition-colors duration-200"
                      disabled={!isUnsplashConfigured()}
                    >
                      <FunnelPlus className="w-4 h-4" />
                      {showAdvancedFilters ? (
                        <ChevronUpIcon className="w-4 h-4" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4" />
                      )}
                      {(selectedColor || selectedOrientation) && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {(selectedColor ? 1 : 0) + (selectedOrientation ? 1 : 0)}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
                {showAdvancedFilters && (
                  <div className="mt-3 p-2 bg-[#3A3D44FF] rounded-lg border border-2 border-[#4A4D54FF] space-y-4">
                    {/* Color Filters */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm text-gray-300 ml-2">Colors</label>
                        {selectedColor && (
                          <button
                            onClick={() => setSelectedColor('')}
                            className="px-2 py-0.5 bg-gray-500/50 hover:bg-gray-500 disabled:bg-gray-600 disabled:opacity-50 text-white text-xs rounded-md transition-colors duration-200"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {colorOptions.map((color) => {
                          const isSelected = selectedColor === color.value;
                          const colorClass = getColorStyle(color.value);

                          return (
                            <button
                              key={color.value}
                              onClick={() => handleColorToggle(color.value)}
                              className={`px-2 py-0.5 text-xs ${colorClass} rounded-full border transition-all duration-200 hover:bg-blue-500/20 hover:border-blue-500/50 hover:scale-105 focus:bg-blue-500/20 focus:border-blue-500 focus:outline-none focus:scale-105
                                  ${isSelected
                                  ? 'bg-blue-500/30 border-blue-500 shadow-md'
                                  : 'bg-[#3A3D44FF] border-[#4A4D54FF]'
                                }`}
                              disabled={!isUnsplashConfigured()}
                            >
                              {color.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Orientation Filters */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm text-gray-300 ml-2">Orientation</label>
                        {selectedOrientation && (
                          <button
                            onClick={() => setSelectedOrientation('')}
                            className="px-2 py-0.5 bg-gray-500/50 hover:bg-gray-500 disabled:bg-gray-600 disabled:opacity-50 text-white text-xs rounded-md transition-colors duration-200"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {orientationOptions.map((orientation) => (
                          <button
                            key={orientation.value}
                            onClick={() => handleOrientationToggle(orientation.value)}
                            className={`px-2 py-0.5 text-xs rounded-full border transition-all duration-200 hover:bg-blue-500/20 hover:border-blue-500/50 hover:scale-105 focus:bg-blue-500/20 focus:border-blue-500 focus:outline-none focus:scale-105
                              flex items-center justify-center
                              ${selectedOrientation === orientation.value
                                ? 'bg-blue-500/30 border-blue-500 text-blue-200 shadow-md'
                                : 'bg-[#3A3D44FF] border-[#4A4D54FF] text-gray-300 hover:text-gray-200'
                              }`}
                            disabled={!isUnsplashConfigured()}
                          >
                            {orientation.icon}
                            <span className="ml-1">{orientation.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Clear All Filters Button */}
                    {(selectedColor || selectedOrientation) && (
                      <div className="pt-2 border-t border-[#4A4D54FF] flex justify-end">
                        <button
                          onClick={handleClearFilters}
                          className="px-2 py-0.5 bg-gray-500/50 hover:bg-gray-500 disabled:bg-gray-600 disabled:opacity-50 text-white text-xs rounded-md transition-colors duration-200"
                        >
                          Clear All Filters
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Images Grid */}
              <div className="flex-1 overflow-y-auto max-h-[calc(90vh-16rem)] pr-4 custom-scroll">
                {isLoadingUnsplashImages && (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-gray-400">Loading background images...</div>
                  </div>
                )}

                {unsplashSearchError && (
                  <div className="flex flex-col items-center justify-center py-8 px-4">
                    <div className="text-red-400 text-center mb-4">{unsplashSearchError}</div>
                  </div>
                )}

                {!isLoadingUnsplashImages && !unsplashSearchError && unsplashImages.length === 0 && unsplashSearchQuery && (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-gray-400">No background images found. Try different keywords.</div>
                  </div>
                )}

                {!isLoadingUnsplashImages && unsplashImages.length === 0 && !unsplashSearchQuery && !unsplashSearchError && (
                  <div className="flex flex-col items-center justify-center py-8">
                    {isUnsplashConfigured() ? (
                      <>
                        <div className="text-gray-400 mb-4">Ready to search</div>
                        <div className="text-sm text-gray-500">Use quick search buttons or enter custom keywords and click Search</div>
                      </>
                    ) : (
                      <div className="text-gray-400 text-center px-4">
                        <div className="mb-4">Unsplash API key required</div>
                        <div className="text-sm text-gray-500">Configure your API key to search for background images</div>
                      </div>
                    )}
                  </div>
                )}

                {unsplashImages.length > 0 && (
                  <div className="text-xs text-gray-400 mb-2 text-center flex flex-row items-center justify-center">
                    <div className="flex flex-row items-center justify-center mb-0">
                      <span className="mr-1">Found {unsplashImages.length} images for "{unsplashSearchQuery}"</span>
                    </div>
                    {(selectedColor || selectedOrientation) && (
                      <div className="flex flex-row items-center justify-center gap-2">
                        <span className="text-xs">with filters:</span>
                        {selectedColor && (
                          <div className="flex items-center gap-0.5 bg-[#3A3D44FF] border border-[#4A4D54FF] rounded-full px-1 py-0.5 group bg-blue-500/30 border-blue-500 text-blue-200 shadow-md transition-all duration-200 hover:bg-blue-500/20 hover:border-blue-500/50 hover:scale-105 focus:bg-blue-500/20 focus:border-blue-500 focus:outline-none focus:scale-105">
                            <span className={`text-xs font-medium ${getColorStyle(selectedColor)}`}>
                              {colorOptions.find(c => c.value === selectedColor)?.label}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveColorFilter();
                              }}
                              className="hover:bg-blue-600/50 rounded-full p-0.5 transition-colors duration-200 opacity-70 hover:opacity-100"
                              aria-label="Remove color filter"
                            >
                              <X className="w-3 h-3 text-gray-400 hover:text-gray-200" />
                            </button>
                          </div>
                        )}
                        {selectedOrientation && (
                          <div className="flex items-center gap-0.5 bg-[#3A3D44FF] border border-[#4A4D54FF] rounded-full px-1 py-0.5 group bg-blue-500/30 border-blue-500 text-blue-200 shadow-md transition-all duration-200 hover:bg-blue-500/20 hover:border-blue-500/50 hover:scale-105 focus:bg-blue-500/20 focus:border-blue-500 focus:outline-none focus:scale-105">
                            <div className="text-gray-300">
                              {orientationOptions.find(o => o.value === selectedOrientation)?.icon}
                            </div>
                            <span className="text-xs font-medium text-gray-300">
                              {orientationOptions.find(o => o.value === selectedOrientation)?.label}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveOrientationFilter();
                              }}
                              className="hover:bg-blue-600/50 rounded-full p-0.5 transition-colors duration-200 opacity-70 hover:opacity-100"
                              aria-label="Remove orientation filter"
                            >
                              <X className="w-3 h-3 text-gray-400 hover:text-gray-200" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {unsplashImages.map((image) => (
                    <Card
                      key={image.id}
                      onClick={() => handleUnsplashImageSelect(image.id)}
                      tabIndex={0}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleUnsplashImageSelect(image.id)}
                      className={`group cursor-pointer transition-all duration-200 bg-[#3A3D44FF] border-2 rounded-lg overflow-hidden hover:bg-[#4A4D54FF] p-0
                                  ${selectedUnsplashImageId === image.id ? 'border-blue-500' : 'border-[#4A4D54FF] hover:border-gray-600'}`}
                    >
                      <CardContent className="p-0">
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={image.urls.thumb}
                            alt={image.alt_description || 'Background image'}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-2">
                          <div className="text-xs text-gray-300 truncate" title={image.alt_description || 'Background image'}>
                            {image.alt_description || 'Background image'}
                          </div>
                          <div className="text-xs text-gray-400 mt-1 truncate">
                            by {image.user.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {image.width} × {image.height} px
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6 flex flex-col items-start justify-start max-w-[300px]">
              <h3 className="text-lg font-medium text-gray-300">Project Settings</h3>
              <div className="w-full">
                <Label htmlFor="projectNameUnsplash" className="text-gray-400 mb-1.5 block">Project name</Label>
                <Input
                  id="projectNameUnsplash"
                  type="text"
                  value={projectName}
                  onChange={handleNameChange}
                  onKeyPress={handleNameKeyPress}
                  placeholder="My new design"
                  className="bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 w-full">
                <div>
                  <Label htmlFor="canvasWidthUnsplash" className="text-gray-400 mb-1.5 block">Width (px)</Label>
                  <Input
                    id="canvasWidthUnsplash"
                    type="number"
                    value={canvasWidth}
                    onChange={handleWidthChange}
                    onKeyPress={handleDimensionKeyPress}
                    placeholder="1920"
                    min="1"
                    className="hide-arrows bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 min-w-[100px]"
                  />
                </div>
                <div>
                  <Label htmlFor="canvasHeightUnsplash" className="text-gray-400 mb-1.5 block">Height (px)</Label>
                  <Input
                    id="canvasHeightUnsplash"
                    type="number"
                    value={canvasHeight}
                    onChange={handleHeightChange}
                    onKeyPress={handleDimensionKeyPress}
                    placeholder="1080"
                    min="1"
                    className="hide-arrows bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 min-w-[100px]"
                  />
                </div>
              </div>

              {/* Background Checkbox */}
              {selectedUnsplashImageId && (
                <div className="w-full p-4 bg-[#3A3D44FF] rounded-lg border border-[#4A4D54FF]">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="setUnsplashAsBackground"
                      checked={setUnsplashAsBackground}
                      onCheckedChange={handleUnsplashBackgroundCheckboxChange}
                      className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    />
                    <Label
                      htmlFor="setUnsplashAsBackground"
                      className="text-sm text-gray-400 cursor-pointer"
                    >
                      Set as background
                    </Label>
                  </div>
                </div>
              )}

              {selectedUnsplashImageId && (
                <div className="w-full p-3 bg-[#3A3D44FF] border border-[#4A4D54FF] rounded-lg">
                  <div className="text-sm text-gray-400 mb-2">Selected background:</div>
                  <div className="text-sm text-white-100 mb-1 break-words">
                    {unsplashImages.find(img => img.id === selectedUnsplashImageId)?.alt_description || 'Background image'}
                  </div>
                  <div className="text-sm text-gray-400">
                    by {unsplashImages.find(img => img.id === selectedUnsplashImageId)?.user.name || 'Unsplash'}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sample Images */}
        {activeTab === 'sample-images' && (
          <div className="flex md:flex-row flex-col gap-6 p-6 pb-0 flex-1 overflow-hidden">
            <div className="flex flex-col md:w-[700px]">
              <div className="text-xs text-gray-400 text-end -mt-4.5 mb-0.5 mr-12.5 p-0">
                Powered by{' '}
                <a
                  href="https://pixabay.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Pixabay
                </a>
              </div>

              {/* Search Input */}
              <div className="mb-2">
                <div className="flex gap-2 mb-3">
                  <div className="relative flex-1">
                    <Input
                      id="pixabaySearch"
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchQueryChange}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter keywords (e.g., buttons, icons, interface)"
                      className="bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 w-full"
                      disabled={isLoadingImages}
                    />
                  </div>
                  <Button
                    onClick={handleSearchSubmit}
                    disabled={isLoadingImages || !searchQuery.trim()}
                    className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:opacity-50 text-white font-medium rounded-md transition-colors duration-200 flex items-center gap-2"
                    aria-label="Search images"
                  >
                    <>
                      <SearchIcon className="w-4 h-4" />
                    </>
                  </Button>
                </div>

                {/* Quick Search Buttons */}
                <div className="space-y-0 flex items-center justify-between mb-0">
                  <div className="flex flex-wrap gap-1">
                    {['button', 'icon', 'mockup', 'social media', 'mobile', 'sticker', 'interface', 'design', '2d', '3d'].map((term) => (
                      <button
                        key={term}
                        onClick={() => handleQuickSearch(term)}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleQuickSearch(term)}
                        className={`px-2 py-0.5 text-xs rounded-full border transition-all duration-200 hover:bg-blue-500/20 hover:border-blue-500/50 hover:scale-105 focus:bg-blue-500/20 focus:border-blue-500 focus:outline-none focus:scale-105
                          ${searchQuery === term
                            ? 'bg-blue-500/30 border-blue-500 text-blue-200 shadow-md'
                            : 'bg-[#3A3D44FF] border-[#4A4D54FF] text-gray-300 hover:text-gray-200'
                          }`}
                        tabIndex={0}
                        aria-label={`Quick search for ${term}`}
                        disabled={isLoadingImages}
                      >
                        {term}
                      </button>
                    ))}
                  </div>

                  {/* Advanced Filters */}
                  <div className="">
                    <button
                      onClick={() => setShowPixabayAdvancedFilters(!showPixabayAdvancedFilters)}
                      className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-300 transition-colors duration-200"
                    >
                      <FunnelPlus className="w-4 h-4" />
                      {showPixabayAdvancedFilters ? (
                        <ChevronUpIcon className="w-4 h-4" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4" />
                      )}
                      {(selectedPixabayColor || selectedPixabayOrientation) && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {(selectedPixabayColor ? 1 : 0) + (selectedPixabayOrientation ? 1 : 0)}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
                {showPixabayAdvancedFilters && (
                  <div className="mt-3 p-2 bg-[#3A3D44FF] rounded-lg border border-2 border-[#4A4D54FF] space-y-4">

                    {/* Color Filters */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm text-gray-300 ml-2">Colors</label>
                        {selectedPixabayColor && (
                          <button
                            onClick={() => setSelectedPixabayColor('')}
                            className="px-2 py-0.5 bg-gray-500/50 hover:bg-gray-500 disabled:bg-gray-600 disabled:opacity-50 text-white text-xs rounded-md transition-colors duration-200"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {pixabayColorOptions.map((color) => {
                          const isSelected = selectedPixabayColor === color.value;
                          const colorClass = getPixabayColorStyle(color.value);

                          return (
                            <button
                              key={color.value}
                              onClick={() => handlePixabayColorToggle(color.value)}
                              className={`px-2 py-0.5 text-xs ${colorClass} rounded-full border transition-all duration-200 hover:bg-blue-500/20 hover:border-blue-500/50 hover:scale-105 focus:bg-blue-500/20 focus:border-blue-500 focus:outline-none focus:scale-105
                                  ${isSelected
                                  ? 'bg-blue-500/30 border-blue-500 shadow-md'
                                  : 'bg-[#3A3D44FF] border-[#4A4D54FF]'
                                }`}
                            >
                              {color.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Orientation Filters */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm text-gray-300 ml-2">Orientation</label>
                        {selectedPixabayOrientation && (
                          <button
                            onClick={() => setSelectedPixabayOrientation('')}
                            className="px-2 py-0.5 bg-gray-500/50 hover:bg-gray-500 disabled:bg-gray-600 disabled:opacity-50 text-white text-xs rounded-md transition-colors duration-200"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {pixabayOrientationOptions.map((orientation) => (
                          <button
                            key={orientation.value}
                            onClick={() => handlePixabayOrientationToggle(orientation.value)}
                            className={`px-2 py-0.5 text-xs rounded-full border transition-all duration-200 hover:bg-blue-500/20 hover:border-blue-500/50 hover:scale-105 focus:bg-blue-500/20 focus:border-blue-500 focus:outline-none focus:scale-105
                              flex items-center justify-center
                              ${selectedPixabayOrientation === orientation.value
                                ? 'bg-blue-500/30 border-blue-500 text-blue-200 shadow-md'
                                : 'bg-[#3A3D44FF] border-[#4A4D54FF] text-gray-300 hover:text-gray-200'
                              }`}
                          >
                            {orientation.icon}
                            <span className="ml-1">{orientation.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Clear All Filters Button */}
                    {(selectedPixabayColor || selectedPixabayOrientation) && (
                      <div className="pt-2 border-t border-[#4A4D54FF] flex justify-end">
                        <button
                          onClick={handleClearPixabayFilters}
                          className="px-2 py-0.5 bg-gray-500/50 hover:bg-gray-500 disabled:bg-gray-600 disabled:opacity-50 text-white text-xs rounded-md transition-colors duration-200"
                        >
                          Clear All Filters
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Images Grid */}
              <div className="flex-1 overflow-y-auto max-h-[calc(90vh-16rem)] pr-4 custom-scroll">
                {isLoadingImages && (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-gray-400">Loading images...</div>
                  </div>
                )}

                {searchError && (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-red-400">{searchError}</div>
                  </div>
                )}

                {!isLoadingImages && !searchError && pixabayImages.length === 0 && searchQuery && (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-gray-400">No images found. Try different keywords.</div>
                  </div>
                )}

                {!isLoadingImages && pixabayImages.length === 0 && !searchQuery && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="text-gray-400 mb-4">Ready to search</div>
                    <div className="text-sm text-gray-500">Use quick search buttons or enter custom keywords and click Search</div>
                  </div>
                )}

                {pixabayImages.length > 0 && (
                  <div className="text-xs text-gray-400 mb-2 text-center flex flex-row items-center justify-center">
                    <div className="flex flex-row items-center justify-center mb-0">
                      <span className="mr-1">Found {pixabayImages.length} images for "{searchQuery}"</span>
                    </div>
                    {(selectedPixabayColor || selectedPixabayOrientation) && (
                      <div className="flex flex-row items-center justify-center gap-2">
                        <span className="text-xs">with filters:</span>
                        {selectedPixabayColor && (
                          <div className="flex items-center gap-0.5 bg-[#3A3D44FF] border border-[#4A4D54FF] rounded-full px-1 py-0.5 group bg-blue-500/30 border-blue-500 text-blue-200 shadow-md transition-all duration-200 hover:bg-blue-500/20 hover:border-blue-500/50 hover:scale-105 focus:bg-blue-500/20 focus:border-blue-500 focus:outline-none focus:scale-105">
                            <span className={`text-xs font-medium ${getPixabayColorStyle(selectedPixabayColor)}`}>
                              {pixabayColorOptions.find(c => c.value === selectedPixabayColor)?.label}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemovePixabayColorFilter();
                              }}
                              className="hover:bg-blue-600/50 rounded-full p-0.5 transition-colors duration-200 opacity-70 hover:opacity-100"
                              aria-label="Remove color filter"
                            >
                              <X className="w-3 h-3 text-gray-400 hover:text-gray-200" />
                            </button>
                          </div>
                        )}
                        {selectedPixabayOrientation && (
                          <div className="flex items-center gap-0.5 bg-[#3A3D44FF] border border-[#4A4D54FF] rounded-full px-1 py-0.5 group bg-blue-500/30 border-blue-500 text-blue-200 shadow-md transition-all duration-200 hover:bg-blue-500/20 hover:border-blue-500/50 hover:scale-105 focus:bg-blue-500/20 focus:border-blue-500 focus:outline-none focus:scale-105">
                            <div className="text-gray-300">
                              {pixabayOrientationOptions.find(o => o.value === selectedPixabayOrientation)?.icon}
                            </div>
                            <span className="text-xs font-medium text-gray-300">
                              {pixabayOrientationOptions.find(o => o.value === selectedPixabayOrientation)?.label}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemovePixabayOrientationFilter();
                              }}
                              className="hover:bg-blue-600/50 rounded-full p-0.5 transition-colors duration-200 opacity-70 hover:opacity-100"
                              aria-label="Remove orientation filter"
                            >
                              <X className="w-3 h-3 text-gray-400 hover:text-gray-200" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {pixabayImages.map((image) => (
                    <Card
                      key={image.id}
                      onClick={() => handleImageSelect(image.id)}
                      tabIndex={0}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleImageSelect(image.id)}
                      className={`group cursor-pointer transition-all duration-200 bg-[#3A3D44FF] border-2 rounded-lg overflow-hidden hover:bg-[#4A4D54FF] p-0
                                  ${selectedImageId === image.id ? 'border-blue-500' : 'border-[#4A4D54FF] hover:border-gray-600'}`}
                    >
                      <CardContent className="p-0">
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={image.previewURL}
                            alt={image.tags}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-2">
                          <div className="text-xs text-gray-300 truncate" title={image.tags}>
                            {image.tags}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            by {image.user}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {image.webformatWidth} × {image.webformatHeight} px
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6 flex flex-col items-start justify-start max-w-[300px]">
              <h3 className="text-lg font-medium text-gray-300">Project Settings</h3>

              <div className="w-full">
                <Label htmlFor="projectNameSample" className="text-gray-400 mb-1.5 block">Project name</Label>
                <Input
                  id="projectNameSample"
                  type="text"
                  value={projectName}
                  onChange={handleNameChange}
                  onKeyPress={handleNameKeyPress}
                  placeholder="My new design"
                  className="bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 w-full">
                <div>
                  <Label htmlFor="canvasWidthSample" className="text-gray-400 mb-1.5 block">Width (px)</Label>
                  <Input
                    id="canvasWidthSample"
                    type="number"
                    value={canvasWidth}
                    onChange={handleWidthChange}
                    onKeyPress={handleDimensionKeyPress}
                    placeholder="1920"
                    min="1"
                    className="hide-arrows bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 min-w-[100px]"
                  />
                </div>
                <div>
                  <Label htmlFor="canvasHeightSample" className="text-gray-400 mb-1.5 block">Height (px)</Label>
                  <Input
                    id="canvasHeightSample"
                    type="number"
                    value={canvasHeight}
                    onChange={handleHeightChange}
                    onKeyPress={handleDimensionKeyPress}
                    placeholder="1080"
                    min="1"
                    className="hide-arrows bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 min-w-[100px]"
                  />
                </div>
              </div>

              {/* Background Checkbox */}
              {selectedImageId && (
                <div className="w-full p-4 bg-[#3A3D44FF] rounded-lg border border-[#4A4D54FF]">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="setAsBackground"
                      checked={setAsBackground}
                      onCheckedChange={handleBackgroundCheckboxChange}
                      className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    />
                    <Label
                      htmlFor="setAsBackground"
                      className="text-sm text-gray-400 cursor-pointer"
                    >
                      Set as background
                    </Label>
                  </div>
                </div>
              )}

              {selectedImageId && (
                <div className="w-full p-3 bg-[#3A3D44FF] border border-[#4A4D54FF] rounded-lg">
                  <div className="text-sm text-gray-400 mb-2">Selected element:</div>
                  <div className="text-sm text-white-100 mb-1 break-words">
                    {pixabayImages.find(img => img.id === selectedImageId)?.tags || 'Background image'}
                  </div>
                  <div className="text-sm text-gray-400">
                    by {pixabayImages.find(img => img.id === selectedImageId)?.user || 'Pixabay'}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Images */}
        {activeTab === 'ai-images' && (
          <div className="flex md:flex-row flex-col gap-6 p-6 pb-0 flex-1 overflow-hidden">
            <div className="flex flex-col md:w-[700px]">
              <div className="text-xs text-gray-400 text-end -mt-4.5 mb-0.5 mr-12.5 p-0">
                Powered by{' '}
                <a
                  href="https://pollinations.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Pollinations.ai
                </a>
              </div>

              {/* Input field for prompt */}
              <div>
                <div className="flex gap-2 mb-3">
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      value={aiPrompt}
                      onChange={handleAIPromptChange}
                      onKeyPress={handleAIKeyPress}
                      placeholder="simple aesthetic background, digital art, ui elements"
                      className="bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 w-full"
                      disabled={isLoadingAIImages}
                    />
                  </div>
                  <Button
                    onClick={handleAIGenerate}
                    disabled={isLoadingAIImages || !aiPrompt.trim()}
                    className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:opacity-50 text-white font-medium rounded-md transition-colors duration-200 flex items-center gap-2"
                  >
                    {isLoadingAIImages ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  </Button>
                </div>

                {/* Background options */}
                <div className="space-y-2 mt-2 flex flex-row items-start justify-start">
                  <div className="text-gray-400 text-sm flex items-center justify-center mr-2">Background color:</div>
                  <div className="flex flex-wrap gap-2">
                    {aiBackgroundOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleAIBackgroundTypeSelect(option.value as any)}
                        className={`px-1 py-0.5 text-xs rounded-full border transition-all duration-200 hover:bg-blue-500/20 hover:border-blue-500/50 hover:scale-105 focus:bg-blue-500/20 focus:border-blue-500 focus:outline-none focus:scale-105
                                            ${aiBackgroundType === option.value
                            ? `bg-blue-500/30 border-blue-500 ${option.textColor} shadow-md`
                            : `bg-[#3A3D44FF] border-[#4A4D54FF] ${option.textColor}`
                          }`}
                        disabled={isLoadingAIImages}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size options */}
                <div className="space-y-2 mt-2 flex flex-row items-start justify-start">
                  <div className="text-gray-400 text-sm flex items-center justify-center mr-2">Canvas resolution:</div>
                  <div className="flex flex-wrap gap-2">
                    {aiImageSizes.map((size) => {
                      const Icon = size.icon;
                      return (
                        <button
                          key={size.value}
                          onClick={() => handleAIImageSizeSelect(size.value)}
                          className={`flex items-center gap-1 px-1 py-0.5 text-xs rounded-full border transition-all duration-200 hover:bg-blue-500/20 hover:border-blue-500/50 hover:scale-105 focus:bg-blue-500/20 focus:border-blue-500 focus:outline-none focus:scale-105
                                                ${aiImageSize === size.value
                              ? "bg-blue-500/30 border-blue-500 text-blue-200 shadow-md"
                              : "bg-[#3A3D44FF] border-[#4A4D54FF] text-gray-300 hover:text-gray-200"
                            }`}
                          disabled={isLoadingAIImages}
                        >
                          <Icon className="w-4 h-4" />
                          {size.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Error */}
              {aiError && (
                <div className="text-red-400 text-sm bg-red-500/10 px-3 rounded-md border border-red-500/20 mb-2">
                  {aiError}
                </div>
              )}

              {/* Results - grid of images */}
              <div className="flex-1 pr-4 mt-2">
                {generatedImages.length > 0 && (
                  <div className="text-xs text-gray-400 mb-3 text-center">
                    Generated {generatedImages.length} images with {" "}
                    <span className={aiBackgroundOptions.find((opt) => opt.value === generatedAIBackgroundType)?.textColor}>
                      {aiBackgroundOptions.find((opt) => opt.value === generatedAIBackgroundType)?.label}
                    </span>{" "}
                    background color. <br />
                    <span className="text-yellow-600">Please wait a few seconds</span> for the images to be rendered.
                  </div>
                )}
                {generatedImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {generatedImages.map((image) => (
                      <Card
                        key={image.id}
                        onClick={() => handleAIImageSelect(image.id)}
                        className={`group cursor-pointer transition-all duration-200 bg-[#3A3D44FF] border-2 rounded-lg overflow-hidden hover:bg-[#4A4D54FF] p-0 
                                   ${selectedAIImageId === image.id ? "border-blue-500" : "border-[#4A4D54FF] hover:border-gray-600"}`}
                      >
                        <CardContent className="p-0">
                          <div className="aspect-square overflow-hidden">
                            <img
                              src={image.url}
                              alt="Generated AI image"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              loading="lazy"
                              crossOrigin="anonymous"
                            />
                          </div>
                          <div className="p-2">
                            <div className="text-xs text-gray-300 truncate" title={image.prompt}>
                              AI-Generated Image
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {`${generatedAIImageSize}`}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {!generatedImages.length && !isLoadingAIImages && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <ImageIcon className="w-16 h-16 text-gray-500 mb-4" />
                    <div className="text-gray-400 mb-2">Ready to generate</div>
                    <div className="text-sm text-gray-500">Enter image description and click generate</div>
                  </div>
                )}

                {isLoadingAIImages && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-4" />
                    <div className="text-gray-400">Generating images...</div>
                    <div className="text-sm text-gray-500 mt-2">
                      {generatingCount > 0 ? `${generatingCount}/3 images ready` : "Starting generation..."}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6 flex flex-col items-start justify-start max-w-[300px]">
              <h3 className="text-lg font-medium text-gray-300">Project Settings</h3>
              <div className="w-full">
                <Label htmlFor="projectNameAI" className="text-gray-400 mb-1.5 block">Project name</Label>
                <Input
                  id="projectNameAI"
                  type="text"
                  value={projectName}
                  onChange={handleNameChange}
                  onKeyPress={handleNameKeyPress}
                  placeholder="My new design"
                  className="bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 w-full">
                <div>
                  <Label htmlFor="canvasWidthAI" className="text-gray-400 mb-1.5 block">Width (px)</Label>
                  <Input
                    id="canvasWidthAI"
                    type="number"
                    value={canvasWidth}
                    onChange={handleWidthChange}
                    onKeyPress={handleDimensionKeyPress}
                    placeholder="1920"
                    min="1"
                    className="hide-arrows bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 min-w-[100px]"
                  />
                </div>
                <div>
                  <Label htmlFor="canvasHeightAI" className="text-gray-400 mb-1.5 block">Height (px)</Label>
                  <Input
                    id="canvasHeightAI"
                    type="number"
                    value={canvasHeight}
                    onChange={handleHeightChange}
                    onKeyPress={handleDimensionKeyPress}
                    placeholder="1080"
                    min="1"
                    className="hide-arrows bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 min-w-[100px]"
                  />
                </div>
              </div>

              {/* Background Checkbox */}
              {selectedAIImageId && (
                <div className="w-full p-4 bg-[#3A3D44FF] rounded-lg border border-[#4A4D54FF]">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="setAIAsBackground"
                      checked={setAIAsBackground}
                      onCheckedChange={handleAIBackgroundCheckboxChange}
                      className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    />
                    <Label
                      htmlFor="setAIAsBackground"
                      className="text-sm text-gray-400 cursor-pointer"
                    >
                      Set as background
                    </Label>
                  </div>
                </div>
              )}

              {selectedAIImageId && (
                <div className="w-full p-3 bg-[#3A3D44FF] border border-[#4A4D54FF] rounded-lg">
                  <div className="text-sm text-gray-400 mb-2">Selected image:</div>
                  <div className="text-sm text-white-100 mb-1 break-words">
                    {generatedImages.find(img => img.id === selectedAIImageId)?.prompt || 'AI-Generated Image'}
                  </div>
                  <div className="text-sm text-gray-400">
                    by Pollinations.AI
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="flex md:flex-row flex-col gap-6 p-6 pb-0 flex-1 overflow-hidden">
            <div className="flex flex-col md:w-[700px]">

              <div className="flex-1 overflow-y-auto max-h-[calc(90vh-16rem)] pr-4 custom-scroll">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {projectTemplates.map((template) => (
                    <Card
                      key={template.id}
                      onClick={() => handleTemplateImageSelect(template)}
                      tabIndex={0}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleTemplateImageSelect(template)}
                      className={`group cursor-pointer transition-all duration-200 bg-[#3A3D44FF] border-2 rounded-lg overflow-hidden hover:bg-[#4A4D54FF] p-0 
                                 ${selectedTemplateImage?.id === template.id ? "border-blue-500" : "border-[#4A4D54FF] hover:border-gray-600"}`}
                    >
                      <CardContent className="p-0">
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={template.imagePath}
                            alt={template.title}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200 p-1"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-2">
                          <div className="text-xs text-gray-300 truncate" title={template.title}>
                            {template.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {template.dimensionsText}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6 flex flex-col items-start justify-start max-w-[300px]">
              <h3 className="text-lg font-medium text-gray-300">Project Settings</h3>
              <div className="w-full">
                <Label htmlFor="projectNameTemplate" className="text-gray-400 mb-1.5 block">Project name</Label>
                <Input
                  id="projectNameTemplate"
                  type="text"
                  value={projectName}
                  onChange={handleNameChange}
                  onKeyPress={handleNameKeyPress}
                  placeholder="My new design"
                  className="bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 w-full">
                <div>
                  <Label htmlFor="canvasWidthTemplate" className="text-gray-400 mb-1.5 block">Width (px)</Label>
                  <Input
                    id="canvasWidthTemplate"
                    type="number"
                    value={canvasWidth}
                    onChange={handleWidthChange}
                    onKeyPress={handleDimensionKeyPress}
                    placeholder="1920"
                    min="1"
                    className="hide-arrows bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 min-w-[100px]"
                  />
                </div>
                <div>
                  <Label htmlFor="canvasHeightTemplate" className="text-gray-400 mb-1.5 block">Height (px)</Label>
                  <Input
                    id="canvasHeightTemplate"
                    type="number"
                    value={canvasHeight}
                    onChange={handleHeightChange}
                    onKeyPress={handleDimensionKeyPress}
                    placeholder="1080"
                    min="1"
                    className="hide-arrows bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 min-w-[100px]"
                  />
                </div>
              </div>

              {/* Background Checkbox */}
              {selectedTemplateImage && (
                <div className="w-full p-4 bg-[#3A3D44FF] rounded-lg border border-[#4A4D54FF]">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="setTemplateAsBackground"
                      checked={setTemplateAsBackground}
                      onCheckedChange={handleTemplateBackgroundCheckboxChange}
                      className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    />
                    <Label
                      htmlFor="setTemplateAsBackground"
                      className="text-sm text-gray-400 cursor-pointer"
                    >
                      Set as background
                    </Label>
                  </div>
                </div>
              )}

              {/* Selected Template Info */}
              {selectedTemplateImage && (
                <div className="w-full p-3 bg-[#3A3D44FF] border border-[#4A4D54FF] rounded-lg">
                  <div className="text-sm text-gray-400 mb-2">Selected mockup:</div>
                  <div className="text-sm text-white mb-1">
                    {selectedTemplateImage.title}
                  </div>
                  <div className="text-sm text-gray-400">
                    {selectedTemplateImage.dimensionsText}
                  </div>
                </div>
              )}
            </div>
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

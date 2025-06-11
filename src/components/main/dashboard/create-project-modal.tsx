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
import { SearchIcon, ChevronDownIcon, ChevronUpIcon, Settings2, FunnelPlus, Square, RectangleHorizontal, RectangleVertical, X } from 'lucide-react';

const allTemplates: Record<string, Template[]> = {
  recommended: [
    { id: 'art-grid', title: 'Art grid', dimensionsText: '1000x1000 px', width: 1000, height: 1000, iconUrl: 'https://pixlr.com/img/icon/category/art.svg' },
    { id: 'social-post', title: 'Social post', dimensionsText: '1080x1080 px', width: 1080, height: 1080, iconUrl: 'https://pixlr.com/img/icon/category/social.svg' },
    { id: 'social-story', title: 'Social story', dimensionsText: '1080x1920 px', width: 1080, height: 1920, iconUrl: 'https://pixlr.com/img/icon/category/social.svg' },
    { id: 'web-med', title: 'Web med', dimensionsText: '1600x900 px', width: 1600, height: 900, iconUrl: 'https://pixlr.com/img/icon/category/web.svg' },
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
  onCreate: (name: string, width: number, height: number, backgroundImage?: string, setAsBackground?: boolean) => void;
}

type TabType = 'recommended' | 'photo' | 'social' | 'web' | 'print' | 'video' | 'sample-images' | 'sample-backgrounds';

const tabs = [
  { id: 'recommended' as TabType, label: 'Recommended' },
  { id: 'photo' as TabType, label: 'Photo' },
  { id: 'social' as TabType, label: 'Social' },
  { id: 'web' as TabType, label: 'Web' },
  { id: 'print' as TabType, label: 'Print' },
  { id: 'video' as TabType, label: 'Video' },
  { id: 'sample-images' as TabType, label: 'Sample Elements' },
  { id: 'sample-backgrounds' as TabType, label: 'Sample Backgrounds' },
];

interface PixabayImage {
  id: number;
  webformatURL: string;
  previewURL: string;
  tags: string;
  user: string;
  views: number;
  downloads: number;
  likes: number;
  webformatWidth: number;
  webformatHeight: number;
}

interface PixabayResponse {
  total: number;
  totalHits: number;
  hits: PixabayImage[];
}

interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string;
  user: {
    name: string;
  };
  likes: number;
  width: number;
  height: number;
}

interface UnsplashResponse {
  total: number;
  total_pages: number;
  results: UnsplashImage[];
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [projectName, setProjectName] = useState<string>('');
  const [canvasWidth, setCanvasWidth] = useState<string>('');
  const [canvasHeight, setCanvasHeight] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('recommended');

  // Pixabay API states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pixabayImages, setPixabayImages] = useState<PixabayImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [setAsBackground, setSetAsBackground] = useState<boolean>(false);
  const [isLoadingImages, setIsLoadingImages] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string>('');

  // Unsplash API states
  const [unsplashSearchQuery, setUnsplashSearchQuery] = useState<string>('');
  const [unsplashImages, setUnsplashImages] = useState<UnsplashImage[]>([]);
  const [selectedUnsplashImageId, setSelectedUnsplashImageId] = useState<string | null>(null);
  const [setUnsplashAsBackground, setSetUnsplashAsBackground] = useState<boolean>(false);
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

  const currentTemplates = allTemplates[activeTab] || [];

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

    let backgroundImage: string | undefined;
    let shouldSetAsBackground = false;

    // If user selected an image from Pixabay and wants it as background
    if (selectedImageId && setAsBackground) {
      const selectedImage = pixabayImages.find(img => img.id === selectedImageId);
      if (selectedImage) {
        backgroundImage = selectedImage.webformatURL;
        shouldSetAsBackground = true;
      }
    }

    // If user selected an image from Unsplash and wants it as background
    if (selectedUnsplashImageId && setUnsplashAsBackground) {
      const selectedImage = unsplashImages.find(img => img.id === selectedUnsplashImageId);
      if (selectedImage) {
        backgroundImage = selectedImage.urls.regular;
        shouldSetAsBackground = true;
      }
    }

    // If user selected an image from Pixabay but doesn't want it as background
    if (selectedImageId && !setAsBackground) {
      const selectedImage = pixabayImages.find(img => img.id === selectedImageId);
      if (selectedImage) {
        backgroundImage = selectedImage.webformatURL;
        shouldSetAsBackground = false;
      }
    }

    // If user selected an image from Unsplash but doesn't want it as background
    if (selectedUnsplashImageId && !setUnsplashAsBackground) {
      const selectedImage = unsplashImages.find(img => img.id === selectedUnsplashImageId);
      if (selectedImage) {
        backgroundImage = selectedImage.urls.regular;
        shouldSetAsBackground = false;
      }
    }

    onCreate(name, width, height, backgroundImage, shouldSetAsBackground);
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

  // Function to get background color class based on color value
  const getColorBgStyle = (colorValue: string) => {
    const colorMap: Record<string, string> = {
      'black_and_white': 'bg-gray-400',
      'black': 'bg-gray-900',
      'white': 'bg-gray-100',
      'yellow': 'bg-yellow-400',
      'orange': 'bg-orange-400',
      'red': 'bg-red-400',
      'purple': 'bg-purple-400',
      'magenta': 'bg-pink-400',
      'green': 'bg-green-400',
      'teal': 'bg-teal-400',
      'blue': 'bg-blue-400'
    };

    return colorMap[colorValue] || 'bg-gray-300';
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

  const getPixabayColorBgStyle = (colorValue: string) => {
    const colorMap: Record<string, string> = {
      'grayscale': 'bg-gray-400',
      'transparent': 'bg-gray-300',
      'red': 'bg-red-400',
      'orange': 'bg-orange-400',
      'yellow': 'bg-yellow-400',
      'green': 'bg-green-400',
      'turquoise': 'bg-teal-400',
      'blue': 'bg-blue-400',
      'lilac': 'bg-purple-400',
      'pink': 'bg-pink-400',
      'white': 'bg-gray-100',
      'gray': 'bg-gray-400',
      'black': 'bg-gray-900',
      'brown': 'bg-amber-600'
    };

    return colorMap[colorValue] || 'bg-gray-300';
  };

  const resetFormStates = () => {
    setProjectName('New Project');
    setCanvasWidth('1000');
    setCanvasHeight('1000');
    setSelectedTemplateId(null);
    setActiveTab('recommended');
    // Reset Pixabay states
    setSearchQuery('');
    setPixabayImages([]);
    setSelectedImageId(null);
    setSetAsBackground(false);
    setSearchError('');
    setSelectedPixabayColor('');
    setSelectedPixabayOrientation('');
    setShowPixabayAdvancedFilters(false);
    setHasSearchedPixabay(false);
    // Reset Unsplash states
    setUnsplashSearchQuery('');
    setUnsplashImages([]);
    setSelectedUnsplashImageId(null);
    setSetUnsplashAsBackground(false);
    setUnsplashSearchError('');
    setSelectedColor('');
    setSelectedOrientation('');
    setShowAdvancedFilters(false);
    setHasSearchedUnsplash(false);
  };

  // Function to search Pixabay images
  const searchPixabayImages = async (query: string) => {
    if (!query.trim()) {
      setPixabayImages([]);
      return;
    }

    setIsLoadingImages(true);
    setSearchError('');

    try {
      // Use environment variable or fallback to provided API key
      const apiKey = import.meta.env.VITE_PIXABAY_API_KEY || '50744411-22fa88c98bef12cb7a788e3e6';
      const encodedQuery = encodeURIComponent(query.trim());

      // Build query parameters
      const params = new URLSearchParams();
      params.append('key', apiKey);
      params.append('q', query.trim());
      params.append('image_type', 'all');
      params.append('per_page', '200');
      params.append('safesearch', 'true');
      params.append('order', 'popular');

      // Add color filter if selected
      if (selectedPixabayColor) {
        params.append('colors', selectedPixabayColor);
      }

      // Add orientation filter if selected
      if (selectedPixabayOrientation) {
        params.append('orientation', selectedPixabayOrientation);
      }

      const response = await fetch(`https://pixabay.com/api/?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data: PixabayResponse = await response.json();
      setPixabayImages(data.hits);
    } catch (error) {
      console.error('Error fetching Pixabay images:', error);
      setSearchError('Failed to fetch images. Please try again.');
      setPixabayImages([]);
    } finally {
      setIsLoadingImages(false);
    }
  };

  // Function to search Unsplash images
  const searchUnsplashImages = async (query: string) => {
    if (!query.trim()) {
      setUnsplashImages([]);
      return;
    }

    setIsLoadingUnsplashImages(true);
    setUnsplashSearchError('');

    try {
      const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
      if (!accessKey || accessKey === 'your_unsplash_access_key_here') {
        throw new Error('Unsplash API key not configured. Please add VITE_UNSPLASH_ACCESS_KEY to your .env.local file. Get your free API key from https://unsplash.com/developers');
      }

      const encodedQuery = encodeURIComponent(query.trim());

      // Build query parameters
      const params = new URLSearchParams();
      params.append('query', query.trim());
      params.append('per_page', '30');
      params.append('order_by', 'popular');

      // Add color filter if selected
      if (selectedColor) {
        params.append('color', selectedColor);
      }

      // Add orientation filter if selected
      if (selectedOrientation) {
        params.append('orientation', selectedOrientation);
      }

      const response = await fetch(
        `https://api.unsplash.com/search/photos?${params.toString()}`,
        {
          headers: {
            'Authorization': `Client-ID ${accessKey}`
          }
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid Unsplash API key. Please check your VITE_UNSPLASH_ACCESS_KEY in .env.local file.');
        }
        throw new Error(`API Error: ${response.status}`);
      }

      const data: UnsplashResponse = await response.json();
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
      searchPixabayImages('ui element');
      setHasSearchedPixabay(true);
    }
  }, [activeTab]);

  // Auto-search for "simple" when opening Sample Backgrounds tab (only if no search was done before)
  useEffect(() => {
    if (activeTab === 'sample-backgrounds' && !hasSearchedUnsplash && !unsplashSearchQuery && unsplashImages.length === 0) {
      if (isUnsplashConfigured()) {
        setUnsplashSearchQuery('simple');
        searchUnsplashImages('simple');
        setHasSearchedUnsplash(true);
      }
    }
  }, [activeTab]);

  // Auto-search when filters change (if there's already a search query)
  useEffect(() => {
    if (activeTab === 'sample-backgrounds' && unsplashSearchQuery && isUnsplashConfigured()) {
      const timeoutId = setTimeout(() => {
        searchUnsplashImages(unsplashSearchQuery);
      }, 300); // Debounce for 300ms

      return () => clearTimeout(timeoutId);
    }
  }, [selectedColor, selectedOrientation]);

  // Auto-search when Pixabay filters change (if there's already a search query)
  useEffect(() => {
    if (activeTab === 'sample-images' && searchQuery) {
      const timeoutId = setTimeout(() => {
        searchPixabayImages(searchQuery);
      }, 300); // Debounce for 300ms

      return () => clearTimeout(timeoutId);
    }
  }, [selectedPixabayColor, selectedPixabayOrientation]);

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      searchPixabayImages(searchQuery.trim());
      setShowPixabayAdvancedFilters(false); // Close advanced filters menu when searching
      setHasSearchedPixabay(true);
    }
  };

  const handleUnsplashSearchSubmit = () => {
    if (unsplashSearchQuery.trim()) {
      searchUnsplashImages(unsplashSearchQuery.trim());
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
    setSelectedImageId(null); // Also clear Pixabay selection
    setSelectedUnsplashImageId(null); // Also clear Unsplash selection
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

    if (projectName.trim() && widthNum > 0 && heightNum > 0) {
      let backgroundImage: string | undefined;
      let shouldSetAsBackground = false;

      // If user selected an image from Pixabay and wants it as background
      if (selectedImageId && setAsBackground) {
        const selectedImage = pixabayImages.find(img => img.id === selectedImageId);
        if (selectedImage) {
          backgroundImage = selectedImage.webformatURL;
          shouldSetAsBackground = true;
        }
      }

      // If user selected an image from Unsplash and wants it as background
      if (selectedUnsplashImageId && setUnsplashAsBackground) {
        const selectedImage = unsplashImages.find(img => img.id === selectedUnsplashImageId);
        if (selectedImage) {
          backgroundImage = selectedImage.urls.regular;
          shouldSetAsBackground = true;
        }
      }

      // If user selected an image from Pixabay but doesn't want it as background
      if (selectedImageId && !setAsBackground) {
        const selectedImage = pixabayImages.find(img => img.id === selectedImageId);
        if (selectedImage) {
          backgroundImage = selectedImage.webformatURL;
          shouldSetAsBackground = false;
        }
      }

      // If user selected an image from Unsplash but doesn't want it as background
      if (selectedUnsplashImageId && !setUnsplashAsBackground) {
        const selectedImage = unsplashImages.find(img => img.id === selectedUnsplashImageId);
        if (selectedImage) {
          backgroundImage = selectedImage.urls.regular;
          shouldSetAsBackground = false;
        }
      }

      onCreate(projectName.trim(), widthNum, heightNum, backgroundImage, shouldSetAsBackground);
      onClose();
    } else {
      alert('Please fill in all fields correctly.');
    }
  };

  const handleTabClick = (tabId: TabType) => {
    setActiveTab(tabId);
    setSelectedTemplateId(null); // Reset selected template when switching tabs

    // Reset Pixabay selection when switching away from sample-images (but keep search results and filters)
    if (tabId !== 'sample-images') {
      setSelectedImageId(null);
      setSetAsBackground(false);
      // Only reset filters and close advanced menu when switching to non-sample tabs
      if (tabId !== 'sample-backgrounds') {
        setSelectedPixabayColor('');
        setSelectedPixabayOrientation('');
        setShowPixabayAdvancedFilters(false);
      }
    }

    // Reset Unsplash selection when switching away from sample-backgrounds (but keep search results and filters)
    if (tabId !== 'sample-backgrounds') {
      setSelectedUnsplashImageId(null);
      setSetUnsplashAsBackground(false);
      // Only reset filters and close advanced menu when switching to non-sample tabs
      if (tabId !== 'sample-images') {
        setSelectedColor('');
        setSelectedOrientation('');
        setShowAdvancedFilters(false);
      }
    }
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

  const handleQuickSearch = (term: string) => {
    setSearchQuery(term);
    setSelectedImageId(null); // Clear selection when doing quick search
    searchPixabayImages(term); // Immediately search for the term
    setHasSearchedPixabay(true);
  };

  const handleUnsplashQuickSearch = (term: string) => {
    setUnsplashSearchQuery(term);
    setSelectedUnsplashImageId(null); // Clear selection when doing quick search
    searchUnsplashImages(term); // Immediately search for the term
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
                  {(tab.id === 'sample-images' || tab.id === 'sample-backgrounds') && <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">New</span>}
                </span>
              </button>
            ))}
          </div>
        </DialogHeader>

        {/* Template Content */}
        {activeTab !== 'sample-images' && activeTab !== 'sample-backgrounds' && (
          <div className="flex md:flex-row flex-col gap-6 p-6 pb-0 flex-1 overflow-hidden">
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
                                  ${selectedUnsplashImageId === image.id ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-[#4A4D54FF] hover:border-gray-600'}`}
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
                            {image.width} × {image.height}
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
                  <div className="text-sm text-gray-400 mb-2">Selected Image:</div>
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
                                  ${selectedImageId === image.id ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-[#4A4D54FF] hover:border-gray-600'}`}
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
                            {image.webformatWidth} × {image.webformatHeight}
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
                  <div className="text-sm text-gray-400 mb-2">Selected Image:</div>
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

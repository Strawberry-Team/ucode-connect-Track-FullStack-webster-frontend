import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTool } from '@/context/tool-context';
import CreateProjectModal from './create-project-modal.tsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ImageUp, Plus } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { 
    setStageSize, 
    setIsCanvasManuallyResized, 
    setInitialImage, 
    setRenderableObjects,
    setActiveTool,
    setActiveElement,
    setColor,
    setSecondaryColor,
    setBrushSize,
    setEraserSize,
    setOpacity,
    setEraserOpacity,
    setEraserHardness,
    setZoom,
    setBrushMirrorMode,
    setEraserMirrorMode,
    setCursorPositionOnCanvas,
    addHistoryEntry,
    setIsAddModeActive,
    setCurrentAddToolType,
    setStagePosition,
    setLastDrawingEndTime,
    // Параметры текста
    setTextColor,
    setTextBgColor,
    setTextBgOpacity,
    setFontSize,
    setFontFamily,
    setFontStyles,
    setTextCase,
    setTextAlignment,
    setLineHeight,
    setBackgroundColor,
    setBackgroundOpacity,
    setTextColorOpacity,
    // Параметры фигур
    setFillColor,
    setFillColorOpacity,
    setBorderColor,
    setBorderWidth,
    setBorderStyle,
    setBorderColorOpacity,
    setCornerRadius,
    setShapeType,
    setShapeTransform,
    // Параметры Liquify
    setLiquifyBrushSize,
    setLiquifyStrength,
    setLiquifyMode,
    setIsImageReadyForLiquify,
    // Параметры Blur
    setBlurBrushSize,
    setBlurStrength
  } = useTool();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Функция для сброса всех настроек инструментов к значениям по умолчанию
  const resetAllToolSettings = () => {
    // Сбрасываем активный инструмент и элемент
    setActiveTool(null);
    setActiveElement(null);
    
    // Сбрасываем основные настройки
    setColor("#000000");
    setSecondaryColor("#ffffff");
    setBrushSize(20);
    setEraserSize(20);
    setOpacity(100);
    setEraserOpacity(100);
    setEraserHardness(100);
    setZoom(100);
    setBrushMirrorMode("None");
    setEraserMirrorMode("None");
    
    // Сбрасываем позицию курсора
    setCursorPositionOnCanvas(null);
    
    // Очищаем историю (создаем пустую историю с новым проектом)
    // Устанавливаем пустой массив renderableObjects, и это будет первая запись в истории
    const emptyObjects: never[] = [];
    setRenderableObjects(emptyObjects);
    addHistoryEntry({
      type: 'unknown',
      description: 'Новый проект',
      linesSnapshot: emptyObjects
    });
    
    // Сбрасываем режим добавления
    setIsAddModeActive(false);
    setCurrentAddToolType(null);
    
    // Сбрасываем позицию холста
    setStagePosition({x: 0, y: 0});
    setLastDrawingEndTime(null);
    
    // Сбрасываем настройки текста
    setTextColor("#000000");
    setTextBgColor("transparent");
    setTextBgOpacity(100);
    setFontSize(16);
    setFontFamily("Arial");
    setFontStyles({
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false
    });
    setTextCase("none");
    setTextAlignment("center");
    setLineHeight(1);
    setBackgroundColor("transparent");
    setBackgroundOpacity(100);
    setTextColorOpacity(100);
    
    // Сбрасываем настройки фигур
    setFillColor("#ffffff");
    setFillColorOpacity(100);
    setBorderColor("#000000");
    setBorderWidth(2);
    setBorderStyle("solid");
    setBorderColorOpacity(100);
    setCornerRadius(0);
    setShapeType("rectangle");
    setShapeTransform({
      rotate: 0,
      scaleX: 1,
      scaleY: 1
    });
    
    // Сбрасываем настройки инструмента Liquify
    setLiquifyBrushSize(20);
    setLiquifyStrength(50);
    setLiquifyMode("push");
    setIsImageReadyForLiquify(false);
    
    // Сбрасываем настройки инструмента Blur
    setBlurBrushSize(20);
    setBlurStrength(20);
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleCreateNewProject = (name: string, width: number, height: number) => {
    resetAllToolSettings();
    setInitialImage(null);
    setStageSize({ width, height });
    setIsCanvasManuallyResized(true);
    navigate('/canvas');
  };

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          resetAllToolSettings();
          setInitialImage({ src: img.src, width: img.naturalWidth, height: img.naturalHeight, file });
          setStageSize({ width: img.naturalWidth, height: img.naturalHeight });
          setIsCanvasManuallyResized(true);
          navigate('/canvas');
        };
        img.onerror = () => {
          console.error("Error loading image for size determination.");
        };
        if (e.target?.result) {
          img.src = e.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenImageClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#292C31FF] text-gray-200 p-4">
      <Card className="w-full max-w-md bg-[#25282CFF] border-2 border-dashed border-gray-600 shadow-xl">
        <CardContent className="p-8 flex flex-col items-center text-center">
          <ImageUp size={80} className="mb-6 text-gray-400" strokeWidth={1.5} />
          
          <h2 className="text-2xl font-semibold mb-2 text-gray-100">Start new project</h2>
          <p className="text-gray-400 mb-8">
            Upload an image or start with a blank canvas.
          </p>

          <Button 
            onClick={handleOpenImageClick} 
            className="w-[250px] h-10 rounded-full mb-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold"
          >
            <Plus className="!h-6 !w-6" />
            Open Image
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageFileChange}
            accept="image/*"
            className="hidden"
          />

          <Button 
            onClick={handleOpenModal} 
            variant="outline" 
            className="w-[250px] bg-transparent hover:bg-[#303237FF] border-2 border-[#414448FF] h-10 rounded-full text-[#A7A8AAFF] hover:text-white font-semibold"
          >
            Create new
          </Button>
        </CardContent>
      </Card>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onCreate={handleCreateNewProject}
      />
    </div>
  );
};

export default DashboardPage;
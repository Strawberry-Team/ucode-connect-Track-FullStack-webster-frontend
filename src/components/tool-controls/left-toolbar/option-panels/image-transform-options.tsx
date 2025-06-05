import React from "react";
import { useTool } from "@/context/tool-context";

const ImageTransformOptions: React.FC = () => {
  const { renderableObjects } = useTool();

  // Check if there are any imported images (custom-image type) in the project
  const hasImportedImages = renderableObjects.some(obj => 
    !('tool' in obj) && obj.type === 'custom-image'
  );

  if (!hasImportedImages) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-xs text-[#A8AAACFF] text-center">
          Add an image to the canvas to use the Image Transform tool.
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full">
      <span className="text-xs text-[#A8AAACFF] text-center">
        Select an image on the canvas to start transforming it.
      </span>
    </div>
  );
};

export default ImageTransformOptions; 
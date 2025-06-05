import React from "react";
import { useTool } from "@/context/tool-context";
import { Button } from "@/components/ui/button";
import { Hand } from "lucide-react";

const HandOptions: React.FC = () => {
    const {
        setZoom,
        setStagePosition,
        stageSize: contextStageSize,
        containerSize,
    } = useTool();

    const minZoom = 10; // Consistent with NavigatorPanel
    const maxZoom = 500; // Consistent with NavigatorPanel

    const centerCanvas = (currentZoom: number) => {
        if (!contextStageSize || !containerSize || !setStagePosition) return;
        
        const scale = currentZoom / 100;
        const newX = (containerSize.width - contextStageSize.width * scale) / 2;
        const newY = (containerSize.height - contextStageSize.height * scale) / 2;
        return { x: newX, y: newY };
    };

    const handleSet100Percent = () => {
        const newZoom = 100;
        const newPosition = centerCanvas(newZoom);
        
        if (newPosition) {
            setZoom(newZoom, true);
            setStagePosition(newPosition);
        } else {
            setZoom(newZoom, true);
        }
    };

    const handleFitToScreen = () => {
        if (!contextStageSize || !containerSize || contextStageSize.width === 0 || contextStageSize.height === 0) return;

        const scaleX = containerSize.width / contextStageSize.width;
        const scaleY = containerSize.height / contextStageSize.height;
        let newZoomCalculated = Math.min(scaleX, scaleY) * 100;

        const clampedZoom = Math.round(Math.max(minZoom, Math.min(maxZoom, newZoomCalculated)));
        const newPosition = centerCanvas(clampedZoom);
        
        if (newPosition) {
            setZoom(clampedZoom, true);
            setStagePosition(newPosition);
        } else {
            setZoom(clampedZoom, true);
        }
    };

    const handleFillScreen = () => {
        if (!contextStageSize || !containerSize || contextStageSize.width === 0 || contextStageSize.height === 0) return;

        const scaleX = containerSize.width / contextStageSize.width;
        const scaleY = containerSize.height / contextStageSize.height;
        let zoomToFill = Math.max(scaleX, scaleY) * 100;
        let finalZoom = Math.max(100, zoomToFill); // Ensure zoom is at least 100% as per user request for "Fill"

        const clampedZoom = Math.round(Math.max(minZoom, Math.min(maxZoom, finalZoom)));
        const newPosition = centerCanvas(clampedZoom);
        
        if (newPosition) {
            setZoom(clampedZoom, true);
            setStagePosition(newPosition);
        } else {
            setZoom(clampedZoom, true);
        }
    };

    return (
        <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-2">
                <span className="text-xs text-[#D4D4D5FF]">Панорамування:</span>
                <span className="text-xs text-[#A8A9ABFF]">Клікайте та перетягуйте для переміщення полотна</span>
            </div>
            <div className="flex items-center space-x-3">
                <span className="text-xs text-[#D4D4D5FF]">Масштаб:</span>
            <Button
                onClick={handleSet100Percent}
                variant="ghost"
                className="flex items-center justify-center px-2 min-w-7 min-h-7 hover:bg-[#3F434AFF] text-[#D4D4D5FF] hover:text-white rounded cursor-pointer border-2 border-[#44474AFF]"
                >
                100%
            </Button>
            <Button
                onClick={handleFitToScreen}
                variant="ghost"
                className="flex items-center justify-center px-2 min-w-7 min-h-7 hover:bg-[#3F434AFF] text-[#D4D4D5FF] hover:text-white rounded cursor-pointer border-2 border-[#44474AFF]"
                >
                Adjust
            </Button>
            <Button
                onClick={handleFillScreen}
                variant="ghost"
                className="flex items-center justify-center px-2 min-w-7 min-h-7 hover:bg-[#3F434AFF] text-[#D4D4D5FF] hover:text-white rounded cursor-pointer border-2 border-[#44474AFF]"
                >
                Fill
            </Button>
            </div>
        </div>
    );
};

export default HandOptions; 
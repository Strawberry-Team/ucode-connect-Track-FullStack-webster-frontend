import React, { useRef, useEffect } from 'react';
import { useTool } from '@/context/tool-context';
import { toast } from 'sonner';
import { 
  Brush, 
  Eraser, 
  Plus, 
  Edit3, 
  Trash2, 
  Copy,
  Droplet,
  Waves,
  RotateCcw,
  Undo,
  Redo
} from 'lucide-react';

interface HistoryPanelProps {
  onClose: () => void;
  isSharedHeight?: boolean;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ onClose, isSharedHeight }) => {
  const heightClass = isSharedHeight ? 'h-2/3' : 'h-full';
  const { history, revertToHistoryState, currentHistoryIndex, undo, redo, canUndo, canRedo } = useTool();
  const historyListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (historyListRef.current && currentHistoryIndex !== null) {
      const activeItemElement = historyListRef.current.querySelector(
        `[data-history-index="${currentHistoryIndex}"]`
      );
      if (activeItemElement) {
        activeItemElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [currentHistoryIndex, history.length]);

  const showUndoWarningToast = () => {
    toast.warning("Attention", {
      description: "You have undone some actions. New changes will overwrite the ability to undo.",
      duration: 5000,
    });
  };

  const handleHistoryItemClick = (id: string, index: number) => {
    revertToHistoryState(id);
    
    if (index < currentHistoryIndex) {
      showUndoWarningToast();
    }
  };

  const handleUndoClick = () => {
    if (canUndo) {
      undo();
      showUndoWarningToast();
    }
  };

  const getActionIcon = (type: string) => {
    const iconProps = { size: 16 };
    
    switch (type) {
      case 'brushStroke':
        return <Brush {...iconProps} />;
      case 'eraserStroke':
        return <Eraser {...iconProps} />;
      case 'elementAdded':
        return <Plus {...iconProps} />;
      case 'elementModified':
        return <Edit3 {...iconProps} />;
      case 'elementRemoved':
        return <Trash2 {...iconProps} />;
      case 'elementDuplicated':
        return <Copy {...iconProps} />;
      case 'blurApplied':
        return <Droplet {...iconProps} />;
      case 'liquifyApplied':
        return <Waves {...iconProps} />;
      default:
        return <RotateCcw {...iconProps} />;
    }
  };

  return (
    <div className={`w-full ${heightClass} border-t-1 border-[#171719FF] bg-[#292C31FF] text-[#A8AAACFF] flex flex-col`}>
      
      <div className="flex items-center bg-[#24262BFF] p-1">
        <div className="flex-1 flex items-center gap-1">
          <button 
            onClick={handleUndoClick} 
            disabled={!canUndo}
            className={`p-1 rounded transition-colors ${
              canUndo 
                ? 'text-[#E8E8E8FF] hover:bg-[#414448FF] cursor-pointer' 
                : 'text-gray-600'
            }`}
            title={`Undo ${canUndo ? '(⌘Z)' : ''}`}
          >
            <Undo size={14} />
          </button>
          <button 
            onClick={redo} 
            disabled={!canRedo}
            className={`p-1 rounded transition-colors ${
              canRedo 
                ? 'text-[#E8E8E8FF] hover:bg-[#414448FF] cursor-pointer' 
                : 'text-gray-600'
            }`}
            title={`Redo ${canRedo ? '(⌘⇧Z)' : ''}`}
          >
            <Redo size={14} />
          </button>
        </div>
        <h3 className="text-xs font-semibold text-[#E8E8E8FF] text-center">History</h3>
        <div className="flex-1 flex justify-end">
          <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-white text-2xl mr-1 leading-none">×</button>
        </div>
      </div>

   
      <div className="flex-1 py-2 space-y-1 custom-scroll overflow-y-auto" ref={historyListRef}>
        {history.length === 0 ? (
          <p className="px-4 text-sm text-[#C1C1C1FF]">The action history is empty</p>
        ) : (
          history.map((entry, index) => {
            const isCurrentActive = index === currentHistoryIndex;
            const itemClass = `text-sm px-4 py-2 cursor-pointer transition-colors flex items-center gap-2 ${
              entry.isActive 
                ? `text-[#E8E8E8FF] ${isCurrentActive ? 'text-white bg-[#498FE0FF]' : 'hover:bg-[#414448FF]'}` 
                : 'text-gray-500 line-through hover:bg-[#303338FF]'
            }`;

            return (
              <div 
                key={entry.id} 
                className={itemClass}
                onClick={() => handleHistoryItemClick(entry.id, index)}
                onKeyDown={(e) => e.key === 'Enter' && handleHistoryItemClick(entry.id, index)}
                role="button"
                tabIndex={0}
                data-history-index={index}
              >
                <span className="flex items-center mr-2">{getActionIcon(entry.type)}</span>
                <span className="flex-1">{entry.description}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HistoryPanel; 
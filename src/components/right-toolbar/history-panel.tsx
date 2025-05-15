import React from 'react';
import { useTool } from '@/context/tool-context';
import { toast } from 'sonner';

interface HistoryPanelProps {
  onClose: () => void;
  isSharedHeight?: boolean;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ onClose, isSharedHeight }) => {
  const heightClass = isSharedHeight ? 'h-[520px]' : 'h-full';
  const { history, revertToHistoryState, currentHistoryIndex } = useTool();

  const handleHistoryItemClick = (id: string, index: number) => {
    revertToHistoryState(id);
    
   
    if (index < currentHistoryIndex) {
      toast.warning("Attention", {
        description: "You have undone some actions. New changes will overwrite the ability to go back.",
        duration: 5000,
      });
    }
  };

  return (
    <div className={`w-full ${heightClass} border-t-1 border-[#171719FF] bg-[#292C31FF] text-[#A8AAACFF] flex flex-col`}>
      
      <div className="flex items-center bg-[#24262BFF] p-1">
        <div className="flex-1"></div>
        <h3 className="text-[15px] font-semibold text-[#E8E8E8FF] text-center">History</h3>
        <div className="flex-1 flex justify-end">
          <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-white text-2xl mr-1 leading-none">×</button>
        </div>
      </div>

   
      <div className="flex-1 py-2 space-y-1 custom-scroll overflow-y-auto">
        {history.length === 0 ? (
          <p className="px-4 text-sm text-[#C1C1C1FF]">The action history is empty</p>
        ) : (
          history.map((entry, index) => {
            const isCurrentActive = index === currentHistoryIndex;
            const itemClass = `text-sm px-4 py-2 cursor-pointer transition-colors ${
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
               
              >
                {entry.description}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HistoryPanel; 
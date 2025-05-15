import React from 'react';
import { useTool } from '@/context/tool-context';

interface HistoryPanelProps {
  onClose: () => void;
  isSharedHeight?: boolean;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ onClose, isSharedHeight }) => {
  const heightClass = isSharedHeight ? 'h-[520px]' : 'h-full';
  const { history, revertToHistoryState, currentHistoryIndex } = useTool();

  const handleHistoryItemClick = (id: string) => {
    revertToHistoryState(id);
  };

  return (
    <div className={`w-full ${heightClass} border-t-1 border-[#171719FF] bg-[#292C31FF] text-[#A8AAACFF] flex flex-col`}>
      {/* Заголовок панели с тёмным фоном */}
      <div className="flex items-center bg-[#24262BFF] p-1">
        <div className="flex-1"></div>
        <h3 className="text-[15px] font-semibold text-[#E8E8E8FF] text-center">History</h3>
        <div className="flex-1 flex justify-end">
          <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-white text-2xl mr-1 leading-none">×</button>
        </div>
      </div>

      {/* Основное содержимое панели */}
      <div className="flex-1 py-2 space-y-1 custom-scroll overflow-y-auto">
        {history.length === 0 ? (
          <p className="px-4 text-sm text-[#C1C1C1FF]">The action history is empty</p>
        ) : (
          history.map((entry, index) => {
            // Теперь index - это и есть оригинальный индекс в массиве history
            // Базовый класс для всех элементов истории
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
                onClick={() => handleHistoryItemClick(entry.id)}
                onKeyDown={(e) => e.key === 'Enter' && handleHistoryItemClick(entry.id)}
                role="button"
                tabIndex={0}
                aria-label={`Вернуться к: ${entry.description}`}
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
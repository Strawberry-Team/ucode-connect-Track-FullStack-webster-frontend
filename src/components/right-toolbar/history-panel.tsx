import React from 'react';

interface HistoryPanelProps {
  onClose: () => void;
  isSharedHeight?: boolean;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ onClose, isSharedHeight }) => {
  const heightClass = isSharedHeight ? 'h-[800px]' : 'h-full';
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
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <p className="text-sm text-[#C1C1C1FF]">History panel content will be here.</p>
        {/* Здесь будет список действий с кнопками отмены */}
      </div>
    </div>
  );
};

export default HistoryPanel; 
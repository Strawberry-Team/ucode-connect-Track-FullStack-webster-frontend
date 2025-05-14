import React from 'react';

interface HistoryPanelProps {
  onClose: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ onClose }) => {
  return (
    <div className="w-64 h-full bg-[#2D2F34FF] text-white p-4 border-l border-[#44474AFF]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">History</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          &times; {/* Простой крестик для закрытия */}
        </button>
      </div>
      <p className="text-sm text-gray-300">History panel content will be here.</p>
      {/* Здесь будет список действий с кнопками отмены */}
    </div>
  );
};

export default HistoryPanel; 
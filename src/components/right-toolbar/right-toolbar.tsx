import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CustomTooltip, CustomTooltipContent, CustomTooltipTrigger } from '@/components/ui/custom-tooltip';
import { Map, History as HistoryIcon } from 'lucide-react'; // Пример иконок
import NavigatorPanel from './navigator-panel';
import HistoryPanel from './history-panel';


const RightToolbar: React.FC = () => {
  const [activePanel, setActivePanel] = useState<string | null>(null); // 'navigator' или 'history'

  const togglePanel = (panelId: string) => {
    setActivePanel(prev => (prev === panelId ? null : panelId));
  };

  return (
    <div className="h-full flex fixed right-0 top-0 z-40">
      {/* Сама панель с кнопками (вертикальная) */}
      <div className="w-12 bg-[#292C31FF] border-l-2 border-[#44474AFF] flex flex-col items-center py-2 pt-[60px]">
        <div className="space-y-1">
          <CustomTooltip>
            <CustomTooltipTrigger asChild>
              <Button
                variant="ghost"
                className={`w-10 h-10 group hover:bg-[#383A3EFF] ${activePanel === 'navigator' ? 'bg-[#414448FF]' : ''}`}
                onClick={() => togglePanel('navigator')}
              >
                <Map className={`!w-4.5 !h-4.5 ${activePanel === 'navigator' ? 'text-white' : 'text-[#A8AAACFF] group-hover:text-white'}`} />
              </Button>
            </CustomTooltipTrigger>
            <CustomTooltipContent side="left" align="center" title="Navigator">
              <p>Open navigator panel</p>
            </CustomTooltipContent>
          </CustomTooltip>

          <CustomTooltip>
            <CustomTooltipTrigger asChild>
              <Button
                variant="ghost"
                className={`w-10 h-10 group hover:bg-[#383A3EFF] ${activePanel === 'history' ? 'bg-[#414448FF]' : ''}`}
                onClick={() => togglePanel('history')}
              >
                <HistoryIcon className={`!w-4.5 !h-4.5 ${activePanel === 'history' ? 'text-white' : 'text-[#A8AAACFF] group-hover:text-white'}`} />
              </Button>
            </CustomTooltipTrigger>
            <CustomTooltipContent side="left" align="center" title="History">
              <p>Open history panel</p>
            </CustomTooltipContent>
          </CustomTooltip>
        </div>
      </div>

      {/* Выдвигающиеся панели */}
      {activePanel === 'navigator' && <NavigatorPanel onClose={() => setActivePanel(null)} />}
      {activePanel === 'history' && <HistoryPanel onClose={() => setActivePanel(null)} />}
    </div>
  );
};

export default RightToolbar; 
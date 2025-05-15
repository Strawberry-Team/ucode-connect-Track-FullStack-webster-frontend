import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Map, History as HistoryIcon } from 'lucide-react'; // Пример иконок
import NavigatorPanel from './navigator-panel';
import HistoryPanel from './history-panel';

interface ActivePanelsState {
  navigator: boolean;
  history: boolean;
}

const RightToolbar: React.FC = () => {
  const [activePanels, setActivePanels] = useState<ActivePanelsState>({ navigator: false, history: false });

  const togglePanel = (panelId: keyof ActivePanelsState) => {
    setActivePanels(prev => ({
      ...prev,
      [panelId]: !prev[panelId],
    }));
  };

  const anyPanelsActive = activePanels.navigator || activePanels.history;
  const bothPanelsActive = activePanels.navigator && activePanels.history;

  return (
    <div className={`h-full border-l-1 border-[#171719FF] flex items-center z-40 ${anyPanelsActive ? 'bg-transparent' : ''}`}>
      {anyPanelsActive && (
        <div className="h-full flex flex-col w-64 border-r-1 border-[#171719FF]">
          {activePanels.navigator && (
            <NavigatorPanel 
              onClose={() => togglePanel('navigator')} 
              isSharedHeight={bothPanelsActive} 
            />
          )}
          {activePanels.history && (
            <HistoryPanel 
              onClose={() => togglePanel('history')} 
              isSharedHeight={bothPanelsActive} 
            />
          )}
        </div>
      )}

      <div className="h-full w-15 bg-[#292C31FF] border-t-2  border-[#44474AFF] flex flex-col items-center py-2">
        <div className="w-full flex flex-col items-center space-y-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={`w-10 h-10 group hover:bg-[#383A3EFF] ${activePanels.navigator ? 'bg-[#414448FF]' : ''}`}
                onClick={() => togglePanel('navigator')}
              >
                <Map className={`!w-4.5 !h-4.5 ${activePanels.navigator ? 'text-white' : 'text-[#A8AAACFF] group-hover:text-white'}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" align="center" title="Navigator">
              <p>Open navigator panel</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={`w-10 h-10 group hover:bg-[#383A3EFF] ${activePanels.history ? 'bg-[#414448FF]' : ''}`}
                onClick={() => togglePanel('history')}
              >
                <HistoryIcon className={`!w-4.5 !h-4.5 ${activePanels.history ? 'text-white' : 'text-[#A8AAACFF] group-hover:text-white'}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" align="center" title="History">
              <p>Open history panel</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default RightToolbar; 
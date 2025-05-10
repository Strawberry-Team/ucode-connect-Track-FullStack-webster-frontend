import React from 'react';
import Header from "@/components/header/header";
import Canvas from "@/components/canvas/canvas";
import { ToolProvider } from "@/context/tool-context";
import Toolbar from "@/components/sidebar/toolbar";
import PropertiesPanel from "@/components/sidebar/properties-panel";

const App: React.FC = () => {
    return (
        <ToolProvider>
          <div className="flex flex-col h-screen bg-[#2a2a2a] text-gray-200">
            <Header />
            <div className="flex flex-1 overflow-hidden">
              <Toolbar />
              <div className="flex flex-col flex-1">
                <PropertiesPanel />
                <div className="flex-1 overflow-hidden bg-[#1e1e1e] relative">
                  <Canvas />
                </div>
              </div>
            </div>
          </div>
        </ToolProvider>
      );
};

export default App;
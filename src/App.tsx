import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Header from "@/components/header/header";
import Canvas from "@/components/canvas/canvas";
import { ToolProvider, useTool } from "@/context/tool-context";
import Toolbar from "@/components/tool-controls/toolbar";
import PropertiesPanel from "@/components/tool-controls/properties-panel";
import { ElementsManagerProvider } from "@/context/elements-manager-context";
import DashboardPage from "@/components/dashboard/dashboard-page";
import RightToolbar from "@/components/right-toolbar/right-toolbar";

// Компонент для основной страницы с холстом
const CanvasPage: React.FC = () => {
  const {
    color,
    secondaryColor,
    opacity,
    fontSize,
    fontFamily,
    fontStyles,
    textCase,
    textAlignment,
    lineHeight,
    backgroundColor,
    backgroundOpacity,
    borderColor,
    borderWidth,
    borderStyle,
    cornerRadius
  } = useTool();

  const elementsManagerOptions = {
    color,
    secondaryColor,
    opacity,
    fontSize,
    fontFamily,
    fontStyles,
    textCase,
    textAlignment,
    lineHeight,
    backgroundColor,
    backgroundOpacity,
    borderColor,
    borderWidth,
    borderStyle,
    cornerRadius
  };

  return (
    <ElementsManagerProvider options={elementsManagerOptions}>
      <div className="flex flex-col h-screen bg-[#292C31FF] text-gray-200 overflow-hidden">
        <Header />
        <PropertiesPanel />
        <div className="flex flex-1 overflow-hidden">
          <Toolbar />
          <div className="flex-1 overflow-hidden bg-[#1e1e1e] relative">
            <Canvas />
          </div>
          <RightToolbar />
        </div>
      </div>
    </ElementsManagerProvider>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <ToolProvider>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/canvas" element={<CanvasPage />} />
        </Routes>
      </ToolProvider>
    </Router>
  );
};

export default App;
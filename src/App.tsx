import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from "@/components/header/header";
import Canvas from "@/components/canvas/canvas";
import { ToolProvider, useTool } from "@/context/tool-context";
import Toolbar from "@/components/tool-controls/toolbar";
import PropertiesPanel from "@/components/tool-controls/properties-panel";
import { ElementsManagerProvider } from "@/context/elements-manager-context";
import DashboardPage from "@/components/dashboard/dashboard-page";
import RightToolbar from "@/components/right-toolbar/right-toolbar";
import { Toaster } from "@/components/ui/sonner";
import ConfirmEmailPage from '@/components/auth/confirm-email-page';
import ProfilePage from '@/components/profile/profile-page';
import { useUser } from '@/context/user-context';

// Компонент для проверки перенаправления при обновлении страницы
const RedirectHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loggedInUser } = useUser();

  useEffect(() => {
    // Проверяем, был ли переход на страницу холста через прямое обновление страницы
    const isDirectPageLoad = !sessionStorage.getItem('navigationOccurred');
    const isCanvasPage = location.pathname === '/canvas';

    // Если это прямая загрузка страницы (не через навигацию) и мы на странице холста
    if (isDirectPageLoad && isCanvasPage) {
      navigate('/', { replace: true });
    }

    // Устанавливаем флаг, что произошла навигация
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('navigationOccurred');
    };

    // Если это навигация (не прямая загрузка), устанавливаем флаг
    if (!isDirectPageLoad || !isCanvasPage) {
      sessionStorage.setItem('navigationOccurred', 'true');
    }

    // Добавляем обработчик события перед выгрузкой страницы
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [navigate, location.pathname]);

  return <>{children}</>;
};

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
        <RedirectHandler>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/canvas" element={<CanvasPage />} />
            <Route path="/auth/confirm-email/:confirm_token" element={<ConfirmEmailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </RedirectHandler>
        <Toaster position="top-center" />
      </ToolProvider>
    </Router>
  );
};

export default App;
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/context/user-context';
import DashboardPage from '@/components/main/dashboard/dashboard-page';
import ProductLanding from './landing/product-landing';
import { Button } from '../ui/button';
import { useLocation } from 'react-router-dom';
import { useNavigate } from "react-router-dom"
import { Blend } from 'lucide-react';
import Cookies from 'js-cookie';
import { getCurrentAuthenticatedUser } from '@/services/user-service';
import { toast } from 'sonner';
import type { User as AuthUser } from '@/types/auth';

const HomePage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'landing' | 'dashboard'>('landing');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isGoogleAuthSuccess, setIsGoogleAuthSuccess] = useState(false);
  const { loggedInUser, isLoadingAuth, loginUserContext } = useUser();
  const location = useLocation();
  const navigate = useNavigate()

  // Handle Google authentication tokens
  useEffect(() => {
    const processAuthTokens = async () => {
      const params = new URLSearchParams(window.location.search);
      const accessToken = params.get('accessToken');
      const refreshToken = params.get('refreshToken');

      if (accessToken && refreshToken) {
        Cookies.set('accessToken', accessToken, { expires: 1, path: '/', sameSite: 'lax' });
        Cookies.set('refreshToken', refreshToken, { expires: 7, path: '/', sameSite: 'lax' });
        
        // Clean URL from tokens
        window.history.replaceState(null, '', window.location.pathname);

        try {
          const user = await getCurrentAuthenticatedUser();
          if (user) {
            loginUserContext(user as AuthUser);
            setIsGoogleAuthSuccess(true);
            toast.success("Logged In", { description: "Successfully authenticated via Google.", duration: 3000 });
          } else {
            toast.error("Authentication Failed", { description: "Could not verify Google session.", duration: 3000 });
            Cookies.remove('accessToken', { path: '/' });
            Cookies.remove('refreshToken', { path: '/' });
          }
        } catch (error) {
          console.error("Error fetching user after Google login:", error);
          toast.error("Authentication Error", { description: "An error occurred while authenticating.", duration: 3000 });
          Cookies.remove('accessToken', { path: '/' });
          Cookies.remove('refreshToken', { path: '/' });
        }
      }
    };

    if (!loggedInUser && !isLoadingAuth) {
      processAuthTokens();
    }
  }, [isLoadingAuth, loggedInUser, loginUserContext]);

  // Check if the URL has an anchor
  const hasAnchor = window.location.hash && (window.location.hash.includes('#features') || window.location.hash.includes('#team') || window.location.hash.includes('#possibilities'));

  // Determine which view to show
  useEffect(() => {
    if (location.state?.showDashboard === false || hasAnchor) {
      setViewMode('landing');
    } else if (loggedInUser && !hasAnchor && location.state?.showDashboard !== false) {
      setViewMode('dashboard');
    } else {
      setViewMode('landing');
    }
  }, [loggedInUser, location.state, hasAnchor]);

  const toggleView = () => {
    setViewMode(viewMode === 'landing' ? 'dashboard' : 'landing');
    setIsMenuOpen(false);
  };

  const handleLogoClick = () => {
    setViewMode('landing');
    navigate('/', { state: { showDashboard: false } });
  };

  const handleSectionClick = (sectionId: string) => {
    setViewMode('landing');
    navigate(`/#${sectionId}`, { state: { showDashboard: false } });
    setIsMenuOpen(false);
    
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#292C31] text-gray-100 overflow-x-hidden">
      <motion.nav
        className="fixed top-0 w-full bg-[#292C31]/90 backdrop-blur-md border-b border-gray-700/50 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-2">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                <a onClick={handleLogoClick} className="cursor-pointer">
                  <Blend className="!h-7 !w-7 " />
                </a>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                <a onClick={handleLogoClick} className="cursor-pointer">Flowy</a>
              </span>
            </motion.div>

            <div className="hidden md:flex items-center space-x-8">
              {viewMode === 'landing' && (
                <>
                  <a onClick={() => handleSectionClick('features')} className="text-gray-300 hover:text-blue-400 transition-colors cursor-pointer">Features</a>
                  <a onClick={() => handleSectionClick('possibilities')} className="text-gray-300 hover:text-blue-400 transition-colors cursor-pointer">Possibilities</a>
                  <a onClick={() => handleSectionClick('team')} className="text-gray-300 hover:text-blue-400 transition-colors cursor-pointer">Team</a>
                </>
              )}

              <Button
                onClick={toggleView}
                variant="secondary"
                className="w-[110px] h-10 rounded-full bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-full text-white font-semibold"
              >
                {viewMode === 'landing' ? 'Dashboard' : 'Landing'}
              </Button>
            </div>

            <button
              className="md:hidden text-gray-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden bg-[#25282C] border-t border-gray-700/50"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-6 py-4 space-y-4 flex flex-col items-center justify-center">
                {viewMode === 'landing' && (
                  <>
                    <a onClick={() => handleSectionClick('features')} className="block text-gray-300 hover:text-blue-400 cursor-pointer">Features</a>
                    <a onClick={() => handleSectionClick('possibilities')} className="block text-gray-300 hover:text-blue-400 cursor-pointer">Possibilities</a>
                    <a onClick={() => handleSectionClick('team')} className="block text-gray-300 hover:text-blue-400 cursor-pointer">Team</a>
                  </>
                )}
                <button
                  onClick={toggleView}
                  className="max-w-5/10 min-w-3/10 bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-full text-white font-semibold"
                >
                  {viewMode === 'landing' ? 'Dashboard' : 'Landing'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <AnimatePresence mode="wait">
        {viewMode === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.5 }}
          >
            <ProductLanding toggleView={toggleView} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <DashboardPage googleAuthSuccess={isGoogleAuthSuccess} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;
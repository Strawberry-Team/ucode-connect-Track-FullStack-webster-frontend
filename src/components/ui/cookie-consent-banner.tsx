import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './button';
import { Badge } from './badge';
import { Cookie, Shield, X, ExternalLink } from 'lucide-react';
import { useCookieConsent } from '@/hooks/use-cookie-consent';
import BrowserInstructionsModal from './browser-instructions-modal';

interface CookieConsentBannerProps {
  className?: string;
}

const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const { hasConsent, grantConsent, revokeConsent } = useCookieConsent();

  useEffect(() => {
    // Показуємо банер тільки якщо користувач ще не дав згоду
    if (hasConsent === null) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasConsent]);

  const handleAccept = () => {
    grantConsent();
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  const handleDecline = () => {
    revokeConsent();
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ 
          y: isClosing ? 100 : 0, 
          opacity: isClosing ? 0 : 1 
        }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`fixed bottom-0 left-0 right-0 z-50 p-4 ${className}`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-[#1a1d21] via-[#25282c] to-[#2a2d31] border border-gray-700/50 rounded-2xl shadow-2xl backdrop-blur-md">
            {/* Заголовок */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                  <Cookie className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Налаштування куки</h3>
                  <p className="text-sm text-gray-400">Дозвольте сторонні куки для кращої роботи</p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={handleClose}
                className="text-gray-400 hover:text-white hover:bg-gray-700/50"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Контент */}
            <div className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Основна інформація */}
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white mb-2">Чому нам потрібні сторонні куки?</h4>
                      <ul className="text-sm text-gray-300 space-y-2">
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Для автентифікації через Google та інші сервіси</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Для збереження ваших проектів у хмарі</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Для покращення функціональності платформи</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/20">
                    <p className="text-sm text-gray-300">
                      <strong className="text-blue-300">Примітка:</strong> Без дозволу на сторонні куки деякі функції можуть працювати некоректно. 
                      Ви можете змінити ці налаштування пізніше у своєму браузері.
                    </p>
                  </div>
                </div>

                {/* Дії */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-[#2a2d31] to-[#1f2226] rounded-xl p-4 border border-gray-700/50">
                    <Badge variant="secondary" className="mb-3 bg-green-500/20 text-green-300 border-green-500/30">
                      Рекомендовано
                    </Badge>
                    <Button
                      onClick={handleAccept}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold mb-3"
                    >
                      Дозволити всі куки
                    </Button>
                    <Button
                      onClick={handleDecline}
                      variant="outline"
                      className="w-full text-gray-300 border-gray-600 hover:bg-gray-700/50"
                    >
                      Відхилити
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full text-gray-400 hover:text-white text-xs"
                      onClick={() => window.open('/privacy', '_blank')}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Політика конфіденційності
                    </Button>
                    
                    <BrowserInstructionsModal />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CookieConsentBanner; 
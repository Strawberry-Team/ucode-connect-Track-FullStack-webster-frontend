import { useState, useEffect } from 'react';
import type { CookieConsentData } from '@/types/cookie';

export const useCookieConsent = () => {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [consentData, setConsentData] = useState<CookieConsentData | null>(null);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (consent) {
      try {
        const parsedConsent: CookieConsentData = JSON.parse(consent);
        setConsentData(parsedConsent);
        setHasConsent(parsedConsent.accepted);
      } catch (error) {
        console.error('Error parsing cookie consent:', error);
        setHasConsent(null);
      }
    } else {
      setHasConsent(null);
    }
  }, []);

  const grantConsent = () => {
    const consentData: CookieConsentData = {
      accepted: true,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(consentData));
    document.cookie = "cookieConsent=accepted; path=/; max-age=31536000; SameSite=None; Secure";
    
    setConsentData(consentData);
    setHasConsent(true);
  };

  const revokeConsent = () => {
    const consentData: CookieConsentData = {
      accepted: false,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(consentData));
    // Видаляємо cookie
    document.cookie = "cookieConsent=; path=/; max-age=0";
    
    setConsentData(consentData);
    setHasConsent(false);
  };

  const resetConsent = () => {
    localStorage.removeItem('cookie-consent');
    document.cookie = "cookieConsent=; path=/; max-age=0";
    setConsentData(null);
    setHasConsent(null);
  };

  return {
    hasConsent,
    consentData,
    grantConsent,
    revokeConsent,
    resetConsent,
    isLoading: hasConsent === null && !consentData
  };
}; 
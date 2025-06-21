import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Switch } from './switch';
import { Cookie, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { useCookieConsent } from '@/hooks/use-cookie-consent';
import { toast } from 'sonner';

const CookieSettingsCard: React.FC = () => {
  const { hasConsent, consentData, grantConsent, revokeConsent, resetConsent } = useCookieConsent();

  const handleToggleConsent = () => {
    if (hasConsent) {
      revokeConsent();
      toast.info('Cookie налаштування оновлено', {
        description: 'Сторонні куки вимкнено. Деякі функції можуть працювати некоректно.',
        duration: 4000
      });
    } else {
      grantConsent();
      toast.success('Cookie налаштування оновлено', {
        description: 'Сторонні куки увімкнено. Усі функції працюють коректно.',
        duration: 4000
      });
    }
  };

  const handleResetConsent = () => {
    resetConsent();
    toast.info('Cookie налаштування скинуто', {
      description: 'Буде показано банер згоди при наступному відвідуванні.',
      duration: 4000
    });
  };

  const getConsentStatusBadge = () => {
    if (hasConsent === null) {
      return (
        <Badge variant="secondary" className="bg-gray-500/20 text-gray-300 border-gray-500/30">
          <AlertCircle className="w-3 h-3 mr-1" />
          Не встановлено
        </Badge>
      );
    }
    
    return hasConsent ? (
      <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
        <CheckCircle className="w-3 h-3 mr-1" />
        Дозволено
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-red-500/20 text-red-300 border-red-500/30">
        <AlertCircle className="w-3 h-3 mr-1" />
        Відхилено
      </Badge>
    );
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="bg-gradient-to-br from-[#2a2d31] to-[#1f2226] border-gray-700/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
              <Cookie className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-white">Налаштування Cookie</CardTitle>
              <p className="text-sm text-gray-400">Керування дозволом на сторонні куки</p>
            </div>
          </div>
          {getConsentStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Поточний статус */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/30 rounded-lg p-4 border border-gray-600/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="font-medium text-white">Дозвіл на сторонні куки</span>
            </div>
            <Switch
              checked={hasConsent === true}
              onCheckedChange={handleToggleConsent}
              disabled={hasConsent === null}
            />
          </div>
          
          {consentData && (
            <div className="text-xs text-gray-400">
              Останнє оновлення: {formatDate(consentData.timestamp)}
            </div>
          )}
        </div>

        {/* Інформація */}
        <div className="space-y-3">
          <h4 className="font-semibold text-white text-sm">Для чого потрібні сторонні куки:</h4>
          <div className="space-y-2">
            {[
              'Автентифікація через Google OAuth',
              'Збереження проектів у хмарному сховищі',
              'Функціонування зовнішніх сервісів (Unsplash, Pixabay)',
              'Покращення продуктивності платформи'
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Дії */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-600/30">
          {hasConsent !== null && (
            <Button
              onClick={handleResetConsent}
              variant="outline"
              className="text-gray-300 border-gray-600 hover:bg-gray-700/50"
            >
              Скинути налаштування
            </Button>
          )}
          
          <div className="text-xs text-gray-500 flex-1 flex items-center">
            Ви можете змінити ці налаштування у будь-який час
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CookieSettingsCard; 
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { Button } from './button';
import { Badge } from './badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { HelpCircle, Chrome, Globe, Smartphone, Monitor, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { BrowserInstruction } from '@/types/cookie';

const BrowserInstructionsModal: React.FC = () => {
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  const copyToClipboard = (text: string, stepId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedStep(stepId);
      toast.success('Скопійовано!', { description: 'Текст скопійовано в буфер обміну' });
      setTimeout(() => setCopiedStep(null), 2000);
    });
  };

  const browserInstructions = {
    chrome: {
      icon: <Chrome className="w-5 h-5" />,
      name: "Google Chrome",
      steps: [
        {
          id: "chrome-1",
          title: "Відкрийте налаштування Chrome",
          description: "Натисніть три крапки у верхньому правому куті → Налаштування",
          copyText: "chrome://settings/"
        } as BrowserInstruction & { copyText: string },
        {
          id: "chrome-2", 
          title: "Перейдіть до конфіденційності",
          description: "Ліва панель → Конфіденційність та безпека → Куки та інші дані сайтів"
        } as BrowserInstruction,
        {
          id: "chrome-3",
          title: "Налаштуйте куки",
          description: "Виберіть 'Дозволити всі куки' або додайте наш сайт до винятків"
        } as BrowserInstruction
      ]
    },
    firefox: {
      icon: <Globe className="w-5 h-5" />,
      name: "Mozilla Firefox",
      steps: [
        {
          id: "firefox-1",
          title: "Відкрийте налаштування",
          description: "Меню гамбургер → Налаштування → Конфіденційність та безпека"
        },
        {
          id: "firefox-2",
          title: "Налаштуйте куки",
          description: "Розділ 'Куки та дані сайтів' → Керувати винятками"
        },
        {
          id: "firefox-3",
          title: "Додайте наш сайт",
          description: "Додайте домен сайту до списку дозволених"
        }
      ]
    },
    safari: {
      icon: <Smartphone className="w-5 h-5" />,
      name: "Safari",
      steps: [
        {
          id: "safari-1",
          title: "Відкрийте налаштування Safari",
          description: "Safari → Налаштування → Конфіденційність"
        },
        {
          id: "safari-2",
          title: "Налаштуйте блокування",
          description: "Зніміть прапорець 'Блокувати всі куки'"
        },
        {
          id: "safari-3",
          title: "Дозвольте третьосторонні куки",
          description: "Виберіть 'Дозволити з сайтів, які я відвідую'"
        }
      ]
    },
    edge: {
      icon: <Monitor className="w-5 h-5" />,
      name: "Microsoft Edge", 
      steps: [
        {
          id: "edge-1",
          title: "Відкрийте налаштування Edge",
          description: "Три крапки → Налаштування → Куки та дозволи сайтів"
        },
        {
          id: "edge-2",
          title: "Перейдіть до куки",
          description: "Натисніть 'Куки та дані сайтів'"
        },
        {
          id: "edge-3",
          title: "Дозвольте куки",
          description: "Виберіть 'Дозволити сайтам зберігати та читати дані куки'"
        }
      ]
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-gray-400 hover:text-white">
          <HelpCircle className="w-4 h-4 mr-2" />
          Як увімкнути куки?
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-gradient-to-br from-[#1a1d21] via-[#25282c] to-[#2a2d31] max-w-4xl max-h-[85vh] overflow-y-auto border-gray-700/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white mb-2">
            Як увімкнути третьосторонні куки
          </DialogTitle>
          <p className="text-gray-400">
            Виберіть ваш браузер і дотримуйтесь інструкцій нижче
          </p>
        </DialogHeader>

        <Tabs defaultValue="chrome" className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-4 bg-[#2a2d31] border border-gray-700/50">
            {Object.entries(browserInstructions).map(([key, browser]) => (
              <TabsTrigger 
                key={key} 
                value={key}
                className="flex items-center gap-2 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300"
              >
                {browser.icon}
                <span className="hidden sm:inline">{browser.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(browserInstructions).map(([key, browser]) => (
            <TabsContent key={key} value={key} className="mt-6">
              <div className="bg-gradient-to-br from-[#2a2d31] to-[#1f2226] rounded-xl p-6 border border-gray-700/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                    {browser.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{browser.name}</h3>
                    <p className="text-gray-400">Покрокові інструкції</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {browser.steps.map((step, index) => (
                    <div key={step.id} className="bg-gradient-to-r from-gray-800/50 to-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                      <div className="flex items-start gap-4">
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30 mt-1">
                          {index + 1}
                        </Badge>
                        
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-2">{step.title}</h4>
                          <p className="text-gray-300 text-sm mb-3">{step.description}</p>
                          
                          {'copyText' in step && step.copyText && (
                            <Button
                              onClick={() => copyToClipboard(step.copyText!, step.id)}
                              variant="outline"
                              className="text-gray-300 border-gray-600 hover:bg-gray-700/50"
                            >
                              {copiedStep === step.id ? (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Скопійовано
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 mr-1" />
                                  Копіювати адресу
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-green-300 mb-1">Після завершення:</h4>
                      <p className="text-gray-300 text-sm">
                        Перезавантажте сторінку, щоб зміни набули чинності. 
                        Банер згоди з'явиться знову, і ви зможете дозволити куки.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default BrowserInstructionsModal; 
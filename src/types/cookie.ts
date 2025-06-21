export interface CookieConsentData {
  accepted: boolean;
  timestamp: string;
  version: string;
}

export interface CookieSettings {
  hasConsent: boolean | null;
  consentData: CookieConsentData | null;
  isLoading: boolean;
}

export type BrowserType = 'chrome' | 'firefox' | 'safari' | 'edge';

export interface BrowserInstructionBase {
  id: string;
  title: string;
  description: string;
}

export interface BrowserInstructionWithCopy extends BrowserInstructionBase {
  copyText: string;
}

export interface BrowserInstructionWithoutCopy extends BrowserInstructionBase {
  copyText?: never;
}

export type BrowserInstruction = BrowserInstructionWithCopy | BrowserInstructionWithoutCopy; 
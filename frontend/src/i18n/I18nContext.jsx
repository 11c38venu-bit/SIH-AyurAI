import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

import en from './en.json';
import ta from './ta.json';
import hi from './hi.json';
import ml from './ml.json';
import te from './te.json';
import kn from './kn.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', region: 'India / Global' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', region: 'Tamil Nadu' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', region: 'National / North' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', region: 'Kerala' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', region: 'Andhra / Telangana' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', region: 'Karnataka' },
];

const translations = {
  en,
  ta,
  hi,
  ml,
  te,
  kn,
};

const I18nContext = createContext(null);

export const I18nProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem('ayurai_language');
      return saved && translations[saved] ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  const changeLanguage = useCallback((langCode) => {
    if (translations[langCode]) {
      setLanguageState(langCode);
      try {
        localStorage.setItem('ayurai_language', langCode);
      } catch (e) {
        console.warn('Unable to persist language in localStorage', e);
      }
    }
  }, []);

  // Helper to safely get nested value
  const getNestedValue = (obj, path) => {
    if (!obj || !path) return null;
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : null), obj);
  };

  /**
   * Translation lookup function
   * @param {string} key e.g. "common.save" or "caseTaking.title"
   * @param {object} params dynamic values e.g. { count: 3, name: "Dr. Sharma" }
   */
  const t = useCallback((key, params = {}) => {
    if (!key) return '';

    // 1. Check current language
    let value = getNestedValue(translations[language], key);

    // 2. Fallback to English if missing
    if (value === null || value === undefined) {
      value = getNestedValue(translations.en, key);
    }

    // 3. Fallback to key itself if not found
    if (value === null || value === undefined) {
      return key;
    }

    if (typeof value !== 'string') {
      return value;
    }

    // Replace {key} or {{key}} with params
    return Object.keys(params).reduce((str, paramKey) => {
      const regex = new RegExp(`\\{\\{?\\s*${paramKey}\\s*\\}?}`, 'g');
      return str.replace(regex, params[paramKey]);
    }, value);
  }, [language]);

  const currentLanguageMeta = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <I18nContext.Provider value={{ language, changeLanguage, t, supportedLanguages: SUPPORTED_LANGUAGES, currentLanguageMeta }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};

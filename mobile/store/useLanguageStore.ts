import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../services/i18n';

type Language = 'en' | 'fr';

interface LanguageState {
  language: Language;
  isSelected: boolean;
  setLanguage: (lang: Language) => Promise<void>;
  loadLanguage: () => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: 'fr',
  isSelected: false,

  setLanguage: async (lang) => {
    await AsyncStorage.setItem('@camerbus_language', lang);
    i18n.changeLanguage(lang);
    set({ language: lang, isSelected: true });
  },

  loadLanguage: async () => {
    const stored = await AsyncStorage.getItem('@camerbus_language');
    if (stored === 'en' || stored === 'fr') {
      i18n.changeLanguage(stored);
      set({ language: stored, isSelected: true });
    } else {
      set({ isSelected: false });
    }
  },
}));

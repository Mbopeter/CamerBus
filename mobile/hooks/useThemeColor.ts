import { useColorScheme } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { Colors } from '../constants/colors';

export function useThemeColor() {
  const systemTheme = useColorScheme() ?? 'light';
  const { themeMode } = useThemeStore();
  
  const activeTheme = themeMode === 'system' ? systemTheme : themeMode;
  
  return Colors[activeTheme] || Colors.light;
}

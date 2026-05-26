// CamerBus Color System
const purplePrimary = '#7C4DFF';
const purpleLight = '#B388FF';
const purpleDark = '#5E35B1';

const accent = '#FCD116';
const accentDark = '#E5BC00';

const danger = '#CE1126';
const dangerLight = '#FF3344';

const success = '#00C48C';
const warning = '#FFC542';
const info = '#2196F3';

export const Colors = {
  light: {
    primary: purplePrimary,
    primaryLight: purpleLight,
    primaryDark: purpleDark,
    accent: accent,
    accentDark: accentDark,
    danger: danger,
    dangerLight: dangerLight,
    white: '#FFFFFF',
    background: '#F5F7FA',
    card: '#FFFFFF',
    border: '#E5E9EF',
    muted: '#8A94A6',
    text: '#1A1F36',
    textLight: '#4F566B',
    success: success,
    warning: warning,
    info: info,
    seatAvailable: success,
    seatOccupied: danger,
    seatSelected: accent,
    seatVip: purplePrimary,
    gradientPrimary: [purplePrimary, purpleDark] as readonly [string, string],
    gradientGold: [accent, '#F5A623'] as readonly [string, string],
    gradientDark: ['#1A1F36', '#0F1117'] as readonly [string, string],
    gradientCard: ['#F8F9FA', '#FFFFFF'] as readonly [string, string],
  },
  dark: {
    primary: '#9E7BFF', // Lighter purple for dark mode contrast
    primaryLight: '#B388FF',
    primaryDark: purplePrimary,
    accent: accent,
    accentDark: accentDark,
    danger: dangerLight,
    dangerLight: danger,
    white: '#FFFFFF',
    background: '#0F1117',
    card: '#1A1F2E',
    border: '#2D3452',
    muted: '#A0AABF',
    text: '#FFFFFF',
    textLight: '#D0D6E0',
    success: success,
    warning: warning,
    info: info,
    seatAvailable: success,
    seatOccupied: danger,
    seatSelected: accent,
    seatVip: '#9E7BFF',
    gradientPrimary: ['#9E7BFF', purplePrimary] as readonly [string, string],
    gradientGold: [accent, '#F5A623'] as readonly [string, string],
    gradientDark: ['#2D3452', '#0F1117'] as readonly [string, string],
    gradientCard: ['#1A1F2E', '#2D3452'] as readonly [string, string],
  }
};

export const Fonts = {
  regular:    'Inter_400Regular',
  medium:     'Inter_500Medium',
  semiBold:   'Inter_600SemiBold',
  bold:       'Inter_700Bold',
  extraBold:  'Inter_800ExtraBold',
};

export const Spacing = {
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  xxl:  48,
};

export const Radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  full: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  lg: {
    shadowColor: purplePrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
};

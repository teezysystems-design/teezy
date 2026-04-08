// Design tokens for PAR-Tee UI system
// Consumed by both web (Tailwind CSS vars) and mobile (StyleSheet)

export const colors = {
  brand: {
    green: '#2D6A4F',
    greenLight: '#52B788',
    greenDark: '#1B4332',
    gold: '#D4AF37',
    goldLight: '#F0D060',
  },
  neutral: {
    white: '#FFFFFF',
    50: '#F8F9FA',
    100: '#F1F3F4',
    200: '#E8EAED',
    300: '#DADCE0',
    400: '#BDC1C6',
    500: '#9AA0A6',
    600: '#80868B',
    700: '#5F6368',
    800: '#3C4043',
    900: '#202124',
    black: '#000000',
  },
  status: {
    success: '#34A853',
    warning: '#FBBC04',
    error: '#EA4335',
    info: '#4285F4',
  },
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const typography = {
  fontFamily: {
    sans: 'System',
    mono: 'Courier',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

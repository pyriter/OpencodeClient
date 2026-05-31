import { Platform } from 'react-native';

export const colors = {
  bg: '#0b0d10',
  bgElevated: '#15181d',
  bgInput: '#1a1e24',
  border: '#262b33',
  text: '#e6e9ef',
  textMuted: '#8b94a3',
  textFaint: '#5a6371',
  accent: '#7aa2f7',
  accentMuted: '#3d5a99',
  success: '#9ece6a',
  warn: '#e0af68',
  error: '#f7768e',
  user: '#1f2530',
  assistant: '#15181d',
  toolHeader: '#1d2230',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
};

export const font = {
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) as string,
  body: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }) as string,
};

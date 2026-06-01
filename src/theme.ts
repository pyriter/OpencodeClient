import { Platform } from 'react-native';

export const colors = {
  // backgrounds
  bg: '#0d1117',
  bgElevated: '#161b22',
  bgRaised: '#1d2330',
  bgInput: '#1c2230',
  bgUser: '#1a2436',
  bgAssistant: '#171c25',
  bgTool: '#161c27',
  bgCode: '#0b1018',

  // strokes
  border: '#262d3a',
  borderStrong: '#36405a',
  borderAccent: '#3b4f7a',

  // text
  text: '#e8ecf3',
  textSubtle: '#c5cbd7',
  textMuted: '#8a93a6',
  textFaint: '#5b6479',

  // semantic
  accent: '#7aa2f7',
  accentSoft: '#3b5598',
  user: '#7dcfff',
  assistant: '#b4f9f8',
  success: '#9ece6a',
  warn: '#e0af68',
  error: '#f7768e',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
};

export const font = {
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  }) as string,
  body: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  }) as string,
};

export const fontSize = {
  xs: 11,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
};

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

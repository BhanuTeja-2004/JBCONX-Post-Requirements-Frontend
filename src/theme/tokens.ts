/** Design tokens — mirror of design/design_system.md. CSS custom properties are generated from these. */
export const color = {
  primary: '#1E3A64',
  primaryContainer: '#E3EBF6',
  onPrimary: '#FFFFFF',
  accent: '#F2A93B',
  surface: '#FFFFFF',
  surfaceVariant: '#F4F6F9',
  iosGrouped: '#F2F2F7',
  outline: '#C3CAD5',
  outlineStrong: '#7A8496',
  textPrimary: '#141B26',
  textSecondary: '#4D5869',
  success: '#1B7F4B',
  successContainer: '#E3F4EA',
  warning: '#9A5B00',
  warningContainer: '#FFF3DD',
  error: '#B3261E',
  errorContainer: '#FCE8E6',
  info: '#1E5FA8',
  infoContainer: '#E6EFFA',
  skeleton: '#E9EDF2',
} as const;

export const space = { xs: 4, s: 8, m: 12, l: 16, xl: 20, xxl: 24, xxxl: 32, huge: 40 } as const;

export const device = {
  android: { width: 360, height: 780, statusBar: 28, navBar: 20 },
  ios: { width: 390, height: 844, statusBar: 50, navBar: 34 },
} as const;

export function cssVariables(): string {
  const entries = Object.entries(color).map(([k, v]) => `--c-${k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}: ${v};`);
  return `:root{${entries.join('')}}`;
}

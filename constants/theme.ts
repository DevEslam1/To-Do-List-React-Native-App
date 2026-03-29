export const Colors = {
  light: {
    text: '#171411',
    background: '#F6F3EC',
    tint: '#7D5CEB',
    icon: '#7E766C',
    tabIconDefault: '#7E766C',
    tabIconSelected: '#7D5CEB',

    surface: '#F9F6F0',
    surfaceContainerLowest: '#FFFFFF',
    surfaceContainerLow: '#FCFAF6',
    surfaceContainer: '#FFFFFF',
    surfaceContainerHigh: '#EFE8DE',
    surfaceContainerHighest: '#E6DCCE',
    surfaceVariant: '#E6DCCE',

    primary: '#7D5CEB',
    primaryDim: '#653CD7',
    onPrimary: '#FFFFFF',

    secondary: '#8D6CED',
    secondaryContainer: '#E3D9FF',
    onSecondaryContainer: '#4A2D94',

    tertiary: '#D56C92',

    onSurface: '#171411',
    onSurfaceVariant: '#7E766C',

    outline: '#C2B9AE',
    outlineVariant: '#DED5CA',

    overlay: 'rgba(30,24,20,0.20)',
    dock: 'rgba(252,250,246,0.98)',
    dockBorder: 'rgba(52,42,33,0.08)',
    card: '#FFFFFF',
    quickAddGradientStart: 'rgba(255,255,255,0.98)',
    quickAddGradientEnd: 'rgba(244,239,230,0.98)',
    quickNoteGradientStart: '#8E6EF0',
    quickNoteGradientEnd: '#B392FF',
    avatarBackground: '#E3D7C9',
    avatarIcon: '#6B5440',
    progressTrack: '#E8DED2',
    progressFill: '#8F6EF5',
    tagChipBackground: '#F1EBE1',
    checkboxBorder: '#C4B6A1',
    checkboxFill: '#FFFFFF',
    listDivider: 'rgba(52,42,33,0.08)',
    bannerDot: '#D6CCBE',
    accentSoft: 'rgba(125,92,235,0.14)',
    dangerSoft: 'rgba(213,108,146,0.16)',
  },
  dark: {
    text: '#FFFFFF',
    background: '#0D0D0D',
    tint: '#B69AFF',
    icon: '#A9A4A0',
    tabIconDefault: '#A9A4A0',
    tabIconSelected: '#B69AFF',

    surface: '#101010',
    surfaceContainerLowest: '#050505',
    surfaceContainerLow: '#131313',
    surfaceContainer: '#181818',
    surfaceContainerHigh: '#20201F',
    surfaceContainerHighest: '#262626',
    surfaceVariant: '#262626',

    primary: '#B69AFF',
    primaryDim: '#8455EF',
    onPrimary: '#25144D',

    secondary: '#BC8DF9',
    secondaryContainer: '#5B2D94',
    onSecondaryContainer: '#E0C5FF',

    tertiary: '#FF96BB',

    onSurface: '#FFFFFF',
    onSurfaceVariant: '#A9A4A0',

    outline: '#6F6A65',
    outlineVariant: '#3B3836',

    overlay: 'rgba(0,0,0,0.62)',
    dock: 'rgba(16,16,16,0.98)',
    dockBorder: 'rgba(255,255,255,0.04)',
    card: '#141414',
    quickAddGradientStart: 'rgba(26,26,26,0.98)',
    quickAddGradientEnd: 'rgba(18,18,18,0.98)',
    quickNoteGradientStart: '#9B7DF2',
    quickNoteGradientEnd: '#B398FF',
    avatarBackground: '#1B2832',
    avatarIcon: '#E7EEF8',
    progressTrack: '#242424',
    progressFill: '#B69AFF',
    tagChipBackground: '#181818',
    checkboxBorder: '#595959',
    checkboxFill: '#F6F6F6',
    listDivider: 'rgba(255,255,255,0.035)',
    bannerDot: '#232323',
    accentSoft: 'rgba(182,154,255,0.14)',
    dangerSoft: 'rgba(255,150,187,0.16)',
  },
};

export type ThemeMode = keyof typeof Colors;
export type ThemeColors = (typeof Colors)[ThemeMode];

export const Typography = {
  headline: 'Manrope_700Bold',
  body: 'Manrope_400Regular',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const Radii = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 9999,
};

export const Fonts = {
  headline: 'Manrope_700Bold',
  title: 'Manrope_600SemiBold',
  body: 'Manrope_400Regular',
  label: 'Inter_500Medium',
  mono: 'Inter_400Regular',
  rounded: 'Manrope_500Medium',
};

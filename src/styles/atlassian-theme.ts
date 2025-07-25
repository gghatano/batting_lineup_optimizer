// Atlassian Design System inspired theme
export const theme = {
  colors: {
    // Primary
    primary: '#0052CC',
    primaryHover: '#0747A6',
    primaryActive: '#061C3C',
    
    // Secondary
    secondary: '#FFFFFF',
    secondaryHover: '#F4F5F7',
    secondaryActive: '#DFE1E6',
    
    // Success
    success: '#00875A',
    successHover: '#006B47',
    successLight: '#E3FCEF',
    
    // Warning
    warning: '#FF8B00',
    warningHover: '#D97C00',
    warningLight: '#FFF4E6',
    
    // Danger
    danger: '#DE350B',
    dangerHover: '#BF2600',
    dangerLight: '#FFEBE6',
    
    // Neutral
    text: '#172B4D',
    textSubtle: '#6B778C',
    textMuted: '#97A0AF',
    border: '#DFE1E6',
    background: '#FAFBFC',
    surface: '#FFFFFF',
    overlay: 'rgba(9, 30, 66, 0.54)',
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
  },
  
  borderRadius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
  },
  
  shadows: {
    sm: '0 1px 1px rgba(9, 30, 66, 0.25)',
    md: '0 2px 4px rgba(9, 30, 66, 0.25)',
    lg: '0 8px 16px rgba(9, 30, 66, 0.15)',
  },
  
  typography: {
    fontSize: {
      xs: '11px',
      sm: '12px',
      base: '14px',
      lg: '16px',
      xl: '20px',
      xxl: '24px',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.2',
      base: '1.4',
      relaxed: '1.6',
    },
  },
  
  breakpoints: {
    mobile: '767px',
    tablet: '1199px',
    desktop: '1200px',
  },
} as const

export type Theme = typeof theme
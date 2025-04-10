/**
 * Application theme and styling constants
 */

export const theme = {
  // Color palette
  colors: {
    primary: '#0070f3',
    primaryLight: '#339af0',
    primaryDark: '#0057b8',
    secondary: '#6c757d',
    success: '#16a34a',
    successLight: '#4ade80',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    light: '#f8f9fa',
    dark: '#343a40',
    white: '#ffffff',
    black: '#000000',
    gray100: '#f8f9fa',
    gray200: '#e9ecef',
    gray300: '#dee2e6',
    gray400: '#ced4da',
    gray500: '#adb5bd',
    gray600: '#6c757d',
    gray700: '#495057',
    gray800: '#343a40',
    gray900: '#212529',
  },

  // Typography
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    fontWeights: {
      light: 300,
      normal: 400,
      medium: 500,
      bold: 700,
    },
    lineHeights: {
      none: 1,
      tight: 1.25,
      normal: 1.5,
      loose: 2,
    },
  },

  // Spacing
  spacing: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
    40: '10rem',
    48: '12rem',
    56: '14rem',
    64: '16rem',
  },

  // Borders
  borders: {
    none: 'none',
    thin: '1px solid',
    normal: '2px solid',
    thick: '4px solid',
    radius: {
      none: '0',
      sm: '0.125rem',
      default: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px',
    },
  },

  // Shadows
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    default: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },

  // Transitions
  transitions: {
    default: 'all 0.2s ease',
    fast: 'all 0.1s ease',
    slow: 'all 0.3s ease',
  },

  // Z-index
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },

  // Breakpoints
  breakpoints: {
    xs: '0px',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
    '2xl': '1400px',
  },

  // Layout
  layout: {
    container: {
      maxWidth: '1200px',
      padding: '0 1rem',
    }
  }
};

// Common component styles
export const styles = {
  // Button styles
  button: {
    primary: {
      backgroundColor: theme.colors.primary,
      color: theme.colors.white,
      border: 'none',
      borderRadius: theme.borders.radius.default,
      padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
      fontWeight: theme.typography.fontWeights.medium,
      boxShadow: theme.shadows.md,
      transition: theme.transitions.default,
    },
    secondary: {
      backgroundColor: theme.colors.white,
      color: theme.colors.primary,
      border: `1px solid ${theme.colors.primary}`,
      borderRadius: theme.borders.radius.default,
      padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
      fontWeight: theme.typography.fontWeights.medium,
      transition: theme.transitions.default,
    },
    success: {
      backgroundColor: theme.colors.success,
      color: theme.colors.white,
      border: 'none',
      borderRadius: theme.borders.radius.default,
      padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
      fontWeight: theme.typography.fontWeights.medium,
      boxShadow: theme.shadows.md,
      transition: theme.transitions.default,
    },
    danger: {
      backgroundColor: theme.colors.danger,
      color: theme.colors.white,
      border: 'none',
      borderRadius: theme.borders.radius.default,
      padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
      fontWeight: theme.typography.fontWeights.medium,
      boxShadow: theme.shadows.md,
      transition: theme.transitions.default,
    },
    disabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },

  // Card styles
  card: {
    default: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.borders.radius.lg,
      boxShadow: theme.shadows.md,
      padding: theme.spacing[6],
    },
    interactive: {
      cursor: 'pointer',
      transition: theme.transitions.default,
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows.lg,
      },
    },
    selected: {
      border: `2px solid ${theme.colors.primary}`,
      boxShadow: `0 0 0 1px ${theme.colors.primary}, ${theme.shadows.md}`,
    },
  },

  // Alert styles
  alert: {
    success: {
      backgroundColor: '#f0fdf4',
      color: theme.colors.success,
      border: `1px solid ${theme.colors.successLight}`,
      borderRadius: theme.borders.radius.default,
      padding: theme.spacing[4],
    },
    error: {
      backgroundColor: '#fff5f5',
      color: theme.colors.danger,
      border: `1px solid ${theme.colors.danger}`,
      borderRadius: theme.borders.radius.default,
      padding: theme.spacing[4],
    },
    warning: {
      backgroundColor: '#fffbeb',
      color: '#92400e',
      border: `1px solid ${theme.colors.warning}`,
      borderRadius: theme.borders.radius.default,
      padding: theme.spacing[4],
    },
    info: {
      backgroundColor: '#f0f9ff',
      color: theme.colors.info,
      border: `1px solid ${theme.colors.info}`,
      borderRadius: theme.borders.radius.default,
      padding: theme.spacing[4],
    },
  },
};

export default theme;
import type { Config } from 'tailwindcss';

// IMPORTANT: Every color below points to a CSS variable defined in
// src/styles/globals.css. Never add a literal hex/rgb color here or
// anywhere else in the app — change the variable in globals.css instead
// and the entire application updates.
const config: Config = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          elevated: 'var(--color-bg-elevated)',
          overlay: 'var(--color-bg-overlay)',
        },
        gold: {
          DEFAULT: 'var(--color-gold)',
          bright: 'var(--color-gold-bright)',
          muted: 'var(--color-gold-muted)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
          inverse: 'var(--color-text-inverse)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          strong: 'var(--color-border-strong)',
        },
        status: {
          success: 'var(--color-success)',
          successBg: 'var(--color-success-bg)',
          danger: 'var(--color-danger)',
          dangerBg: 'var(--color-danger-bg)',
          warning: 'var(--color-warning)',
          warningBg: 'var(--color-warning-bg)',
          info: 'var(--color-info)',
          infoBg: 'var(--color-info-bg)',
          pending: 'var(--color-pending)',
          pendingBg: 'var(--color-pending-bg)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        gold: 'var(--shadow-gold)',
      },
      spacing: {
        section: 'var(--space-section)',
      },
      transitionDuration: {
        DEFAULT: 'var(--transition-base)',
      },
    },
  },
  plugins: [],
};

export default config;

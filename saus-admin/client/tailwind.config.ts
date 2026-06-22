import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0A1628',
          mid:     '#122040',
          light:   '#1E3160',
          50:      '#EEF1F7',
        },
        green: {
          DEFAULT: '#00692F',
          light:   '#00873E',
          50:      '#E6F4EC',
        },
        gold: {
          DEFAULT: '#C9A227',
          light:   '#E8C04A',
          50:      '#FDF8E8',
        },
        red: {
          saus:    '#A8200D',
          light:   '#CC2200',
          50:      '#FAEAE8',
        },
        cream: '#F7F6F2',
        stone: '#EEECEA',
      },
      fontFamily: {
        sans:  ['var(--font-sans)',  'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        mono:  ['var(--font-mono)',  'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(10,22,40,.06), 0 4px 16px rgba(10,22,40,.04)',
        'card-hover': '0 4px 24px rgba(10,22,40,.12)',
        sidebar: '4px 0 24px rgba(10,22,40,.15)',
      },
      animation: {
        'fade-in': 'fadeIn .2s ease',
        'slide-in': 'slideIn .25s ease',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideIn: { from: { transform: 'translateY(8px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
};
export default config;

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          base: 'var(--bg-base)',
          surface: 'var(--bg-surface)',
          elevated: 'var(--bg-elevated)',
        },
        ink: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          'on-brand': 'var(--text-on-brand)',
        },
        brand: {
          DEFAULT: 'var(--brand-primary)',
          soft: 'var(--brand-primary-soft)',
          accent: 'var(--brand-accent)',
          'accent-soft': 'var(--brand-accent-soft)',
          ink: 'var(--brand-ink)',
        },
        line: {
          subtle: 'var(--border-subtle)',
          strong: 'var(--border-strong)',
        },
        state: {
          success: 'var(--success)',
          warning: 'var(--warning)',
          danger: 'var(--danger)',
          info: 'var(--info)',
        },
      },
      fontFamily: {
        sans: ['MiSans', '"PingFang SC"', '"HarmonyOS Sans SC"', '"Source Han Sans CN"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        card: 'var(--radius-card)',
        button: 'var(--radius-button)',
        pill: 'var(--radius-pill)',
        shell: 'var(--radius-shell)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        elevated: 'var(--shadow-elevated)',
        nav: 'var(--shadow-nav)',
      },
    },
  },
  plugins: [],
}

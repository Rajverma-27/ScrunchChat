/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx,html}', './index.html'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        secondary: '#818cf8',
        accent: '#c084fc',
        background: '#0f0f23',
        surface: '#1a1a2e',
        card: '#16213e',
        text: '#e2e8f0',
        muted: '#94a3b8',
        urgent: '#ef4444',
        warning: '#f59e0b',
        success: '#22c55e',
      },
    },
  },
  plugins: [],
};

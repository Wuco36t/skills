import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FAF8F4',
        ink: '#1F2421',
        muted: '#5B625D',
        accent: '#2F5D3D',
        tint: '#E6EFE6',
        line: '#E8E4DB',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config

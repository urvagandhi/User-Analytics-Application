/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-canvas)',
        'surface-card': 'var(--color-surface-card)',
        'surface-soft': 'var(--color-surface-soft)',
        'surface-dark': 'var(--color-surface-dark)',
        hairline: 'var(--color-hairline)',
        'hairline-soft': 'var(--color-hairline-soft)',
        ink: 'var(--color-ink)',
        body: 'var(--color-body)',
        charcoal: 'var(--color-charcoal)',
        mute: 'var(--color-mute)',
        ash: 'var(--color-ash)',
        stone: 'var(--color-stone)',
        primary: 'var(--color-primary)',
        'primary-pressed': 'var(--color-primary-pressed)',
        'primary-active': 'var(--color-primary-active)',
        'on-primary': 'var(--color-on-primary)',
        'on-dark': 'var(--color-on-dark)',
        'link-blue': 'var(--color-link-blue)',
        'link-teal': 'var(--color-link-teal)',
        
        // Semantic accents
        'accent-blue': 'var(--color-accent-blue)',
        'accent-blue-soft': 'var(--color-accent-blue-soft)',
        'accent-red': 'var(--color-accent-red)',
        'accent-red-soft': 'var(--color-accent-red-soft)',
        'accent-green': 'var(--color-accent-green)',
        'accent-green-soft': 'var(--color-accent-green-soft)',
        'accent-purple': 'var(--color-accent-purple)',
        'accent-purple-soft': 'var(--color-accent-purple-soft)',
      },
      borderRadius: {
        none: 'var(--rounded-none)',
        xs: 'var(--rounded-xs)',
        sm: 'var(--rounded-sm)',
        md: 'var(--rounded-md)',
        lg: 'var(--rounded-lg)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'IBM Plex Sans', '-apple-system', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'Source Code Pro', 'monospace'],
      },
    },
  },
  plugins: [],
}

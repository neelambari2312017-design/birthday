/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        pacifico: ['Pacifico', 'cursive'],
        quicksand: ['Quicksand', 'sans-serif'],
        dancing: ['Dancing Script', 'cursive'],
      },
      colors: {
        blush: '#FF6B9D',
        rose: '#FFB3CC',
        petal: '#FFF0F5',
        violet: '#B76EFF',
        lavender: '#E4C8FF',
        cream: '#FFFAF6',
        sage: '#5EC87A',
        butter: '#FFD93D',
        coral: '#FF7B6B',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        wiggle: { '0%,100%': { transform: 'rotate(-4deg)' }, '50%': { transform: 'rotate(4deg)' } },
        bloom: { '0%': { transform: 'scale(0) rotate(-20deg)', opacity: '0' }, '60%': { transform: 'scale(1.15) rotate(5deg)', opacity: '1' }, '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' } },
        flutter: { '0%,100%': { transform: 'translateX(0) translateY(0) rotate(0deg)' }, '25%': { transform: 'translateX(12px) translateY(-8px) rotate(8deg)' }, '75%': { transform: 'translateX(-8px) translateY(-14px) rotate(-6deg)' } },
        sealPop: { '0%': { transform: 'scale(0.5)', opacity: '0' }, '70%': { transform: 'scale(1.1)' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        unfold: { '0%': { transform: 'scaleY(0)', transformOrigin: 'top', opacity: '0' }, '100%': { transform: 'scaleY(1)', transformOrigin: 'top', opacity: '1' } },
        fadeSlideUp: { '0%': { opacity: '0', transform: 'translateY(24px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        heartBeat: { '0%,100%': { transform: 'scale(1)' }, '14%': { transform: 'scale(1.2)' }, '28%': { transform: 'scale(1)' }, '42%': { transform: 'scale(1.15)' }, '70%': { transform: 'scale(1)' } },
        sparkle: { '0%,100%': { opacity: '1', transform: 'scale(1)' }, '50%': { opacity: '0.3', transform: 'scale(0.6)' } },
        petal: { '0%': { transform: 'translateY(-10px) rotate(0deg)', opacity: '1' }, '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' } },
      },
      animation: {
        float: 'float 3.5s ease-in-out infinite',
        wiggle: 'wiggle 2.5s ease-in-out infinite',
        bloom: 'bloom 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards',
        flutter: 'flutter 4s ease-in-out infinite',
        sealPop: 'sealPop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards',
        unfold: 'unfold 0.7s ease forwards',
        fadeSlideUp: 'fadeSlideUp 0.6s ease forwards',
        heartBeat: 'heartBeat 1.5s ease-in-out infinite',
        sparkle: 'sparkle 1.8s ease-in-out infinite',
        petal: 'petal linear forwards',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#e27d60', // 温暖的珊瑚色作为主色调
        secondary: '#85cdca', // 柔和的青绿色作为辅助色
        accent: '#e8a87c', // 温暖的橙色作为强调色
        background: '#f9f4f0', // 温暖的米色背景
        text: '#5d5c61', // 深灰色文本
        light: '#f6f1ee', // 浅灰色
        dark: '#414042', // 深灰色
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
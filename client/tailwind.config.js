module.exports = {

  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        noctura: {
          bg: '#07080A',
          panel: '#0F1012',
          card: '#18181A',
          button: 'ring-indigo-500'
        },
        keyframes: {
        float: {
          "0%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
          "100%": { transform: "translateY(0px)" },
        },
      },
      animation: {
        float: "float 12s linear infinite",
      },
      }
    }
  }
}

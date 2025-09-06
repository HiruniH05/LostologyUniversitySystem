/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {

        rough: '#243D1D',
        fairway: '#B4B56D',
        bunker: '#DEE2B0',
        pond: '#8DB2A2',
        '18th-hole': '#E4704B',

        'celestial-blue': '#4B97C0',
        'cal-poly-green': '#144425',
        'may-green': '#46953D',
        'yellow-green': '#B5D984',
        'pearl-aqua': '#82D1C5',

        'fresh-turf':'#62CF8A',
        'power-play-blue':'#5A92B1',
        'chalk-line':'#D7E4E5',

        'beige':'#EEE5C2',
        'butter':'#FAD564',
        'lime':'#D3DC7C',
        'sage':'#BEBD9D',
        'navy':'#1A1F4A',

        'mint':'#ABC27D',
        'sunshine':'#FEC868',
        'sunset':'#FDA769',
        'wood':'#473C33',

        'mirage':'#16232A',
        'blaze-orange':'#FF5B04',
        'deep-sea-green':'#075056',
        'wild-sand':'#E4EEF0',

        'az-white':'#DCEBFF',
        'lime-green':'#C8F05A',
        'olive-green':'#37500F',

        orange: '#FFAD33',
        darkOrange: '#e96a21ff',
        engineRed: '#CC1400',
        thistle: '#BCB3D8',
        violetBlue: '#4C57A9',
        asparagus: '#66974A',

        burntOrange: '#EF5F18',
        warmBrown: '#9C7764',
        pureWhite: '#FFFFFF',
        softpurple:'#926699',

        'victory-green':'#388355',
         deepBlue: '#251A65',
         'cornflower-blue':'#6478FF',

    },

     animation: {
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
};

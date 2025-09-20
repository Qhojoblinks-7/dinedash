/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./index.html',
		'./src/**/*.{js,ts,jsx,tsx}',
	],
	theme: {
		extend: {
			colors: {
				brand: {
					50: '#f0fbf4',
					100: '#dcf7e8',
					200: '#b7efcf',
					300: '#91e6b6',
					400: '#5fdc92',
					500: '#2cc56f', // primary brand green
					600: '#28a661',
					700: '#1f7f4c',
					800: '#165a36',
					900: '#0e3b23',
				},
			},
			fontFamily: {
				sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial'],
				display: ['Playfair Display', 'serif'],
			},
			boxShadow: {
				'brand-lg': '0 10px 30px rgba(44,197,111,0.18)'
			}
		},
	},
	plugins: [],
}
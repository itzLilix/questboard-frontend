export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			spacing: {
				18: "4.5rem",
				960: "960px",
				1600: "1600px",
			},
			fontSize: {
				"4xl": "48px",
				"3xl": "32px",
				"2xl": "24px",
				xl: "18px",
				base: "14px",
				sm: "12px",
			},
			fontFamily: {
				body: ["var(--font-body)", "sans-serif"],
				display: ["var(--font-display)", "sans-serif"],
			},
			borderWidth: {
				DEFAULT: "1px",
			},
			animation: {
				"fade-in": "fadeIn 0.3s ease-out",
			},
			keyframes: {
				fadeIn: {
					from: { opacity: 0, transform: "translateY(-4px)" },
					to: { opacity: 1, transform: "translateY(0)" },
				},
			},
		},
	},
	plugins: [],
};

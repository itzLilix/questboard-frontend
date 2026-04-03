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
				sm: "11px",
			},
			fontFamily: {
				body: ["var(--font-body)", "sans-serif"],
				display: ["var(--font-display)", "sans-serif"],
			},
			borderWidth: {
				DEFAULT: "1px",
			},
		},
	},
	plugins: [],
};

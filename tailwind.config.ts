export default <Partial<Config>>{
	darkMode: "class",
	content: ["./components/**/*.{js,vue,ts}", "./layouts/**/*.vue", "./pages/**/*.vue"],
	theme: {
		extend: {
			colors: {
				background: "hsl(var(--background))",
				foreground: "hsl(var(--color-primary))",
				spotify: "hsl(var(--spotify-green) / <alpha-value>)",
				accent: "hsl(var(--accent) / <alpha-value>)",
				muted: "hsl(var(--muted) / <alpha-value>)",
			},
		},
	},
}

export default <Partial<Config>>{
	darkMode: "class",
	content: ["./components/**/*.{js,vue,ts}", "./layouts/**/*.vue", "./pages/**/*.vue"],
	theme: {
		extend: {
			colors: {
				background: "var(--background)",
				foreground: "var(--color-primary)",
				spotify: "var(--spotify-green)",
			},
		},
	},
}

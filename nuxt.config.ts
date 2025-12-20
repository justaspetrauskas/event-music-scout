export default defineNuxtConfig({
	modules: [
		"@nuxt/eslint",
		"@nuxt/icon",
		"@pinia/nuxt",
		"@nuxt/devtools",
		"@nuxtjs/tailwindcss",
		"nuxt-lucide-icons",
		"@nuxtjs/tailwindcss",
		"@vueuse/motion/nuxt",
	],
	ssr: true,
	devtools: { enabled: false },
	runtimeConfig: {
		anthropicApiKey: process.env.ANTHROPIC_API_KEY,
		spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
		spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET,
		spotifyRedirectUri: process.env.SPOTIFY_REDIRECT_URI,
		public: {
			spotifyRedirectUri: process.env.SPOTIFY_REDIRECT_URI || "http://127.0.0.1:3000",
			spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
		},
	},
	devServer: {
		host: "::1",
		port: 3000, // because of spotify new rules
	},
	compatibilityDate: "2025-07-15",
	vite: {
		ssr: {
			noExternal: ["@vue/devtools-kit"], // Prevent SSR bundling
		},
	},
	eslint: {
		config: {
			stylistic: {
				semi: false,
				quotes: "double",
				commaDangle: "always-multiline",
				indent: "tab",

			},
		},
	},
})

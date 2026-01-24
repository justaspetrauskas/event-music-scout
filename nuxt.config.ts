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
		"floating-vue/nuxt",
		"nuxt-auth-utils",
	],
	ssr: true,
	devtools: { enabled: false },
	runtimeConfig: {
		anthropicApiKey: process.env.ANTHROPIC_API_KEY,
		spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
		spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET,
		spotifyRedirectUri: process.env.SPOTIFY_REDIRECT_URI,
		scraperApiKey: process.env.PUPPETEER_API_KEY,
		session: { name: "spotify-session", password: process.env.NUXT_SESSION_PASSWORD, secure: process.env.NODE_ENV === "production" },
		public: {
			spotifyRedirectUri: process.env.SPOTIFY_REDIRECT_URI || "http://127.0.0.1:3000",
			spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
			scraperUrl: process.env.PUPPETEER_ORIGIN,
			baseURL: "http://127.0.0.1:3000",
		},
		oauth: {
			spotify: {
				clientId: process.env.SPOTIFY_CLIENT_ID,
				clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
				scope: [
					"user-read-private",
					"user-read-email",
					"playlist-modify-public",
					"playlist-modify-private",
					"playlist-read-private",
					"streaming",
					"user-read-playback-state",
					"user-modify-playback-state",
				],
				redirectURL: process.env.SPOTIFY_REDIRECT_URI,
			},
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

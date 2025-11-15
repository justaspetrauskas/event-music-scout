// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from "node:url"

export default defineNuxtConfig({
	modules: [
		"@nuxt/eslint",
		"@nuxt/icon",

	],
	ssr: true,
	devtools: { enabled: true },
	runtimeConfig: {
		anthropicApiKey: process.env.ANTHROPIC_API_KEY,
		spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
		spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET,
		public: {
			spotifyRedirectUri: process.env.SPOTIFY_REDIRECT_URI || "http://localhost:3000/callback",
		},
	},
	compatibilityDate: "2025-07-15",
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

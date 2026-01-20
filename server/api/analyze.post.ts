import { Anthropic } from "@anthropic-ai/sdk"
import { eventExtractionPrompt } from "./lib/extractionPrompt"
import { testResponse } from "./lib/testResponse"

let cachedToken: string | null = null
let tokenExpiry = 0

async function getAccessToken() {
	const now = Date.now()
	if (cachedToken && now < tokenExpiry) {
		return cachedToken
	}
	const tokenResponse = await $fetch("/api/spotify/auth/token", { method: "POST", body: { grant_type: "client_credentials" } })
	cachedToken = tokenResponse.access_token
	tokenExpiry = now + tokenResponse.expires_in * 1000 // expires_in is in seconds
	return cachedToken
}

export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig()
	const { anthropicApiKey } = useRuntimeConfig()
	const { url } = await readBody(event)

	// const pageText = await $fetch("/api/scrape", {
	// 	baseURL: config.public.scraperUrl,
	// 	method: "POST",
	// 	headers: {
	// 		Authorization: `Bearer ${config.scraperApiKey}`,
	// 	},
	// 	body: { url },
	// })
	// if (!pageText.success) return null

	// const anthropic = new Anthropic({ anthropicApiKey })
	// const aiPrompt = eventExtractionPrompt(pageText.text as string)

	// const response = await anthropic.messages.create({
	// 	model: "claude-sonnet-4-20250514",
	// 	messages: [{ role: "user", content: aiPrompt }],
	// 	max_tokens: 1024,
	// })

	const accessToken = await getAccessToken()

	// let extracted
	// try {
	// 	extracted = JSON.parse(response.content[0]?.text || "{}")
	// }
	// catch {
	// 	extracted = { name: "", date: "", location: "", artists: [] }
	// }
	// console.log("Extracted event data:", extracted)
	const extracted = { name: "ARCANUM COLLECTIVE: SUBMERGED",
		date: "2025-10-10",
		location: "Hangaren, Copenhagen, Denmark",
		artists:
   ["Kliment",
   	"Zzbing",
   	"Oxyflux",
   	"Krypto",
   	"Florescence",
   	"Freya Rose",
   	"Lulla-Li",
   	"Merlyn Silva",
   	"Matt Nørgaard"],
		genres:
   ["Dark Progressive Trance",
   	"Psytrance",
   	"Progressive Trance",
   	"Techno",
   	"Electronic"] }

	const artists = extracted.artists
	const genres = extracted.genres
	const searchResults = await $fetch("/api/spotify/search-artist", {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
		body: { artists, genres } })

	// await new Promise(resolve => setTimeout(resolve, 2000))

	return {
		name: extracted.name,
		date: extracted.date,
		location: extracted.location,
		url,
		artists: searchResults.data,
	}
})

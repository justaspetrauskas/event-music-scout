import { Anthropic } from "@anthropic-ai/sdk"
import { getEventPageText } from "./lib/scraper"
import { eventExtractionPrompt } from "./lib/extractionPrompt"
import { testResponse } from "./lib/testResponse"

let cachedToken: string | null = null
let tokenExpiry = 0

async function getAccessToken() {
	const now = Date.now()
	if (cachedToken && now < tokenExpiry) {
		return cachedToken
	}

	console.log("gets access token")
	const tokenResponse = await $fetch("/api/spotify/spotify-token", { method: "POST" })
	cachedToken = tokenResponse.access_token
	tokenExpiry = now + tokenResponse.expires_in * 1000 // expires_in is in seconds
	return cachedToken
}

export default defineEventHandler(async (event) => {
	const { anthropicApiKey } = useRuntimeConfig()

	const { url } = await readBody(event)

	// Get all visible text from the main body
	// const pageText = await getEventPageText(url)

	// Step 2: Ask Anthropic Claude to extract artists and details from the text
	// const anthropic = new Anthropic({ anthropicApiKey })
	// const aiPrompt = eventExtractionPrompt(pageText)

	// TODO commented for test
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

	const artists = testResponse.artists.map(a => a.name).join(",")
	const searchResults = await $fetch("/api/spotify/search-artist", { method: "GET", headers: {
		Authorization: `Bearer ${accessToken}`,
	}, params: { q: artists } })

	await new Promise(resolve => setTimeout(resolve, 2000))

	// return {
	// 	name: extracted.name || "Event Name",
	// 	date: extracted.date || "TBD",
	// 	location: extracted.location || "TBD",
	// 	url,
	// 	artists: (extracted.artists || []).map((name: string, idx: number) => ({
	// 		id: `artist-${idx + 1}`,
	// 		name,
	// 		genres: [],
	// 		popularity: 0,
	// 		followers: "",
	// 		image: "🎵",
	// 		spotifyUrl: "",
	// 		tracks: [],
	// 	})),
	// }
	return { ...testResponse, artists: searchResults }
})

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
	const tokenResponse = await $fetch("/api/spotify/auth/token", { method: "POST", body: { grant_type: "client_credentials" } })
	cachedToken = tokenResponse.access_token
	tokenExpiry = now + tokenResponse.expires_in * 1000 // expires_in is in seconds
	return cachedToken
}

export default defineEventHandler(async (event) => {
	const { anthropicApiKey } = useRuntimeConfig()

	const { url } = await readBody(event)

	// Get all visible text from the main body
	const pageText = await getEventPageText(url)

	// Step 2: Ask Anthropic Claude to extract artists and details from the text
	// const anthropic = new Anthropic({ anthropicApiKey })
	// const aiPrompt = eventExtractionPrompt(pageText)

	// // TODO commented for test
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

	// console.log("extracted", extracted)

	const artists = testResponse.artists
	const genres = testResponse.genres
	const searchResults = await $fetch("/api/spotify/search-artist", {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
		body: { artists, genres } })

	console.log("search results", searchResults.data)
	await new Promise(resolve => setTimeout(resolve, 2000))

	return {
		name: testResponse.name || "Event Name",
		date: testResponse.date || "TBD",
		location: testResponse.location || "TBD",
		url,
		artists: searchResults.data,
	}
})

import { Anthropic } from "@anthropic-ai/sdk"
import { eventExtractionPrompt } from "./lib/extractionPrompt"

export default defineEventHandler(async (event) => {
	const { isAuthenticated } = event.context.spotifyUser

	if (!isAuthenticated) {
		setResponseStatus(event, 401)
		return { error: "Not authenticated" }
	}

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

	return {
		name: extracted.name,
		date: extracted.date,
		location: extracted.location,
		genres: extracted.genres,
		artistQueries: extracted.artists,
		url,
	}
})

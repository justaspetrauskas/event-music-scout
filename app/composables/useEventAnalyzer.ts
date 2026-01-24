export const useEventAnalyzer = () => {
	const isReadingUrl = ref(false)
	const isSearchingArtists = ref(false)
	const isFindingTracks = ref(false)
	const totalArtistsFound = ref(0)
	const totalArtistsIdentified = ref(0)

	const loading = ref(false)
	const error = ref<string | null>(null)

	const analyzeEvent = async (url: string) => {
		loading.value = true
		try {
			// ready url
			// return meta info + artist queries + genres
			// find artists
			// find top tracks

			const eventMeta = await $fetch("/api/analyze", { method: "POST", body: { url } })

			const searchResults = await $fetch("/api/spotify/search-artist", {
				method: "POST",
				headers: {
					"Authorization": `Bearer ${accessToken}`,
					"Content-Type": "application/json",
				},
				body: { artists: eventMeta.artistQueries, genres: eventMeta.genres } })
			// sessionStorage.setItem("eventData", JSON.stringify(data))
		}
		catch (e) {
			error.value = e instanceof Error ? e.message : "Failed to analyze event"
			console.error("Event analysis error:", e)
			return null
		}
		finally {
			loading.value = false
		}
	}

	return {
		loading: readonly(loading),
		error: readonly(error),
		analyzeEvent,
	}
}

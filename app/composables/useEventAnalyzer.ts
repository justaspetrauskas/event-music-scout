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
			// find top tracks

			const eventMeta = await $fetch("/api/analyze", { method: "POST", body: { url } })

			const artists = await searchArtists(eventMeta.artistQueries, eventMeta.genres)

			const { matches } = artists || { matches: [] }
			const identifiedArtistIds = matches?.filter((artist: Artist) => !artist.error).map((artist: Artist) => artist.id) || []

			await Promise.all(identifiedArtistIds.map(async (artistId: string) => {
				const topTracks = await searchTopTracks(artistId)
				console.log(`Top tracks for artist ${artistId}:`, topTracks)
			}))
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

	const searchArtists = async (artistQueries: string[], genres: string[]) => {
		isSearchingArtists.value = true
		try {
			const searchResults = await $fetch("/api/spotify/search-artist", {
				method: "POST",
				body: { artists: artistQueries, genres } })

			return searchResults
		}
		catch (e) {
			error.value = e instanceof Error ? e.message : "Failed to search artists"
			console.error("Artist search error:", e)
			return null
		}
		finally {
			isSearchingArtists.value = false
		}
	}

	const searchTopTracks = async (artistId: string) => {
		isFindingTracks.value = true
		try {
			const topTracks = await $fetch(`/api/spotify/artist/topTracks/${artistId}`)
			return topTracks
		}
		catch (e) {
			error.value = e instanceof Error ? e.message : "Failed to fetch top tracks"
			console.error("Top tracks fetch error:", e)
			return null
		}
		finally {
			isFindingTracks.value = false
		}
	}

	return {
		loading: readonly(loading),
		error: readonly(error),
		analyzeEvent,
	}
}

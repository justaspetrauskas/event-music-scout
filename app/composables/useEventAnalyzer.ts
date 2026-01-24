export const useEventAnalyzer = () => {
	const isReadingUrl = ref(false)
	const isSearchingArtists = ref(false)
	const isFindingTracks = ref(false)
	const totalArtistsFound = ref(0)

	const loading = ref(false)
	const error = ref<string | null>(null)

	const analyzeEvent = async (url: string) => {
		loading.value = true
		try {
			const eventMeta = await $fetch("/api/analyze", { method: "POST", body: { url } })

			const artists = await searchArtists(eventMeta.artistQueries, eventMeta.genres)

			const { matches, total } = artists || { matches: [] }
			const identifiedArtistIds = matches?.map((artist: Artist) => artist.id) || []
			const artistMap = new Map(matches.map((artist: Artist) => [artist.id, artist]))
			totalArtistsFound.value = total || 0

			await Promise.all(
				identifiedArtistIds.map(async (artistId: string) => {
					try {
						const topTracks = await searchTopTracks(artistId)
						const artist = artistMap.get(artistId)
						if (artist) {
							artist.tracks = topTracks
						}
					}
					catch (error) {
						console.warn(`Failed to fetch top tracks for ${artistId}:`, error)
					}
				}),
			)

			eventMeta.artists = [...artistMap.values()]

			console.log("Event analysis complete:", eventMeta, artistMap)
			// sessionStorage.setItem("eventData", JSON.stringify(data))
			return eventMeta
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

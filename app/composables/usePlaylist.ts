import type { EventData } from "@@/types"

export const usePlaylist = () => {
	const selectedArtists = ref<Set<string>>(new Set())

	function toggleArtist(artistId: string) {
		if (selectedArtists.value.has(artistId)) {
			selectedArtists.value.delete(artistId)
		}
		else {
			selectedArtists.value.add(artistId)
		}
		// Trigger reactivity
		selectedArtists.value = new Set(selectedArtists.value)
	}

	function toggleSelectAll(event: EventData) {
		if (selectedArtists.value.size === event.artists.length) {
			selectedArtists.value.clear()
		}
		else {
			selectedArtists.value = new Set(event.artists.map(a => a.id))
		}
	}

	async function createPlaylist(event: EventData, artistIds: Set<string>) {
		try {
			const selectedArtistData = event.artists.filter(a => artistIds.has(a.id))

			const response = await $fetch("/api/spotify/playlist", {
				method: "POST",
				body: {
					name: event.name,
					artists: selectedArtistData,
					tracksPerArtist: 3,
				},
			})

			// Handle response (show success, redirect to Spotify, etc.)
			console.log("Playlist created:", response)

			return response
		}
		catch (e) {
			console.error("Playlist creation error:", e)
			throw e
		}
	}

	return {
		selectedArtists,
		toggleArtist,
		toggleSelectAll,
		createPlaylist,
	}
}

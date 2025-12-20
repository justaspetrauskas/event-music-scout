import { defineStore } from "pinia"
import { ref, computed } from "vue"
import type { Artist } from "@@/types"

interface EventData {
	artists: Artist[]
}

export const usePlaylistStore = defineStore("playlistStore", () => {
	const selectedArtists = ref<Map<string, Artist>>(new Map())

	const selectArtist = (artist: Artist) => {
		selectedArtists.value.set(artist.id, artist) // Stores ENTIRE artist object
	}

	const removeArtist = (artistId: string) => {
		selectedArtists.value.delete(artistId)
	}

	const toggleArtist = (artist: Artist) => {
		if (selectedArtists.value.has(artist.id)) {
			selectedArtists.value.delete(artist.id)
		}
		else {
			selectedArtists.value.set(artist.id, artist)
		}
	}

	const toggleSelectAll = (event: EventData) => {
		if (selectedArtists.value.size === event.artists.length) {
			selectedArtists.value.clear()
		}
		else {
			// Stores ENTIRE artist objects by id key
			const artistMap = new Map(event.artists.map(a => [a.id, a]))
			selectedArtists.value = artistMap
		}
	}

	// Direct access to full artist objects
	const getArtist = (artistId: string) => selectedArtists.value.get(artistId)

	// Convenience getters
	const selectedArtistArray = computed(() => Array.from(selectedArtists.value.values()))
	const selectedArtistIds = computed(() => Array.from(selectedArtists.value.keys()))
	const getAllTrackUris = computed(() => {
		return selectedArtistArray.value.flatMap(artist => artist.tracks.map(track => track.uri))
	})

	return {
		selectedArtists,
		selectArtist,
		removeArtist,
		toggleArtist,
		toggleSelectAll,
		getArtist,
		selectedArtistArray,
		selectedArtistIds,
		getAllTrackUris,
	}
})

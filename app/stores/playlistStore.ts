import { defineStore } from "pinia"
import { ref, computed } from "vue"
import type { Artist } from "@@/types"

interface EventData {
	artists: Artist[]
}

export const usePlaylistStore = defineStore("playlistStore", () => {
	const selectedArtists = ref<Map<string, Artist>>(new Map())
	const selectedTracks = ref<Set<string>>(new Set())

	const selectArtist = (artist: Artist) => {
		selectedArtists.value.set(artist.id, artist)
	}

	const removeArtist = (artistId: string) => {
		selectedArtists.value.delete(artistId)
	}

	const toggleTrack = (trackId: string) => {
		if (selectedTracks.value.has(trackId)) {
			selectedTracks.value.delete(trackId)
		}
		else {
			selectedTracks.value.add(trackId)
		}
	}

	const toggleArtist = (artist: Artist) => {
		artist.tracks.forEach((track) => {
			toggleTrack(track.uri as string)
		})
	}

	const toggleSelectAll = (event: EventData) => {
		const allTrackIds = event.artists.flatMap(artist =>
			artist.tracks.map(track => track.id),
		)

		// Bulk add all at once (much faster than N individual adds)
		selectedTracks.value = new Set([...selectedTracks.value, ...allTrackIds])
	}

	const getArtist = (artistId: string) => selectedArtists.value.get(artistId)

	const selectedArtistArray = computed(() => Array.from(selectedArtists.value.values()))
	const selectedArtistIds = computed(() => Array.from(selectedArtists.value.keys()))
	const getAllTrackUris = computed(() => {
		return selectedArtistArray.value.flatMap(artist => artist.tracks.map(track => track.uri))
	})

	const clearAllSelectedTracks = () => {
		selectedTracks.value.clear()
	}

	return {
		selectedArtists,
		selectArtist,
		removeArtist,
		toggleArtist,
		toggleSelectAll,
		getArtist,
		toggleTrack,
		selectedTracks,
		selectedArtistArray,
		selectedArtistIds,
		getAllTrackUris,
		clearAllSelectedTracks,
	}
})

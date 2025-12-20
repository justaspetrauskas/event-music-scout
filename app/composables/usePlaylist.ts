import type { AddTracksPayload, CreatePlaylistPayload, EventData } from "@@/types"

export const usePlaylist = () => {
	const userStore = useUserStore()
	const { user } = storeToRefs(userStore)
	const { getAccessToken } = useSpotifyOAuthMethods()

	// Selected artists by id (for UI); optional if you later move this to Pinia store
	const selectedArtists = ref<Set<string>>(new Set())

	const toggleArtist = (artistId: string) => {
		if (selectedArtists.value.has(artistId)) {
			selectedArtists.value.delete(artistId)
		}
		else {
			selectedArtists.value.add(artistId)
		}
		// new Set(...) is not needed for reactivity in Vue 3; Set mutations are tracked
		console.log("selected artist", selectedArtists.value)
	}

	const toggleSelectAll = (event: EventData) => {
		if (selectedArtists.value.size === event.artists.length) {
			selectedArtists.value.clear()
		}
		else {
			selectedArtists.value = new Set(event.artists.map(a => a.id))
		}
	}

	const createPlaylist = async (payload: CreatePlaylistPayload, token: string) => {
		if (!user.value?.id) return

		const data = await $fetch<{ id: string }>(
			`/api/playlist/user/${user.value.id}`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`, // NOT Basic, NOT raw token
				},
				body: {
					name: payload,
				},
			},
		)

		// $fetch throws on HTTP error, so no error ref to inspect here [web:46][web:50]
		return data
	}

	const addTracksToPlaylist = async (
		playlistId: string,
		payload: AddTracksPayload,
		token: string,
	) => {
		const data = await $fetch(
			`/api/playlist/${playlistId}`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`, // NOT Basic, NOT raw token
				},
				body: payload,
			},
		)

		return data
	}

	const createPlaylistWithTracks = async (
		playlistPayload: CreatePlaylistPayload,
		tracksPayload: AddTracksPayload,
	) => {
		const existingToken = await getAccessToken()
		if (!user.value?.id || !existingToken) return
		const playlist = await createPlaylist(playlistPayload, existingToken)
		if (!playlist?.id) return

		await addTracksToPlaylist(playlist.id, tracksPayload, existingToken)
		return playlist
	}

	return {
		selectedArtists,
		toggleArtist,
		toggleSelectAll,
		createPlaylist,
		addTracksToPlaylist,
		createPlaylistWithTracks,
	}
}

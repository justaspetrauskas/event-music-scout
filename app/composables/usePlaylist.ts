import type { AddTracksPayload, CreatePlaylistPayload, EventData } from "@@/types"

export const usePlaylist = () => {
	const userStore = useUserStore()
	const { user } = storeToRefs(userStore)

	const selectedArtists = ref<Set<string>>(new Set())

	const toggleArtist = (artistId: string) => {
		if (selectedArtists.value.has(artistId)) {
			selectedArtists.value.delete(artistId)
		}
		else {
			selectedArtists.value.add(artistId)
		}
	}

	const toggleSelectAll = (event: EventData) => {
		if (selectedArtists.value.size === event.artists.length) {
			selectedArtists.value.clear()
		}
		else {
			selectedArtists.value = new Set(event.artists.map(a => a.id))
		}
	}

	const createPlaylist = async (payload: CreatePlaylistPayload) => {
		if (!user.value?.id) return

		const data = await $fetch<{ id: string }>(
			`/api/playlist/user/${user.value.id}`,
			{
				method: "POST",
				body: {
					name: payload,
				},
			},
		)

		return data
	}

	const getUserPlaylists = async () => {
		const data = await $fetch(`/api/playlist/me`)

		const filteredPlaylists = data.filter(playlist => playlist.owner.id === user.value.id).map(p => ({ id: p.id, images: p.images, name: p.name, totalTracks: p.tracks.total }))
		return filteredPlaylists
	}

	const addTracksToPlaylist = async (
		playlistId: string,
		payload: string[],
		token: string | null = null,
	) => {
		const playlistData = {
			uris: Array.from(payload),
			position: 0,
		}

		const data = await $fetch(
			`/api/playlist/${playlistId}`,
			{
				method: "POST",
				body: playlistData,
			},
		)

		return data
	}

	const createPlaylistWithTracks = async (
		playlistPayload: CreatePlaylistPayload,
		tracksPayload: AddTracksPayload,
	) => {
		const playlist = await createPlaylist(playlistPayload)
		if (!playlist?.id) return

		await addTracksToPlaylist(playlist.id, tracksPayload)
		return playlist
	}

	return {
		selectedArtists,
		toggleArtist,
		toggleSelectAll,
		createPlaylist,
		addTracksToPlaylist,
		createPlaylistWithTracks,
		getUserPlaylists,
	}
}

export const useTrackPlaybackMethods = () => {
	const { getAccessToken } = useSpotifyOAuthMethods()
	const musicPlayerStore = useMusicPlayerStore()
	const { player, currentTrack } = storeToRefs(musicPlayerStore)

	const playTrack = async (trackUri: string[]) => {
		if (import.meta.env.DEV) console.log("play track", trackUri, player.value?.id)
		const existingToken = await getAccessToken()
		await $fetch("/api/spotify/player/play-track", {
			method: "PUT",
			headers: {
				Authorization: `Bearer ${existingToken}`,
			}, query: {
				device_id: player.value.id,
			}, body: {
				uris: trackUri,
				position_ms: 0,
			} })
	}

	const addTracksToQueue = async (trackUris: string[]) => {
		if (!trackUris.length) return
		if (import.meta.env.DEV) console.log("player value", player.value?.id)
		const existingToken = await getAccessToken()
		await $fetch("/api/spotify/player/add-to-queue", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${existingToken}`,
			}, body: {
				device_id: player.value.id,
				trackUris: trackUris,
			} })

		await playTrack([trackUris[0] as string])
	}

	const pauseTrack = async () => {
		const existingToken = await getAccessToken()
		await $fetch("/api/spotify/player/pause-track", {
			method: "PUT",
			headers: {
				Authorization: `Bearer ${existingToken}`,
			}, query: {
				device_id: player.value.id,
			} })
	}

	const nextTrack = async () => {
		if (import.meta.env.DEV) console.log("play next track")
		const existingToken = await getAccessToken()
		await $fetch("/api/spotify/player/next-track", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${existingToken}`,
			}, query: {
				device_id: player.value.id,
			} })
	}

	const previousTrack = async () => {
		const existingToken = await getAccessToken()
		await $fetch("/api/spotify/player/previous-track", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${existingToken}`,
			}, query: {
				device_id: player.value.id,
			} })
	}

	const getQueue = async () => {
		const existingToken = await getAccessToken()
		await $fetch("/api/spotify/player/queue", {
			method: "GET",
			headers: {
				Authorization: `Bearer ${existingToken}`,
			} })
	}

	return { playTrack, pauseTrack, addTracksToQueue, nextTrack, previousTrack, getQueue }
}

export const useTrackPlaybackMethods = () => {
	const { getAccessToken } = useSpotifyOAuthMethods()
	const musicPlayerStore = useMusicPlayerStore()
	const { player, currentTrack } = storeToRefs(musicPlayerStore)

	const playTrack = async (trackUri: string[]) => {
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

	return { playTrack, pauseTrack }
}

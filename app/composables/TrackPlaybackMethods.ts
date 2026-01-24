export const useTrackPlaybackMethods = () => {
	const musicPlayerStore = useMusicPlayerStore()
	const { player, currentTrack } = storeToRefs(musicPlayerStore)

	const playTrack = async (trackUri: string[]) => {
		await $fetch("/api/spotify/player/play-track", {
			method: "PUT",
			query: {
				device_id: player.value.id,
			}, body: {
				uris: trackUri,
				position_ms: 0,
			} })
	}

	const addTracksToQueue = async (trackUris: string[]) => {
		if (!trackUris.length) return

		await $fetch("/api/spotify/player/add-to-queue", {
			method: "POST",
			body: {
				device_id: player.value.id,
				trackUris: trackUris,
			} })

		await playTrack([trackUris[0] as string])
	}

	const pauseTrack = async () => {
		await $fetch("/api/spotify/player/pause-track", {
			method: "PUT",
			query: {
				device_id: player.value.id,
			} })
	}

	const nextTrack = async () => {
		if (import.meta.env.DEV) console.log("play next track")
		await $fetch("/api/spotify/player/next-track", {
			method: "POST",
			query: {
				device_id: player.value.id,
			} })
	}

	const previousTrack = async () => {
		await $fetch("/api/spotify/player/previous-track", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${existingToken}`,
			}, query: {
				device_id: player.value.id,
			} })
	}

	const getQueue = async () => {
		await $fetch("/api/spotify/player/queue")
	}

	return { playTrack, pauseTrack, addTracksToQueue, nextTrack, previousTrack, getQueue }
}

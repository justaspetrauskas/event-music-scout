import { defineStore } from "pinia"
import { ref } from "vue"
import type { Track } from "@@/types"

export interface SpotifyPlayer {
	player: Spotify.Player | null
	isConnected: Ref<boolean>
	connect: (token: string) => Promise<boolean>
	disconnect: () => void
	play: (uri?: string) => Promise<void>
	pause: () => Promise<void>
	nextTrack: () => Promise<void>
	previousTrack: () => Promise<void>
	setVolume: (volume: number) => Promise<void>
}

export const useMusicPlayerStore = defineStore("musicPlayerStore", () => {
	const { value: accessToken } = useCookie("spotify_access_token")

	const player = ref<Spotify.Player | null>(null)
	const isConnected = ref<boolean>(false)
	const isPaused = ref<boolean>(false)
	const isActive = ref<boolean>(false)
	const isPlayerVisible = ref<boolean>(false)
	const currentTrack = ref<Track | null>(null)
	const progress = ref<number>(0)
	const nextTrackInQueue = ref<Track | null>(null)
	const previousTrackInQueue = ref<Track | null>(null)

	const connectPlayer = async (): Promise<boolean> => {
		console.log("connect player")
		if (!import.meta.client || !window.Spotify?.Player) {
			console.log("Not running in client or Spotify SDK not available")
			return false
		}

		// Create player
		player.value = new window.Spotify.Player({
			name: "Music Scout Player",
			getOAuthToken: (cb: (token: string) => void) => cb(accessToken as string),
			volume: 0.5,
		})

		// Promise that resolves when READY fires
		const readyPromise = new Promise<boolean>((resolve) => {
			player.value!.addListener("ready", ({ device_id }: { device_id: string }) => {
				player.value!.id = device_id
				isConnected.value = true
				console.log("Player READY with device_id:", device_id)
				resolve(true)
			})
		})

		// Other listeners (these don't block)
		player.value.addListener("not_ready", () => {
			console.log("Player disconnected")
			isConnected.value = false
		})

		player.value.addListener("authentication_error", ({ message }) => {
			console.error("Auth error:", message)
			readyPromise.catch(() => {}) // Ignore ready promise on auth error
		})

		player.value.addListener("player_state_changed", (state) => {
			if (!state) {
				isActive.value = false
				return
			}
			currentTrack.value = state.track_window.current_track
			isPaused.value = state.paused
			progress.value = state.position
			nextTrackInQueue.value = state.track_window.next_tracks[0] || null
			previousTrackInQueue.value = state.track_window.previous_tracks[0] || null
			isActive.value = true
		})

		// Connect AND wait for ready
		const connectSuccess = await player.value.connect()
		if (!connectSuccess) {
			console.log("Connect failed")
			return false
		}

		// NOW wait for ready event
		const readySuccess = await Promise.race([
			readyPromise,
			new Promise<boolean>((_, reject) =>
				setTimeout(() => reject(new Error("Ready timeout")), 10000),
			),
		])

		return readySuccess as boolean
	}

	const disconnect = () => {
		player.value?.disconnect()
		player.value = null
	}

	const showPlayer = async () => {
		if (!isPlayerVisible.value) {
			console.log("starts connecting player")
			const isConnected = await connectPlayer()
			console.log("finishes connecting player", isConnected)
			isPlayerVisible.value = true

			return isConnected
		}
	}
	const hidePlayer = () => {
		isPlayerVisible.value = false
	}

	const play = async (track: Track) => {
		if (player.value) {
			await player.value.togglePlay()
			console.log("playing track", track, player.value)
		}
	}

	const pause = async () => await player.value?.pause()
	const resume = async () => await player.value?.resume()
	const togglePlayback = async () => await player.value?.togglePlay()
	const nextTrack = async () => {
		await player.value?.nextTrack()
	}
	const previousTrack = async () => await player.value?.previousTrack()
	const setVolume = async (volume: number) => await player.value?.setVolume(volume)

	return {
		player,
		isConnected,
		currentTrack,
		isPaused,
		progress,
		connectPlayer,
		disconnect,
		play,
		pause,
		nextTrack,
		previousTrack,
		setVolume,
		resume,
		togglePlayback,
		nextTrackInQueue,
		previousTrackInQueue,
		isPlayerVisible,
		showPlayer,
		hidePlayer,
	}
})

import { defineStore } from "pinia"
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
	const player = ref<Spotify.Player | null>(null)
	const isConnected = ref(false)
	const isPaused = ref(false)
	const isActive = ref(false)
	const isPlayerVisible = ref(false)
	const currentTrack = ref(null)
	const progress = ref(0)
	const nextTrackInQueue = ref(null)
	const previousTrackInQueue = ref(null)

	const connect = async (accessToken: string) => {
		if (!import.meta.client) return false

		const win = window as any
		// If the SDK isn't available yet, wait for the plugin promise to resolve
		if (!win.Spotify?.Player) {
			if (win._spotifySDKReady && typeof win._spotifySDKReady.then === "function") {
				try {
					await win._spotifySDKReady
				}
				catch (err) {
					if (import.meta.env.DEV) console.error("Spotify SDK failed to load", err)
					return false
				}
			}
			if (!win.Spotify?.Player) return false
		}

		player.value = new win.Spotify.Player({
			name: "Test Player",
			getOAuthToken: cb => cb(accessToken),
			volume: 0.5,
		})

		// Event listeners
		player.value.addListener("ready", ({ device_id }) => {
			console.log("Player ready:", device_id)
			player.value.id = device_id
			isConnected.value = true
		})

		player.value.addListener("not_ready", () => {
			console.log("Player disconnected")
			isConnected.value = false
		})

		player.value.addListener("authentication_error", ({ message }) => {
			console.error("Auth error:", message)
		})

		player.value.addListener("player_state_changed", (state) => {
			if (!state) {
				return
			}

			currentTrack.value = state.track_window.current_track
			isPaused.value = state.paused
			progress.value = state.position
			nextTrackInQueue.value = state.track_window.next_tracks[0] || null
			previousTrackInQueue.value = state.track_window.previous_tracks[0] || null

			player.value.getCurrentState().then((state: unknown) => {
				console.log("current state", state)
				isActive.value = !!state
			})
		})

		player.value.connect()
	}

	const disconnect = () => {
		player.value?.disconnect()
		player.value = null
	}

	const showPlayer = async () => {
		if (!isPlayerVisible.value) {
			const token = await getAccessToken()
			if (!token) return
			await connect(token)
			isPlayerVisible.value = true
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
		connect,
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

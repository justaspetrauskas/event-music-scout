export default defineNuxtPlugin(() => {
	if (import.meta.client) {
		const script = document.createElement("script")
		script.src = "https://sdk.scdn.co/spotify-player.js"
		script.async = true
		document.head.appendChild(script)

		script.onload = () => {
			console.log("Spotify Web Playback SDK ready")

			// window.onSpotifyWebPlaybackSDKReady = () => {
			// 	console.log("Spotify Web Playback SDK ready")
			// }
		}
	}
})

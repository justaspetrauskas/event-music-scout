export default defineNuxtPlugin(() => {
	if (import.meta.client) {
		const win = window as any
		if (!win._spotifySDKReady) {
			let resolveReady: () => void
			let rejectReady: (err?: any) => void
			win._spotifySDKReady = new Promise<void>((res, rej) => {
				resolveReady = res
				rejectReady = rej
			})

			window.onSpotifyWebPlaybackSDKReady = () => {
				resolveReady()
			}

			const script = document.createElement("script")
			script.src = "https://sdk.scdn.co/spotify-player.js"
			script.async = true
			script.onload = () => {
				// Some environments may call the global callback, others rely on onload.
				// Resolve if the global callback wasn't invoked.
				resolveReady()
			}
			script.onerror = (err) => {
				rejectReady(err)
			}
			document.head.appendChild(script)
		}
	}
})

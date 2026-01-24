import { setSpotifyState } from "../../../utils/session"
import { sendRedirect } from "h3"

function generateRandomString(length: number): string {
	const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
	let text = ""
	for (let i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length))
	}
	return text
}

export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig()
	const clientId = config.spotifyClientId
	const redirectUri = config.public.spotifyRedirectUri

	const state = generateRandomString(16)
	await setSpotifyState(event, state)

	const scope = "user-read-private user-read-email playlist-modify-public playlist-modify-private playlist-read-private streaming user-read-playback-state user-modify-playback-state"

	const params = new URLSearchParams({
		client_id: clientId as string,
		response_type: "code",
		redirect_uri: redirectUri as string,
		scope,
		state,
	})

	const authUrl = `https://accounts.spotify.com/authorize?`
		+ params.toString()

	sendRedirect(event, authUrl)
})

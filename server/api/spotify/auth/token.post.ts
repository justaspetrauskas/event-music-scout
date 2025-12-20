import { setCookie } from "h3"

export default defineEventHandler(async (event) => {
	const { spotifyClientSecret, spotifyClientId, spotifyRedirectUri } = useRuntimeConfig()

	const body = await readBody(event)

	const urlEncodedParams = new URLSearchParams({
		...body,
		client_id: spotifyClientId,
		client_secret: spotifyClientSecret,
		redirect_uri: spotifyRedirectUri,
	})

	const response = await fetch("https://accounts.spotify.com/api/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: urlEncodedParams.toString(),
	})

	const data = await response.json()

	if (!response.ok) {
		const error = await response.json()
		return { error }
	}

	if (data.refresh_token) {
		setCookie(event, "spotify_refresh_token", data.refresh_token, {
			httpOnly: true,
			secure: false,
			path: "/",
			maxAge: 60 * 60 * 24 * 30,
			sameSite: "lax",
		})
	}

	return {
		access_token: data.access_token,
		token_type: data.token_type,
		expires_in: data.expires_in,
		scope: data.scope,
	}
})

export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig()
	const tokens = getSpotifyTokens(event)

	if (!tokens.refreshToken) {
		return { error: "No refresh token available" }
	}

	const params = new URLSearchParams({
		grant_type: "refresh_token",
		refresh_token: refreshToken,
		client_id: config.spotifyClientId,
	})

	const response = await fetch("https://accounts.spotify.com/api/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: params.toString(),
	})

	const data = await response.json()

	if (!response.ok) {
		return { error: data }
	}

	await setSpotifyTokens(event, tokenResponse)

	return {
		access_token: data.access_token,
		expires_in: data.expires_in,
		token_type: data.token_type,
	}
})

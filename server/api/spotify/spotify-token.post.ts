export default defineEventHandler(async () => {
	const { spotifyClientSecret, spotifyClientId } = useRuntimeConfig()

	const params = new URLSearchParams()
	params.append("grant_type", "client_credentials")
	params.append("client_id", spotifyClientId)
	params.append("client_secret", spotifyClientSecret)

	const response = await fetch("https://accounts.spotify.com/api/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: params.toString(),
	})
	if (!response.ok) {
		const error = await response.json()
		return { error }
	}

	const data = await response.json()
	return {
		access_token: data.access_token,
		token_type: data.token_type,
		expires_in: data.expires_in,
	}
})

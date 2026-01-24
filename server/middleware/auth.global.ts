export default defineEventHandler(async (event) => {
	const tokens = getSpotifyTokens(event)
	if (tokens.access_token && !isTokenExpired(tokens)) {
		// Token is valid, proceed
		event.context.spotifyUser = {
			accessToken: tokens.access_token,
			isAuthenticated: true,
		}
	}
	else if (tokens.refresh_token) {
		// Try to refresh the token
		const refreshResponse = await $fetch("/api/spotify/auth/refresh-token")

		event.context.spotifyUser = {
			accessToken: refreshResponse.access_token,
			isAuthenticated: true,
		}
	}
	else {
		// No valid token, clear all tokens
		clearAllTokens(event)
		event.context.spotifyUser = {
			accessToken: null,
			isAuthenticated: false,
		}
	}
})

export default defineEventHandler(async (event) => {
	// Clear the global cache
	// @ts-expect-error
	globalThis.spotifyToken = { accessToken: null, expiresAt: 0 }

	// Delete the refresh token cookie
	deleteCookie(event, "spotify_refresh_token")

	return { success: true, message: "Logged out successfully" }
})

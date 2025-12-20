/* eslint-disable @typescript-eslint/ban-ts-comment */

export default defineEventHandler(async (event) => {
	const { spotifyClientSecret, spotifyClientId } = useRuntimeConfig()

	// In real app, use Redis or database.
	// @ts-expect-error
	if (!globalThis.spotifyToken) {
		// nothing cached yet
		globalThis!.spotifyToken = { accessToken: null, expiresAt: 0 }
	}

	// @ts-ignore
	const { accessToken, expiresAt } = globalThis.spotifyToken

	const now = Date.now()

	// If we still have a valid token (add small safety margin, e.g. 30s)
	if (accessToken && expiresAt - 30_000 > now) {
		console.log("access token from cache")
		return { access_token: accessToken, from: "cache" }
	}

	const refreshToken = getCookie(event, "spotify_refresh_token")
	if (!refreshToken) {
		return { error: "No refresh token available" }
	}

	const params = new URLSearchParams({
		grant_type: "refresh_token",
		refresh_token: refreshToken,
	})

	const authHeader = "Basic " + Buffer.from(`${spotifyClientId}:${spotifyClientSecret}`).toString("base64")

	const response = await fetch("https://accounts.spotify.com/api/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			"Authorization": authHeader,
		},
		body: params.toString(),
	})

	const data = await response.json()

	if (!response.ok) {
		return { error: data }
	}

	// Cache new access token with expiry
	// @ts-ignore
	// TODO investigate
	globalThis.spotifyToken = {
		accessToken: data.access_token,
		expiresAt: Date.now() + data.expires_in * 1000,
	}

	if (data.refresh_token) {
		console.log("sets new spotify token")
		setCookie(event, "spotify_refresh_token", data.refresh_token, {
			httpOnly: true,
			secure: false,
			path: "/",
			maxAge: 60 * 60 * 24 * 30,
			sameSite: "lax",
		})
	}

	// Return the refreshed access token and expiry to the client or use internally
	return {
		access_token: data.access_token,
		expires_in: data.expires_in,
		token_type: data.token_type,
	}
})

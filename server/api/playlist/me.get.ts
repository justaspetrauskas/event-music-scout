export default defineEventHandler(async (event) => {
	const { isAuthenticated, accessToken } = event.context.spotifyUser

	if (!isAuthenticated) {
		setResponseStatus(event, 401)
		return { error: "Not authenticated" }
	}
	const res = await fetch(`https://api.spotify.com/v1/me/playlists?limit=50`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	})

	if (!res.ok) {
		console.log("error while creating playlist")
		const error = await res.json()
		return { error }
	}

	const data = await res.json()
	return data.items
})

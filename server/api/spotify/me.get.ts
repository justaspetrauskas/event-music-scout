export default defineEventHandler(async (event) => {
	const { isAuthenticated, accessToken } = event.context.spotifyUser

	if (!isAuthenticated) {
		setResponseStatus(event, 401)
		return { error: "Not authenticated" }
	}

	const res = await fetch("https://api.spotify.com/v1/me", {
		method: "GET",
		headers: {
			Authorization: `Bearer ${accessToken}` as string,
		},
	})

	if (!res.ok) {
		setResponseStatus(event, res.status)
		const error = await res.json()
		return { error }
	}

	const data = await res.json()
	return data
})

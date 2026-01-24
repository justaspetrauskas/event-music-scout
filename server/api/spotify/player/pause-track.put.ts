export default defineEventHandler(async (event) => {
	const { isAuthenticated, accessToken } = event.context.spotifyUser

	if (!isAuthenticated) {
		setResponseStatus(event, 401)
		return { error: "Not authenticated" }
	}

	const { device_id } = getQuery(event)

	const res = await fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${device_id}`, {
		method: "PUT",
		headers: {
			"Authorization": `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
	})

	if (!res.ok) {
		console.log("not playing", res)
		return { success: false }
	}

	return { success: true }
})

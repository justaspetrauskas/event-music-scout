export default defineEventHandler(async (event) => {
	const { isAuthenticated, accessToken } = event.context.spotifyUser

	if (!isAuthenticated) {
		setResponseStatus(event, 401)
		return { error: "Not authenticated" }
	}

	const { device_id } = getQuery(event)

	const url = new URL("https://api.spotify.com/v1/me/player/next")
	url.searchParams.append("device_id", device_id as string)

	const res = await fetch(url.toString(), {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
	})

	if (!res.ok) {
		return { success: false }
	}

	return { success: true }
})

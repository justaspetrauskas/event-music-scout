export default defineEventHandler(async (event) => {
	const { isAuthenticated, accessToken } = event.context.spotifyUser

	if (!isAuthenticated) {
		setResponseStatus(event, 401)
		return { error: "Not authenticated" }
	}

	const body = await readBody(event) as { device_id?: string, trackUris: string[] }

	const { device_id, trackUris } = body

	if (!authorization || !trackUris?.length) {
		throw createError({ statusCode: 400, statusMessage: "Missing auth or trackUris" })
	}

	const results = await Promise.all(
		trackUris.map(async (trackUri) => {
			const url = new URL("https://api.spotify.com/v1/me/player/queue")
			if (device_id) url.searchParams.append("device_id", device_id)
			url.searchParams.append("uri", trackUri)

			const res = await fetch(url.toString(), {
				method: "POST",
				headers: {
					"Authorization": `Bearer ${accessToken}`,
					"Content-Type": "application/json",
				},
			})

			if (!res.ok) {
				const error = await res.json()
				return { uri: trackUri, error: error.error?.message }
			}
			return { uri: trackUri, success: true }
		}),
	)

	return { results }
})

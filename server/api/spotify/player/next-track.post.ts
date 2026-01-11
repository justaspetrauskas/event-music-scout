export default defineEventHandler(async (event) => {
	const { device_id } = getQuery(event)
	const authorization = event.node.req.headers["authorization"]

	const url = new URL("https://api.spotify.com/v1/me/player/next")
	url.searchParams.append("device_id", device_id as string)

	const res = await fetch(url.toString(), {
		method: "POST",
		headers: {
			"Authorization": authorization as string,
			"Content-Type": "application/json",
		},
	})

	if (!res.ok) {
		return { success: false }
	}

	return { success: true }
})

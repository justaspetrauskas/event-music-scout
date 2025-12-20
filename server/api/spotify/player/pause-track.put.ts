export default defineEventHandler(async (event) => {
	const { device_id } = getQuery(event)
	const authorization = event.node.req.headers["authorization"]

	const res = await fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${device_id}`, {
		method: "PUT",
		headers: {
			"Authorization": authorization as string,
			"Content-Type": "application/json",
		},
	})

	// const data = await res.json()

	if (!res.ok) {
		console.log("not playing", res)
		return { success: false }
	}

	return { success: true }
})

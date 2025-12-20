export default defineEventHandler(async (event) => {
	const authorization = event.node.req.headers["authorization"]
	const userId = getRouterParam(event, "userId")
	const body = await readBody(event)
	const res = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			"Authorization": authorization as string,
		},
		body: JSON.stringify(body),
	})

	const data = await res.json()

	if (!res.ok) {
		console.log("error while creating playlist")
		return { success: false }
	}

	console.log("success data", data)
	return data
})

export default defineEventHandler(async (event) => {
	const authorization = event.node.req.headers["authorization"]
	const res = await fetch(`https://api.spotify.com/v1/me/playlists?limit=50`, {
		method: "GET",
		headers: {
			Authorization: authorization as string,
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

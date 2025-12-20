export default defineEventHandler(async (event) => {
	const authorization = event.node.req.headers["authorization"]

	if (!authorization) {
		setResponseStatus(event, 401)
		return { error: "Not authenticated" }
	}

	const res = await fetch("https://api.spotify.com/v1/me", {
		method: "GET",
		headers: {
			Authorization: authorization as string,
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

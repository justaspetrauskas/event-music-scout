import { getQuery } from "h3"

export default defineEventHandler(async (event) => {
	const { device_id } = getQuery(event)
	const authorization = event.node.req.headers["authorization"]

	const body = await readBody(event)
	console.log("body", body)

	const url = new URL("https://api.spotify.com/v1/me/player/play")
	url.searchParams.append("device_id", device_id as string)

	const res = await fetch(url.toString(), {
		method: "PUT",
		headers: {
			"Authorization": authorization as string,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	})

	// const data = await res.json()

	if (!res.ok) {
		return { success: false }
	}

	return { success: true }
})

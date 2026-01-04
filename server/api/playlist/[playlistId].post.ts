import { getRouterParam } from "h3"

export default defineEventHandler(async (event) => {
	const authorization = event.node.req.headers["authorization"]
	const playlistId = getRouterParam(event, "playlistId")
	const body = await readBody(event)

	const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			"Authorization": authorization as string,
		},
		body: JSON.stringify(body),
	})

	const data = await res.json()

	if (!res.ok) {
		console.log("error while creating playlist", res)
		return { success: false }
	}

	return data
})

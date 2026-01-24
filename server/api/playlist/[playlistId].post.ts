import { getRouterParam } from "h3"

export default defineEventHandler(async (event) => {
	const { isAuthenticated, accessToken } = event.context.spotifyUser

	if (!isAuthenticated) {
		setResponseStatus(event, 401)
		return { error: "Not authenticated" }
	}
	const playlistId = getRouterParam(event, "playlistId")
	const body = await readBody(event)

	const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			"Authorization": `Bearer ${accessToken}`,
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

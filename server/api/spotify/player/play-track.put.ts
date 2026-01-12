import { getQuery } from "h3"

export default defineEventHandler(async (event) => {
	const { device_id } = getQuery(event) as { device_id?: string }
	const authorization = (event.node?.req?.headers || {})["authorization"] as string | undefined

	if (!authorization) {
		throw createError({ statusCode: 401, message: "Missing Authorization header" })
	}

	const body = await readBody(event)

	const url = new URL("https://api.spotify.com/v1/me/player/play")
	if (device_id) {
		url.searchParams.append("device_id", device_id)
	}

	const payload = typeof body === "object" && body !== null ? body : { uris: body }

	const res = await fetch(url.toString(), {
		method: "PUT",
		headers: {
			"Authorization": authorization,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	})

	if (!res.ok) {
		if (process.env.NODE_ENV !== "production") {
			const text = await res.text().catch(() => "")
			console.error("Spotify play-track error:", res.status, text)
		}
		return createError({ statusCode: res.status, message: "Spotify API error" })
	}

	return { success: true }
})

import type { RawTrack, Track } from "@@/types/index.ts"

function processTracks(tracks: RawTrack[]): Track[] {
	return tracks
		.sort((a, b) => b.popularity - a.popularity)
		.map(({ popularity, name, id, album, is_playable, duration_ms, uri, preview_url }) => ({
			popularity,
			name,
			id,
			album,
			isPlayable: is_playable,
			duration: duration_ms,
			uri,
			previewUrl: preview_url,
		}))
}

export default defineEventHandler(async (event) => {
	const { isAuthenticated, accessToken } = event.context.spotifyUser
	const id = event.context.params?.artistId

	if (!isAuthenticated) {
		setResponseStatus(event, 401)
		return { error: "Not authenticated" }
	}

	const res = await fetch(`https://api.spotify.com/v1/artists/${id}/top-tracks`,
		{
			headers: {
				"Authorization": `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
		},
	)
	if (!res.ok) {
		const error = await res.json()
		console.error("Error fetching top tracks:", error)
		setResponseStatus(event, res.status)
		return { error }
	}
	const { tracks } = await res.json()
	return processTracks(tracks)
})

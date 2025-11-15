import type { RawTrack, Track } from "@@/types/index.ts"

function processTracks(tracks: RawTrack[]): Track[] {
	return tracks
		.sort((a, b) => b.popularity - a.popularity)
		.map(({ popularity, name, id, album, is_playable, duration_ms }) => ({
			popularity,
			name,
			id,
			album,
			isPlayable: is_playable,
			duration: duration_ms,
		}))
}

export default defineEventHandler(async (event) => {
	const id = event.context.params?.artistId
	const authHeader = event.req.headers["authorization"] || event.req.headers["Authorization"]

	const res = await fetch(`https://api.spotify.com/v1/artists/${id}/top-tracks`,
		{
			headers: {
				"Authorization": `${authHeader}`,
				"Content-Type": "application/json",
			},
		},
	)
	if (!res.ok) {
		const error = await res.json()
		return { error }
	}
	const { tracks } = await res.json()

	return processTracks(tracks)
})

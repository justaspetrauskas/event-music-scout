import Fuse from "fuse.js"

type Artist = { id: string, name: string }

function findBestMatch(items: Artist[], query: string): string | null {
	const fuse = new Fuse(items, { keys: ["name"], includeScore: true })
	const results = fuse.search(query)
	if (results.length === 0) return null
	return results[0].item.id
}

export default defineEventHandler(async (event) => {
	const authHeader = event.req.headers["authorization"] || event.req.headers["Authorization"]
	const query = getQuery(event)?.q as string | undefined
	if (!query || !authHeader) return []

	const artistsQueryArr: string[] = query.split(",")
	// TODO implement logic to get a progress on the search
	// how many artist found, if some are not found

	const searchResults = await Promise.all(
		artistsQueryArr.map(async (artistQuery) => {
			const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artistQuery)}&type=artist&limit=10`,
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
			const { artists } = await res.json()
			const artistNames = artists.items.map(({ id, name }: Record<string, string>) => ({ id, name }))
			const bestMatchId = findBestMatch(artistNames, artistQuery)

			if (!bestMatchId) return null

			const topTracks = await $fetch(`/api/spotify/artist/topTracks/${bestMatchId}`, {
				headers: {
					Authorization: `${authHeader}`,
				},
			})
			const artist = artists.items.find((artist: Artist) => artist.id === bestMatchId)
			if (artist.id) artist.tracks = topTracks

			return artist
		}))

	return searchResults.filter(Boolean).map(({ followers, genres, id, images, name, popularity, uri, tracks }) => ({
		followers: followers.total.toString(),
		genres,
		id,
		images,
		name,
		popularity,
		tracks,
		uri,
	}))
})

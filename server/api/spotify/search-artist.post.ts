import Fuse from "fuse.js"
import type { Artist } from "~~/types"

function genreMatchesArtist(artistGenres: string[], targetGenres: string[]): boolean {
	if (!targetGenres.length || !artistGenres.length) return true

	const genreFuse = new Fuse(artistGenres, {
		threshold: 0.4,
		includeScore: true,
	})

	return targetGenres.some((targetGenre) => {
		const matches = genreFuse.search(targetGenre)
		return matches.some(match => match.score! < 0.8)
	})
}

function findBestMatch(items: Artist[], query: string, targetGenres: string[]): Artist | null {
	console.log("finding match for", query)
	const genreMatches = items.filter(artist =>
		genreMatchesArtist(artist.genres, targetGenres),
	)

	if (genreMatches.length === 0) {
		console.log(`No genre matches for "${query}" (target: ${targetGenres.join(", ")})`)
		return null
	}

	const exactMatch = genreMatches.find(artist =>

		artist?.name?.toLowerCase().trim() === query.toLowerCase().trim(),
	)
	if (exactMatch) {
		return exactMatch
	}

	const fuse = new Fuse(genreMatches, {
		keys: ["name"],
		includeScore: true,
		threshold: 0.3,
		minMatchCharLength: 3,
	})

	const results = fuse.search(query)
	if (!results[0]) return null
	const topResult = results[0]

	return topResult.item
}

export default defineEventHandler(async (event) => {
	const authorization = event.req.headers["authorization"] || event.req.headers["Authorization"]
	const body = await readBody(event) as { artists: string[], genres: string[] }

	if (!body.artists?.length) {
		throw createError({ statusCode: 400, message: "Artists array required" })
	}

	const artistsQueryArr = body.artists
	const eventGenres = body.genres || []

	// Search for each artist and find best genre match
	const searchResults = await Promise.all(
		artistsQueryArr.map(async (artistQuery: string) => {
			const res = await fetch(
				`https://api.spotify.com/v1/search?q=${encodeURIComponent(artistQuery)}&type=artist&limit=20`,
				{
					headers: {
						"Authorization": authorization! as string,
						"Content-Type": "application/json",
					},
				},
			)

			if (!res.ok) {
				const error = await res.json()
				return { error, inputArtist: artistQuery }
			}

			const { artists } = await res.json()

			const parsedArtists: Artist[] = artists.items
				.map((artist: Artist) => ({
					id: artist.id,
					name: artist.name,
					images: artist.images ?? [],
					genres: artist.genres ?? [],
				}))

			const bestMatch = findBestMatch(parsedArtists, artistQuery, eventGenres)
			if (!bestMatch) return null

			const topTracks = await $fetch(`/api/spotify/artist/topTracks/${bestMatch.id}`, {
				headers: {
					Authorization: authorization! as string,
				},
			})
			const artist = artists.items.find((artist: Artist) => artist.id === bestMatch.id)
			if (artist.id) artist.tracks = topTracks

			return artist
		}),
	)

	const successfulMatches = searchResults.filter(Boolean) as Artist[]
	const failedMatches = searchResults.filter(r => !r || r.error)

	console.log(`Matching complete: ${successfulMatches.length}/${artistsQueryArr.length} found`)

	return {
		matches: successfulMatches,
		total: artistsQueryArr.length,
		failed: failedMatches.length,
		data: successfulMatches.map(({ followers, genres, id, images, name, popularity, uri, tracks }: Artist) => ({
			followers: followers.total.toLocaleString(),
			genres,
			id,
			images,
			name,
			popularity,
			tracks,
			uri,
		})),
	}
})

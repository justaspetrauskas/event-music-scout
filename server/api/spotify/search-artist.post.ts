import Fuse from "fuse.js"
import type { Artist } from "@@/types"

function genreScore(artistGenres: string[], targetGenres: string[]): number {
	if (!artistGenres.length) return 0
	if (!targetGenres.length) return 1

	const fuse = new Fuse(targetGenres, {
		threshold: 0.4,
		includeScore: true,
		ignoreLocation: true,
		minMatchCharLength: 4,
	})

	const scores = artistGenres.map((genre) => {
		const result = fuse.search(genre)[0]
		return result ? 1 - result.score! : 0
	})

	return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
}

function findBestMatch(items: Artist[], query: string, targetGenres: string[]): Artist | null {
	const normalizedQuery = query.toLowerCase().trim()

	const qualified = items
		.map((artist) => {
			const gScore = genreScore(artist.genres || [], targetGenres)
			if (gScore === 0) return null

			const nameFuse = new Fuse([artist], { keys: ["name"], includeScore: true, isCaseSensitive: false, threshold: 0.5 })
			const nameResult = nameFuse.search(normalizedQuery)[0]

			const rawScore = nameResult?.score ?? 1
			const nScore = Number((1 - rawScore).toFixed(4))
			if (nScore < 0.8) return null

			return { artist, gScore, nScore }
		}).filter(Boolean)

	if (!qualified.length) return null
	return qualified.sort((a, b) => (b.gScore + b.nScore) - (a.gScore + a.nScore)).map(q => q.artist)[0]
}

export default defineEventHandler(async (event) => {
	const authorization = event.req.headers["authorization"] || event.req.headers["Authorization"]
	const body = await readBody(event) as { artists: string[], genres: string[] }

	if (!body.artists?.length) {
		throw createError({ statusCode: 400, message: "Artists array required" })
	}

	const artistsQueryArr = body.artists
	const eventGenres = body.genres || []
	const candidateCounts: number[] = []

	const searchResults = await Promise.all(

		artistsQueryArr.map(async (artistQuery: string) => {
			try {
				const res = await fetch(`https://api.spotify.com/v1/search?q=artist:${encodeURIComponent(artistQuery)}&type=artist&limit=30`, {
					headers: {
						"Authorization": authorization! as string,
						"Content-Type": "application/json",
					},
				})

				if (!res.ok) {
					const error = await res.json().catch(() => ({ error: "Spotify API error" }))
					return { error: { message: error.error?.message || "Search failed", status: res.status }, inputArtist: artistQuery }
				}

				const data = await res.json()
				const { artists } = data
				candidateCounts.push(Array.isArray(artists?.items) ? artists.items.length : 0)

				const parsedArtists: Artist[] = artists.items
					.map((artist: Artist) => ({
						id: artist.id,
						name: artist.name,
						images: artist.images ?? [],
						genres: artist.genres ?? [],
					}))

				const bestMatch = findBestMatch(parsedArtists, artistQuery, eventGenres)
				if (!bestMatch) return { error: "no_good_match", inputArtist: artistQuery }

				let topTracks = null
				try {
					topTracks = await $fetch(`/api/spotify/artist/topTracks/${bestMatch.id}`, {
						headers: { Authorization: authorization! as string },
					})
				}
				catch (tracksError) {
					console.warn(`Top tracks failed for ${bestMatch.name}:`, tracksError)
				}

				const artist = artists.items.find((a: Artist) => a.id === bestMatch.id)
				if (artist?.id) {
					;(artist as any).tracks = topTracks
				}
				return artist
			}
			catch (error) {
				console.error(`Search crashed for "${artistQuery}":`, error)
				return { error: "fetch_failed", inputArtist: artistQuery }
			}
		}),
	)

	const successfulMatches = searchResults.filter((r): r is Artist => !!r && !("error" in r))
	const failedMatches = searchResults.filter(r => !r || "error" in r) as any[]

	const filteredMatches = successfulMatches.filter(a =>
		Array.isArray(a?.images) && a.images.length > 0
		&& Array.isArray(a?.tracks) && a.tracks.length > 0,
	)

	const removedDueToMissing = successfulMatches.filter(a => !filteredMatches.includes(a))
	removedDueToMissing.forEach(a => failedMatches.push({ error: "missing_images_or_tracks", id: a?.id }))

	const mapping = artistsQueryArr.map((inputArtist, idx) => {
		const result = searchResults[idx]
		if (!result || "error" in result) {
			return {
				input: inputArtist,
				candidateCount: candidateCounts[idx] ?? 0,
				matched: null,
				error: (result as any)?.error ?? "no_match",
			}
		}
		const matched = filteredMatches.find(m => m.id === (result as Artist).id) || null
		return {
			input: inputArtist,
			candidateCount: candidateCounts[idx] ?? 0,
			matched: matched ? { id: matched.id, name: matched.name } : null,
			error: undefined,
		}
	})

	console.log("filtered matches: ", filteredMatches.map(m => ({ name: m.name, genres: m.genres })))
	return {
		matches: filteredMatches,
		total: artistsQueryArr.length,
		failed: failedMatches.length,
		data: filteredMatches.map(({ followers, genres, id, images, name, popularity, uri, tracks }: Artist) => ({
			followers: followers?.total?.toLocaleString() ?? "0",
			genres,
			id,
			images,
			name,
			popularity,
			tracks,
			uri,
		})),
		mapping,
	}
})

import Fuse from "fuse.js"
import type { Artist } from "@@/types"

function normalizeGenre(genre: string): string {
	return genre.toLowerCase().trim().replace(/[-\s]+/g, " ").replace(/\s+/g, " ")
}

function genreScore(artistGenres: string[], targetGenres: string[]): number {
	if (!targetGenres.length) return 1.0
	if (!artistGenres.length) return 0.1

	const normalizedTargetWords = targetGenres
		.map(g => normalizeGenre(g).split(" "))
		.flat()
		.filter(word => word.length > 2)

	// CRITICAL: EVERY artist genre must match event OR be neutral
	const allArtistGenresMatch = artistGenres.every((ag) => {
		const normAg = normalizeGenre(ag)
		// Must contain event genre word OR be genre-neutral (no strong genre identity)
		const isNeutralGenre = normAg.length < 4 || ["pop", "rock", "electronic"].includes(normAg)
		const hasEventGenreWord = normalizedTargetWords.some(targetWord =>
			normAg.includes(targetWord) || targetWord.includes(normAg),
		)
		return isNeutralGenre || hasEventGenreWord
	})

	if (!allArtistGenresMatch) return 0.0

	// Count positive matches among valid artists
	let matches = 0
	targetGenres.forEach((target) => {
		const targetWords = normalizeGenre(target).split(" ")
		artistGenres.forEach((ag) => {
			const agWords = normalizeGenre(ag).split(" ")
			const wordMatches = targetWords.filter(word => agWords.includes(word)).length
			matches += wordMatches
		})
	})

	return Math.min(matches / targetGenres.length, 1.0)
}

function findBestMatch(items: Artist[], query: string, targetGenres: string[]): Artist | null {
	const normalizedQuery = query.toLowerCase().trim()

	// Find ALL genre-qualified + name-similar artists
	const qualified = items
		.map((artist) => {
			const gScore = genreScore(artist.genres || [], targetGenres)
			if (gScore === 0) return null

			const nameFuse = new Fuse([artist], { keys: ["name"], threshold: 0.5 })
			const nameResult = nameFuse.search(normalizedQuery)[0]
			if (!nameResult || nameResult.score > 0.6) return null

			return { artist, gScore, nScore: 1 - nameResult.score! }
		})
		.filter(Boolean) as { artist: Artist, gScore: number, nScore: number }[]

	if (!qualified.length) return null

	// Group by exact name for duplicates
	const nameGroups = qualified.reduce((groups, item) => {
		const nameKey = normalizeGenre(item.artist.name)
		if (!groups[nameKey]) groups[nameKey] = []
		groups[nameKey].push(item)
		return groups
	}, {} as Record<string, typeof qualified>)

	// Return top match OR all duplicates with same name
	const topGroup = Object.values(nameGroups)
		.map(group => group.reduce((best, curr) => curr.gScore > best.gScore ? curr : best))
		.sort((a, b) => b.gScore - a.gScore)[0]

	const sameNameMatches = nameGroups[normalizeGenre(topGroup.artist.name)]
	return sameNameMatches.length > 1
		? sameNameMatches.map(m => m.artist) // Return array for duplicates
		: topGroup.artist
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

	console.log("Event genres:", eventGenres)

	const searchResults = await Promise.all(
		artistsQueryArr.map(async (artistQuery: string) => {
			try {
				const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artistQuery)}&type=artist&limit=30`, {
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

				console.log("Artist query:", artistQuery)
				parsedArtists.forEach((a) => {
					console.log(`Candidate: ${a.name} | Genres: ${a.genres.join(", ")}`)
				})

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

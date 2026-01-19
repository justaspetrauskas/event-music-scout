import Fuse from "fuse.js"
import type { Artist } from "@@/types"

interface ScoredArtist {
	artist: Artist
	score: number
	genreScore: number
	nameScore: number
}

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

	// ULTRA-STRICT: Artist must have EXACT genre word overlap
	const hasExactGenreMatch = artistGenres.some((ag) => {
		const normAg = normalizeGenre(ag)
		return normalizedTargetWords.some(targetWord =>
			normAg.includes(targetWord) || targetWord.includes(normAg),
		)
	})

	if (!hasExactGenreMatch) return 0.0

	let score = 0
	targetGenres.forEach((target) => {
		const targetWords = normalizeGenre(target).split(" ")
		artistGenres.forEach((ag) => {
			const agWords = normalizeGenre(ag).split(" ")
			const matches = targetWords.filter(word => agWords.includes(word)).length
			score += matches * 2
		})
	})

	return Math.min(score / targetGenres.length, 1.0)
}

function findBestMatch(items: Artist[], query: string, targetGenres: string[]): Artist | null {
	const normalizedQuery = query.toLowerCase().trim()

	// 1. EXACT name match first
	const exactMatch = items.find(a => normalizeGenre(a?.name || "") === normalizedQuery)
	if (exactMatch) return exactMatch

	// 2. ONLY genre-qualified artists
	const genreQualified = items.filter((a) => {
		const gScore = genreScore(a.genres || [], targetGenres)
		return gScore > 0.3
	})

	if (!genreQualified.length) return null

	// 3. Name search ONLY within genre-qualified
	const nameFuse = new Fuse(genreQualified, {
		keys: ["name"],
		threshold: 0.4,
		includeScore: true,
	})

	const results = nameFuse.search(normalizedQuery)
	if (!results.length) return null

	// 4. Pick highest genre score among top name matches
	const topCandidates = results.slice(0, 3).map(r => r.item)
	const best = topCandidates.reduce((best, current) => {
		const currentGenreScore = genreScore(current.genres || [], targetGenres)
		const bestGenreScore = genreScore(best.genres || [], targetGenres)
		return currentGenreScore > bestGenreScore ? current : best
	})

	return best
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

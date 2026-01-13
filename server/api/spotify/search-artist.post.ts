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
	if (!artistGenres.length) return 0.0

	const normalizedArtist = artistGenres.map(normalizeGenre)
	const normalizedTarget = targetGenres.map(normalizeGenre)
	let totalScore = 0
	let matchCount = 0

	normalizedTarget.forEach((target) => {
		// 1. Exact match (weight 1.0)
		if (normalizedArtist.includes(target)) {
			totalScore += 1.0
			matchCount++
			return
		}

		// 2. Strict fuzzy (only very close variants, threshold 0.2)
		const genreFuse = new Fuse(normalizedArtist, {
			threshold: 0.2, // Much tighter
			includeScore: true,
		})
		const matches = genreFuse.search(target)
		const bestMatch = matches[0]
		if (bestMatch?.score && bestMatch.score < 0.3) {
			totalScore += (1 - bestMatch.score) * 0.7 // Penalize fuzzy
			matchCount++
		}
	})

	return matchCount > 0 ? totalScore / matchCount : 0
}

function findBestMatch(items: Artist[], query: string, targetGenres: string[]): Artist | null {
	const normalizedQuery = query.toLowerCase().trim()

	// 1. Exact name match (ignores genres)
	const exactMatch = items.find(a => normalizeGenre(a?.name || "") === normalizedQuery)
	if (exactMatch) return exactMatch

	// 2. Name pre-filter (must have decent name similarity first)
	const nameFuse = new Fuse(items.filter(a => a?.name), {
		keys: ["name"],
		threshold: 0.4, // Stricter name filter
		includeScore: true,
	})
	const nameMatches = nameFuse.search(normalizedQuery)
	const candidates = nameMatches
		.filter((m): m is Fuse.FuseResult<Artist> => m.score !== undefined && m.score < 0.5)
		.slice(0, 20) // Limit to top name candidates

	if (!candidates.length) return null

	// 3. Score candidates by genre + name
	const scoredItems: ScoredArtist[] = candidates.map(({ item: artist }) => {
		const genreScoreVal = genreScore(artist.genres || [], targetGenres)
		const nameResult = nameFuse.search(normalizedQuery).find(r => r.item === artist)
		const nameScore = nameResult?.score ? (1 - nameResult.score) : 0

		// Dynamic weighting: name dominant unless perfect genre match
		const weightName = genreScoreVal < 0.8 ? 0.9 : 0.6
		const combinedScore = (nameScore * weightName) + (genreScoreVal * (1 - weightName))

		return { artist, score: combinedScore, genreScore: genreScoreVal, nameScore }
	}).sort((a, b) => b.score - a.score)

	return scoredItems[0]?.artist ?? null
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
			const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artistQuery)}&type=artist&limit=30`,
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
			candidateCounts.push(Array.isArray(artists?.items) ? artists.items.length : 0)

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
	const failedMatches = searchResults.filter(r => !r || r.error) as any[]

	// Exclude artists that lack images or top tracks from the final results
	const filteredMatches = successfulMatches.filter(a => Array.isArray(a?.images) && a.images.length > 0 && Array.isArray(a?.tracks) && a.tracks.length > 0)
	const removedDueToMissing = successfulMatches.filter(a => !filteredMatches.includes(a))

	removedDueToMissing.forEach(a => failedMatches.push({ error: "missing_images_or_tracks", id: a?.id }))

	const mapping = artistsQueryArr.map((inputArtist, idx) => {
		const result = searchResults[idx]
		if (!result) return { input: inputArtist, candidateCount: candidateCounts[idx] ?? 0, matched: null, error: result?.error ?? "no_match" }
		const matched = (filteredMatches.find(m => m.id === (result as Artist).id) || null) as Artist | null
		return {
			input: inputArtist,
			candidateCount: candidateCounts[idx] ?? 0,
			matched: matched ? { id: matched.id, name: matched.name } : null,
			error: (!result || (result as any).error) ? (result as any).error : undefined,
		}
	})

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

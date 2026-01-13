import Fuse from "fuse.js"
import type { Artist } from "~~/types"

function genreScore(artistGenres: string[], targetGenres: string[]): number {
	if (!targetGenres.length) return 1.0 // Perfect if no genre filter
	if (!artistGenres.length) return 0.0 // Worst if no genres

	let totalScore = 0
	let matchCount = 0

	targetGenres.forEach((targetGenre) => {
		const genreFuse = new Fuse(artistGenres, {
			threshold: 0.3, // Tighter for scoring
			includeScore: true,
		})
		const matches = genreFuse.search(targetGenre)
		const bestMatch = matches.find(m => typeof m.score === "number" && m.score! < 0.6)
		if (bestMatch?.score) {
			totalScore += (1 - bestMatch.score) // Convert to 0-1 positive score
			matchCount++
		}
	})

	return matchCount > 0 ? totalScore / matchCount : 0
}

function findBestMatch(items: Artist[], query: string, targetGenres: string[]): Artist | null {
	const normalizedQuery = query.toLowerCase().trim()

	// 1) Exact name match first (no genre filter)
	const exactAcrossAll = items.find(a => a?.name?.toLowerCase().trim() === normalizedQuery)
	if (exactAcrossAll) return exactAcrossAll

	// 2) Score ALL items by genre + name, no pre-filtering
	const scoredItems = items
		.filter(a => a?.name) // Must have name
		.map((artist) => {
			const genreScoreVal = genreScore(artist.genres || [], targetGenres)
			const nameFuse = new Fuse([artist], {
				keys: ["name"],
				threshold: 0.5, // Allow slightly looser name matches
				includeScore: true,
			})
			const nameResult = nameFuse.search(normalizedQuery)[0]
			const nameScore = nameResult?.score ? (1 - nameResult.score) : 0

			// Combined score: 70% name + 30% genre (adjust weights as needed)
			const combinedScore = (nameScore * 0.7) + (genreScoreVal * 0.3)

			return { artist, score: combinedScore, genreScore: genreScoreVal, nameScore }
		})
		.sort((a, b) => b.score - a.score) // Descending (higher better)

	return scoredItems[0]?.artist ?? null
}

export default defineEventHandler(async (event) => {
	const authorization = event.req.headers["authorization"] || event.req.headers["Authorization"]
	const body = await readBody(event) as { artists: string[], genres: string[] }

	console.log("body", body)
	if (!body.artists?.length) {
		throw createError({ statusCode: 400, message: "Artists array required" })
	}

	const artistsQueryArr = body.artists
	const eventGenres = body.genres || []

	// Search for each artist and find best genre match
	const candidateCounts: number[] = []
	const searchResults = await Promise.all(
		artistsQueryArr.map(async (artistQuery: string) => {
			const res = await fetch(
				`https://api.spotify.com/v1/search?q=${encodeURIComponent(artistQuery)}&type=artist&limit=30`,
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

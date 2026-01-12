import Fuse from "fuse.js"
import type { Artist } from "~~/types"

function genreMatchesArtist(artistGenres: string[], targetGenres: string[]): boolean {
	// If there are no target genres, consider it a match (no genre filter requested)
	if (!targetGenres.length) return true

	// If the artist has no genres, treat it as non-matching when the caller provided target genres.
	if (!artistGenres.length) return false

	const genreFuse = new Fuse(artistGenres, {
		threshold: 0.4,
		includeScore: true,
	})

	return targetGenres.some((targetGenre) => {
		const matches = genreFuse.search(targetGenre)
		// Fuse score: lower is better. Accept reasonably good matches only.
		return matches.some(match => typeof match.score === "number" && match.score < 0.5)
	})
}

function findBestMatch(items: Artist[], query: string, targetGenres: string[]): Artist | null {
	const normalizedQuery = query.toLowerCase().trim()

	// 1) Prefer exact name match across all returned items (avoid filtering by genre first)
	const exactAcrossAll = items.find(a => a?.name?.toLowerCase().trim() === normalizedQuery)
	if (exactAcrossAll) return exactAcrossAll

	// 2) Filter by genre if target genres provided
	const genreMatches = items.filter(artist => genreMatchesArtist(artist.genres, targetGenres))

	if (genreMatches.length === 0) {
		// If no genre matches, fall back to fuzzy search over all items rather than giving up
		const fallbackFuse = new Fuse(items, { keys: ["name"], includeScore: true, threshold: 0.45, minMatchCharLength: 2 })
		const fallback = fallbackFuse.search(query)
		return fallback[0]?.item ?? null
	}

	// 3) Prefer exact match within genre-matched subset
	const exactInGenre = genreMatches.find(a => a?.name?.toLowerCase().trim() === normalizedQuery)
	if (exactInGenre) return exactInGenre

	// 4) Fuzzy search within genre matches
	const fuse = new Fuse(genreMatches, {
		keys: ["name"],
		includeScore: true,
		threshold: 0.35,
		minMatchCharLength: 2,
	})

	const results = fuse.search(query)
	return results[0]?.item ?? null
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

	// Add removed items to failed list for reporting
	removedDueToMissing.forEach(a => failedMatches.push({ error: "missing_images_or_tracks", id: a?.id }))

	if (process.env.NODE_ENV !== "production") {
		console.log(`Matching complete: ${filteredMatches.length}/${artistsQueryArr.length} found (removed ${removedDueToMissing.length} missing images/tracks)`)
	}

	// Build per-input mapping to help identify which input matched which artist (or failed)
	const mapping = artistsQueryArr.map((inputArtist, idx) => {
		const result = searchResults[idx]
		if (!result) return { input: inputArtist, candidateCount: candidateCounts[idx] ?? 0, matched: null, error: result?.error ?? "no_match" }
		const matched = (filteredMatches.find(m => m.id === (result as Artist).id) || null) as Artist | null
		return {
			input: inputArtist,
			candidateCount: candidateCounts[idx] ?? 0,
			matched: matched ? { id: matched.id, name: matched.name } : null,
			raw: process.env.NODE_ENV !== "production" ? result : undefined,
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

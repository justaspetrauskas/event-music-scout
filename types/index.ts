export interface Artist {
	id: string
	name: string
	images: Images[]
	genres: string[]
	popularity: number
	followers: number
	image: string
	spotifyUrl: string
	tracks: Track[]
	uir: string
}

interface Images {
	height: number
	url: string
	width: number
}

export interface Playlist {
	id: string
	images: Images[]
	name: string
	totalTracks: number
}

export interface Track {
	id: string
	name: string
	duration: number
	previewUrl?: string
	isPlayable: boolean
	album: string
	popularity: string | number
	uri: string
}

export interface EventData {
	name: string
	date: string
	artistQueries: string[]
	location: string
	genres: string[]
	url: string
	artists: Artist[]
	aiSummary?: string
}

export interface PlaybackState {
	currentTrackId: string | null
	isPlaying: boolean
	currentArtist: string | null
}

export interface PlaylistConfig {
	name: string
	tracksPerArtist: number
	selectedArtistIds: Set<string>
}

export interface RawTrack {
	popularity: number
	name: string
	id: string
	album: string
	is_playable: boolean
	duration_ms: number
	preview_url: string
	uri: string
}

export type CreatePlaylistPayload = {
	name: string
	description?: string
	public?: boolean
}

export type AddTracksPayload = {
	uris: string[]
	position?: number
}

interface SpotifyExplicitContent {
	filter_enabled: boolean
	filter_locked: boolean
}

interface SpotifyExternalUrls {
	spotify: string
}

interface SpotifyFollowers {
	href: string | null
	total: number
}

interface SpotifyImage {
	height: number | null
	url: string
	width: number | null
}

export interface User {
	country: string
	display_name: string
	email: string
	explicit_content: SpotifyExplicitContent
	external_urls: SpotifyExternalUrls
	followers: SpotifyFollowers
	href: string
	id: string
	images: SpotifyImage[]
	product: "premium" | "free"
	type: "user"
	uri: string
}

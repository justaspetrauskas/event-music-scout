export interface Artist {
	id: string
	name: string
	images: ArtistImage[]
	genres: string[]
	popularity: number
	followers: string
	image: string
	spotifyUrl: string
	tracks: Track[]
}

interface ArtistImage {
	height: number
	url: string
	width: number
}

export interface Track {
	id: string
	name: string
	duration: number
	previewUrl?: string
	isPlayable: boolean
	album: string
	popularity: string | number
	uri?: string
}

export interface EventData {
	name: string
	date: string
	location: string
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
	// previewUrl: string
	// uri: string
}

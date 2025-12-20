<template>
	<div
		class="artist-card"
		:class="{ selected }"
	>
		<ArtistHeader
			:artist="artist"
			:selected="selected"
			@toggle-select="handleSelectArtist(artist)"
		/>

		<ArtistTracks
			:tracks="artist.tracks"
			:current-track-id="null"
			@play-track="handlePlayTrack"
		/>
	</div>
</template>

<script lang="ts" setup>
import type { Artist } from "@@/types"
import { usePlaylistStore } from "~/stores/playlistStore"

const playlistStore = usePlaylistStore()
const { toggleArtist } = usePlaylistStore()
const { getAllTrackUris } = storeToRefs(playlistStore)

const props = defineProps<{
	artist: Artist
	selected: boolean
}>()

const emit = defineEmits<{
	"toggle-select": [artistId: string]
	"play-track": [trackId: string, artistName: string, trackName: string]
}>()

const handlePlayTrack = (trackId: string, trackName: string) => {
	emit("play-track", trackId, props.artist.name, trackName)
}

const handleSelectArtist = (artist: Artist) => {
	// check if selecting or deselecting
	toggleArtist(artist)
	// const trackUris = artist.tracks.map(track => track.uri)
	console.log("select artist", getAllTrackUris.value)
	// emit("toggle-select", artist.id)
}
</script>

<style>
.artist-card {
  padding: 1.25rem;
  border-radius: var(--pico-border-radius);
  border: 2px solid var(--pico-card-border-color);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  transition: all 0.2s;
}

.artist-card.selected {
  border-color: var(--pico-primary);
  box-shadow: 0 0 0 2px var(--pico-primary-focus);
	backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
}
</style>

<template>
	<div
		class="artist-card"
		:class="{ selected }"
	>
		<ArtistHeader
			:artist="artist"
			:selected="selected"
			@toggle-select="emit('toggle-select', artist.id)"
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

const props = defineProps<{
	artist: Artist
	selected: boolean
}>()

const emit = defineEmits<{
	"toggle-select": [artistId: string]
	"play-track": [trackId: string, artistName: string, trackName: string]
}>()

function handlePlayTrack(trackId: string, trackName: string) {
	emit("play-track", trackId, props.artist.name, trackName)
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

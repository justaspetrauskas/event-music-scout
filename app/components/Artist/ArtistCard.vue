<template>
	<div
		class="border-b border-gray-500 last:border-b-0"
		:class="{ selected }"
	>
		<div
			class="w-full flex items-center gap-4 p-3 hover:bg-muted/50 transition-colors duration-200 group"
			role="button"
			@click.stop="setIsExpanded"
		>
			<div
				class="flex-shrink-0 text-muted-foreground group-hover:text-foreground transform transition-transform duration-200"
				:class="{ 'rotate-180': isExpanded }"
			>
				<ChevronDown class="w-4 h-4" />
			</div>
			<ArtistHeader
				:artist="artist"
				:selected="selected"
			/>
		</div>

		<!-- <ArtistControls @toggle-select="handleSelectArtist(artist)" /> -->
		<ArtistTracks
			v-if="isExpanded"
			:tracks="artist.tracks"
			:current-track-id="null"
			:is-expanded="isExpanded"
			@play-track="handlePlayTrack"
		/>
	</div>
</template>

<script lang="ts" setup>
import type { Artist } from "@@/types"
import { ChevronDown } from "lucide-vue-next"
import { usePlaylistStore } from "~/stores/playlistStore"

const playlistStore = usePlaylistStore()
const { toggleArtist } = usePlaylistStore()
const { getAllTrackUris } = storeToRefs(playlistStore)

const props = defineProps<{
	artist: Artist
	selected: boolean
}>()

const isExpanded = ref(false)

const emit = defineEmits<{
	"toggle-select": [artistId: string]
	"play-track": [trackId: string, artistName: string, trackName: string]
}>()

const handlePlayTrack = (trackId: string, trackName: string) => {
	emit("play-track", trackId, props.artist.name, trackName)
}

const setIsExpanded = () => {
	isExpanded.value = !isExpanded.value
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

</style>

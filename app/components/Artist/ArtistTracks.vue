<template>
	<div class="tracks-section">
		<div class="tracks-header">
			<span class="tracks-title">Top Tracks</span>
		</div>

		<div class="track-list">
			<TrackItem
				v-for="track in tracks"
				:key="track.id"
				:track="track"
				:is-playing="currentTrackId === track.id"
				@play="emit('play-track', track.id, track.name)"
			/>
		</div>
	</div>
</template>

<script lang="ts" setup>
import type { Track } from "../../../types"

defineProps<{
	tracks: Track[]
	currentTrackId: string | null
}>()

const emit = defineEmits<{
	"play-track": [trackId: string, trackName: string]
}>()
</script>

<style>

</style>

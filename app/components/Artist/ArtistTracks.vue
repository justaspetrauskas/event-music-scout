<template>
	<Transition name="tracks-collapse">
		<div
			v-if="isExpanded"
			class="py-4"
		>
			<h4 class="font-bold">
				Top tracks
			</h4>

			<TrackItem
				v-for="track in tracks"
				:key="track.id"
				:track="track"
				:is-playing="currentTrackId === track.id"
			/>
		</div>
	</Transition>
</template>

<script lang="ts" setup>
import type { Track } from "@@/types"

const { play } = useMusicPlayerStore()
const musicPlayerStore = useMusicPlayerStore()
const { player, isConnected } = storeToRefs(musicPlayerStore)

defineProps<{
	tracks: Track[]
	currentTrackId: string | null
	isExpanded: boolean
}>()

const emit = defineEmits<{
	"play-track": [trackId: string, trackName: string]
}>()
</script>

<style>
.tracks-collapse-enter-active,
.tracks-collapse-leave-active {
  transition: all 0.3s ease-in-out;
  transition-delay: 0.15s;
}

.tracks-collapse-enter-from,
.tracks-collapse-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

.tracks-collapse-enter-to,
.tracks-collapse-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>

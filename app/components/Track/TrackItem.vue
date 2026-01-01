<template>
	<div
		class="track-item flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer
           hover:bg-spotify/60 transition-colors duration-150 group"
	>
		<input
			type="checkbox"
			class="artist-checkbox"
			:checked="selected"
			@change="handleSelectTrack"
		>
		<!-- Play button -->
		<PlayButton
			:is-playing="isPlaying"
			@click.stop="handlePlayTrack"
		/>

		<!-- Track info -->
		<div class="track-info flex-1 min-w-0">
			<div
				class="track-name text-sm font-medium text-foreground truncate
               group-hover:text-foreground"
			>
				{{ track.name }}
			</div>
		</div>

		<!-- Duration -->
		<div class="track-duration text-xs text-muted-foreground text-semibold">
			{{ trackDuration }}
		</div>
	</div>
</template>

<script lang="ts" setup>
import type { Track } from "~~/types"
import PlayButton from "../UI/PlayButton.vue"

const { msToMinutesSeconds } = useUseUtilMethods()
const { playTrack } = useTrackPlaybackMethods()
const musicPlayerStore = useMusicPlayerStore()
const { togglePlayback } = musicPlayerStore
const { currentTrack, isPaused } = storeToRefs(musicPlayerStore)

const props = defineProps<{
	track: Track
}>()

const emit = defineEmits<{
	play: []
}>()

const isPlaying = computed(() => currentTrack.value && currentTrack.value?.id === props.track.id && !isPaused.value)

const trackDuration = computed(() => {
	return msToMinutesSeconds(+props.track.duration)
})

const handleSelectTrack = () => {
	console.log("selected track", props.track)
}

const handlePlayTrack = async () => {
	if (!props.track.uri) return

	const isCurrent = currentTrack.value?.uri === props.track.uri

	if (isCurrent) {
		togglePlayback()
	}
	else {
		await playTrack([props.track.uri])
	}
}
</script>

<style>

</style>

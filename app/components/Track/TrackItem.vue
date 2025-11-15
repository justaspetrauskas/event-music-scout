<template>
	<div class="track-item">
		<!-- <button
			class="play-btn"
			:class="{ playing: isPlaying }"
			title="Play preview"
			@click="emit('play')"
		>
			<Icon
				:name="isPlaying ? 'ic:baseline-pause': 'ic:baseline-play-arrow'"
				class="play-btn-icon"
			/>
		</button> -->
		<PlayButton
			:is-playing="isPlaying"
			@click="emit('play')"
		/>

		<div class="track-info">
			<div class="track-name">
				{{ track.name }}
			</div>
		</div>

		<div class="track-duration">
			{{ trackDuration }}
		</div>
	</div>
</template>

<script lang="ts" setup>
import type { Track } from "../../../types"
import PlayButton from "../UI/PlayButton.vue"

const { msToMinutesSeconds } = useUseUtilMethods()

const props = defineProps<{
	track: Track
	isPlaying: boolean
}>()

const emit = defineEmits<{
	play: []
}>()

const trackDuration = computed(() => {
	return msToMinutesSeconds(+props.track.duration)
})
</script>

<style>
.track-info {
  flex: 1;
  min-width: 0;
}

.track-name {
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-duration {
  font-size: 0.875rem;
  color: var(--pico-muted-color);
}

.track-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: var(--pico-border-radius);
  transition: background 0.2s;
}

.track-item:hover {
  background: var(--pico-secondary-background);
}

/* Play Button */
.play-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: var(--pico-primary);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  transition: background 0.2s;
  flex-shrink: 0;
  padding: 0;
  margin: 0;
}

.play-btn:hover {
  background: var(--pico-primary-hover);
}

.play-btn-icon {
	font-size: 1.25rem;
	color: var(--pico-background-color);
}
</style>

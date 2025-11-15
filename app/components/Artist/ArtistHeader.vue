<template>
	<div class="artist-header">
		<input
			type="checkbox"
			class="artist-checkbox"
			:checked="selected"
			@change="emit('toggle-select')"
		>

		<div class="artist-image">
			<img
				:src="artist.images[2]?.url"
				:alt="artist.name"
			>
		</div>

		<div class="artist-info">
			<div class="artist-name">
				{{ artist.name }}
			</div>
			<div class="artist-genres">
				<span
					v-for="genre in artist.genres"
					:key="genre"
					class="genre-tag"
				>
					{{ genre }}
				</span>
			</div>
		</div>

		<ArtistStats
			:popularity="artist.popularity"
			:followers="artist.followers"
		/>
	</div>
</template>

<script lang="ts" setup>
import type { Artist } from "../../../types"

defineProps<{
	artist: Artist
	selected: boolean
}>()

const emit = defineEmits<{
	"toggle-select": []
}>()
</script>

<style>
.artist-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.artist-checkbox {
  width: 20px;
  height: 20px;
  margin: 0;
  cursor: pointer;
}

.artist-image {
  width: 60px;
  height: 60px;
  border-radius: var(--pico-border-radius);
  background: var(--pico-secondary-background);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.artist-info {
  flex: 1;
  min-width: 0;
}

.artist-name {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.artist-genres {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
</style>

<template>
	<nav>
		<button
			role="button"
			class="secondary"
			@click="emit('toggle-select-all')"
		>
			{{ allSelected ? 'Deselect All' : 'Select All' }}
		</button>

		<button
			role="button"
			class="secondary"
			@click="emit('play-all')"
		>
			Play all
		</button>

		<button
			role="button"
			@click="emit('create-playlist')"
		>
			Create Playlist ({{ selectedCount }})
		</button>

		<span class="selection-count">
			{{ totalArtists }} artists found
		</span>
	</nav>
</template>

<script setup lang="ts">
defineProps<{
	selectedCount: number
	totalArtists: number
	allSelected: boolean
}>()

const emit = defineEmits<{
	"toggle-select-all": []
	"play-all": []
	"create-playlist": []
}>()
</script>

<style scoped>
.controls-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  padding: 1rem;
  border-radius: var(--pico-border-radius);
  margin-bottom: 1.5rem;
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
}

.controls-bar button {
  margin: 0;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.selection-count {
  margin-left: auto;
  color: var(--pico-muted-color);
  font-size: 0.875rem;
}
.with-icon {
  display: flex;
  flex-direction: row;
  column-gap: 12px;
}
</style>

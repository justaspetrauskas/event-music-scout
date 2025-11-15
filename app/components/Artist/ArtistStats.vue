<template>
	<div class="artist-stats">
		<div class="stat">
			<span>⭐</span>
			<span>{{ popularity }}/100</span>
		</div>
		<div class="stat">
			<span>👥</span>
			<span>{{ followers }}</span>
		</div>
	</div>
</template>

<script lang="ts" setup>
defineProps<{
	popularity: number
	followers: string
}>()
</script>

<style>
.artist-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--pico-muted-color);
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
</style>

<template>
	<div class="flex flex-row gap-3 py-4 px-4 bg-slate-200/60 rounded-lg">
		<button
			class="px-4 py-2 bg-spotify/80 text-white rounded-full font-medium hover:bg-spotify focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
			@click="emit('toggle-select')"
		>
			Select all tracks
		</button>
		<button
			class="px-4 py-2 border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
			@click="emit('follow-artist')"
		>
			Follow artist
		</button>
	</div>
</template>

<script lang="ts" setup>
const emit = defineEmits<{
	"toggle-select": []
	"follow-artist": []
}>()
</script>

<style>

</style>

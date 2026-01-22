<template>
	<span
		:key="genre"
		class="px-2 py-0.5 hover:text-spotify hover:border-spotify cursor-pointer bg-gray-200/60 text-gray-400 border border-gray-200 dark:text-white rounded-full text-xs capitalize"
	>
		{{ genre }}
	</span>
</template>

<script lang="ts" setup>
defineProps<{
	genre: string
}>()
</script>

<style>

</style>

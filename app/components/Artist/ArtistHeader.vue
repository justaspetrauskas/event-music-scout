<template>
	<div class="flex align-center flex-row justify-between w-full">
		<div class="flex flex-row gap-4">
			<div class="relative flex-shrink-0 w-20 h-20 rounded overflow-hidden bg-muted">
				<img
					:src="artist.images[0]?.url"
					:alt="artist.name"
					class="w-full h-full object-cover"
				>
			</div>

			<div class="flex flex-col items-start">
				<h3>
					{{ artist.name }}
				</h3>
				<div class="flex items-center gap-2 mt-auto">
					<ArtistStats
						:popularity="artist.popularity"
						:followers="artist.followers"
					/>
					<div class="flex flex-wrap gap-1.5 mt-auto">
						<span
							v-for="genre in artist.genres"
							:key="genre"
							class="px-2 py-0.5 bg-gray-200/60 text-gray-400 border border-gray-200 dark:text-white rounded-full text-xs capitalize"
						>
							{{ genre }}
						</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import type { Artist } from "@@/types"

defineProps<{
	artist: Artist
	selected: boolean
}>()

const emit = defineEmits<{
	"toggle-select": []
}>()
</script>

<style>

</style>

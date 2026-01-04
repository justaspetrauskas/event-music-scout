<template>
	<section class="flex flex-col gap-3">
		<div class="flex items-center border border-border rounded-lg p-4 justify-between">
			<div class="flex items-center gap-3">
				<div>
					<p className="font-medium">
						{{ selectedTracks.size }} tracks selected
					</p>
				<!-- <p className="text-sm text-muted-foreground">
					{event.artists.flatMap(a => a.topSongs).length} total tracks available
				</p> -->
				</div>
			</div>
			<div class="flex gap-2">
				<ButtonComponent
					@click="emit('toggle-select-all')"
				>
					Select all
				</ButtonComponent>
				<ButtonComponent
					variant="secondary"
					@click="emit('clear-selection')"
				>
					Clear
				</ButtonComponent>
			</div>
		</div>
		<div
			v-if="selectedTracks.size > 0"
			class="flex gap-4"
		>
			<ButtonComponent @click="emit('create-playlist')">
				Create spotify playlist
			</ButtonComponent>
			<ButtonComponent
				variant="secondary"
				@click="emit('add-to-existing-playlist')"
			>
				Add to existing playlist
			</ButtonComponent>
			<ButtonComponent variant="secondary">
				Start radio
			</ButtonComponent>
		</div>
	</section>
</template>

<script lang="ts" setup>
import { usePlaylistStore } from "~/stores/playlistStore"
import ButtonComponent from "../UI/ButtonComponent.vue"

const playlistStore = usePlaylistStore()
const { selectedTracks } = storeToRefs(playlistStore)

const emit = defineEmits<{
	"toggle-select-all": []
	"clear-selection": []
	"create-playlist": []
	"add-to-existing-playlist": []
}>()
</script>

<style>

</style>
